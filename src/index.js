import './index.css';
import {generateCode} from './codeGenerator.js';
import { convertToXML, convertFromXML } from './xmlGenerator';

//different elements on the page that will be accessed by functions
const fileNameInput = document.getElementById("fileName");
const projectNameInput = document.getElementById("projectName");
const codeDisplay = document.getElementById("codeDisplay").firstChild;
const functionDropdown = document.getElementById("functionDropdown");
const skulptNameInput = document.getElementById("skulptNameInput");
const severusNameInput = document.getElementById("severusNameInput");
const paramListDiv = document.getElementById("paramList");
const typeDropdown = document.getElementById("typeDropdown");
const argumentDescription = document.getElementById("argumentDescription");
const commandText = document.getElementById("commandText");
const exampleText = document.getElementById("exampleText");
const functionDescription = document.getElementById("functionDescription");

const regex = /[^a-zA-Z0-9_]+/g;

var currentCode = "";
var editingPreviousName = ""; //for use when saving a function while editing

//current function & current parameter list (for editing a function)
var currentFunction = { function: null, index: -1 };

//these 3 all have the same indices (ex: parameter 0 = index 0, parameter 1 = index 1, etc.)
var currentParamList = [];  // list of variable names (for easy access / codeGenerator)
var currentParamData = [];  // list of {name, type, desc}
var exampleParameters = []; 

//overall function list; for generating code
var functionList = [];

//updates generatedCode & sets onclick functions
window.onload = function() 
{
    updateGeneratedCode();
    
    document.getElementById("saveButton").onclick = function() { convertToXML(fileNameInput.value, projectNameInput.value, functionList) };
    document.getElementById("saveFunction").onclick = function() { saveFunction() };
    document.getElementById("deleteFunctionBtn").onclick = function() { deleteFunction() };
    document.getElementById("editFunctionBtn").onclick = function() { editFunction() };
    document.getElementById("newFunctionBtn").onclick = function() { newFunction() };
    document.getElementById("addParamBtn").onclick = function() { addParameter() };
    document.getElementById("copySkulpt").onclick = function() { copyText("skulptCode") };
}

//================================ FUNCTION FUNCTIONS ===============================================

//saves a function to the dropdown & functionList variable & returns whether save was successful
function saveFunction()
{
    let selectedType = typeDropdown.options[typeDropdown.selectedIndex].text;

    //create the function
    let newFunction = {
        skulptName: skulptNameInput.value,
        severusName: severusNameInput.value,
        parameters: currentParamList,
        parameterData: currentParamData,
        type: selectedType,
        description: functionDescription.value,
        exampleParam: exampleParameters
    }

    //checking for duplicates / empty inputs
    let emptyContent = checkEmptyFields(newFunction);
    if(emptyContent != null)
    {
        alert('Cannot save function; ' + emptyContent + ' is empty and must contain content.');
        return false;
    }

    let duplicateName = checkDuplicateFunctionNames(newFunction);
    if(duplicateName != null)
    {
        alert('Cannot save function. The ' + duplicateName + ' function name already exists.');
        return false;
    }

    let duplicateParam = checkDuplicateParamNames(newFunction);
    if(duplicateParam != null)
    {
        alert('Cannot save function. Parameters ' + duplicateParam[0] + ' and ' + duplicateParam[1] + ' have the same name.');
        return false;
    }

    currentFunction.function = newFunction;

    //function is not in the list already
    if(currentFunction.index === -1)
    {
        //append the function to the dropdown
        var newOption = document.createElement("option");
        newOption.text = newFunction.skulptName;
        newOption.value = JSON.stringify(newFunction);
        functionDropdown.appendChild(newOption);

        currentFunction.index = functionDropdown.options.length-1;
        functionList.push(newFunction);

    }
    //function is in the list
    else
    {
        //update the list
        functionDropdown.options[currentFunction.index].text = newFunction.skulptName;
        functionDropdown.options[currentFunction.index].value = JSON.stringify(newFunction);

        functionList[currentFunction.index] = newFunction;
    }

    //update generated code
    updateGeneratedCode();

    //clear so that the user knows they definitely saved the function
    hideFunctionInfo();
    currentFunction.function = null;
    currentFunction.index = -1;
    clearFunctionInfo();
    
    return true;
}

//edits a function in the dropdown & returns whether it successfully loaded the edit
function editFunction()
{
    //the dropdown is empty / there are no functions to edit
    if(functionDropdown.options.length < 1)
        return false;
    
    showFunctionInfo();

    //grab the function we're editing
    let selectedIndex = functionDropdown.selectedIndex;
    let selectedFunction = JSON.parse(functionDropdown.options[selectedIndex].value);

    //update current function to what we're editing
    currentFunction.function = selectedFunction;
    currentFunction.index = selectedIndex;

    //update all the associated fields...
    skulptNameInput.value = selectedFunction.skulptName;
    severusNameInput.value = selectedFunction.severusName;
    functionDescription.value = selectedFunction.description;

    if(selectedFunction.type === "Promise")
        typeDropdown.selectedIndex = 0;
    else
        typeDropdown.selectedIndex = 1;

    //remove all the parameters and then add them back (to avoid dupes)
    paramListDiv.innerHTML = "";
    argumentDescription.innerHTML = "";
    
    currentParamList = [];
    currentParamData = [];
    for(let i = 0; i < selectedFunction.parameters.length; i++)
    {
        addParameter().value = selectedFunction.parameters[i];
    }

    //update argument desc
    currentParamList = selectedFunction.parameters;
    currentParamData = selectedFunction.parameterData;
    updateAllArgumentDesc();

    //update command
    updateCommandText();

    //update example
    exampleParameters = selectedFunction.exampleParam;
    updateExample();

    editingPreviousName = selectedFunction.skulptName;

    return true;

}

//sets up the page in preparation for editing a new function
function newFunction()
{
    showFunctionInfo();

    //say we're editing a new function
    currentFunction.function = null;
    currentFunction.index = -1;
    currentParamList = [];
    currentParamData = [];
    exampleParameters = [];

    //clear everything
    clearFunctionInfo();
}

//returns whether successfully deleted
function deleteFunction()
{
    //no functions in dropdown
    if(functionDropdown.options.length < 1)
        return false;
    
    //grab function from dropdown
    let selectedFunction = JSON.parse(functionDropdown.options[functionDropdown.selectedIndex].value);

    if(selectedFunction === null)
        return false;

    let shouldDelete = confirm('Are you sure you want to delete ' + selectedFunction.skulptName + '?');

    if(shouldDelete)
    {
        //if editing the function we're deleting, clear the stuff so you can't save a deleted function
        if(currentFunction.function != null && selectedFunction.skulptName === currentFunction.function.skulptName)
        {
            clearFunctionInfo();
            hideFunctionInfo();
        }

        //remove from lists & dropdown
        functionList.splice(functionDropdown.selectedIndex,1);
        functionDropdown.remove(functionDropdown.selectedIndex);

        updateGeneratedCode();

        return true;
    }

    return false;
}

//clears all the fields on the bottom half of the screen
function clearFunctionInfo()
{
    editingPreviousName = "";
    skulptNameInput.value = "";
    severusNameInput.value = "";
    typeDropdown.selectedIndex = 0;
    paramListDiv.innerHTML = "";
    argumentDescription.innerHTML = "";
    functionDescription.value = "";
    commandText.innerHTML = "No name given";
    exampleText.innerHTML = "No name given";
}

//sets everything on the bottom half of the screen to be invisible
function hideFunctionInfo()
{
    let functionDependentElements = document.getElementsByClassName("functionDependent");
    for(let i = 0; i < functionDependentElements.length; i++)
    {
        functionDependentElements.item(i).hidden = true;
    }
}

//sets everything on the bottom half of the screen to be visible
function showFunctionInfo()
{
    let functionDependentElements = document.getElementsByClassName("functionDependent");
    for(let i = 0; i < functionDependentElements.length; i++)
    {
        functionDependentElements.item(i).hidden = false;
    }
}

//for saving a function; returns the name of the first field it finds that is empty
function checkEmptyFields(newFunction)
{
    if(skulptNameInput.value === "")
        return "the skulpt function name";
    
    if(severusNameInput.value === "")
        return "the severus function name";
    
    for(let i = 0; i < newFunction.parameters.length; i++)
    {
        if(newFunction.parameters[i] === "")
            return "parameter " + i + "'s name";
        
        if(newFunction.parameterData[i].type === "" || newFunction.parameterData[i].type === "()")
            return "parameter " + i + "'s type";
        
        if(newFunction.parameterData[i].description === "")
            return "parameter " + i + "'s description";

        if(newFunction.exampleParam[i] === "")
            return "example parameter " + i;
        
        if(newFunction.exampleParam.length != newFunction.parameters.length)
            return "at least one of the example parameters";
    }

    if(newFunction.description === "")
        return "the function description";

    return null;
    
}

//returns whether it's a severus or skulpt name conflict, or null
function checkDuplicateFunctionNames(newFunction)
{
    for(let i = 0; i < functionList.length; i++)
    {
        //if the new name is in the list & it's not the name that it was before editing
        if(functionList[i].skulptName === newFunction.skulptName && newFunction.skulptName != editingPreviousName)
            return "skulpt";
        
    }

    return null;
}

//returns the two parameter indices that have a name conflict, or null
function checkDuplicateParamNames(newFunction)
{
    for(let i = 0; i < newFunction.parameters.length; i++)
    {
        for(let j = i+1; j < newFunction.parameters.length; j++)
        {
            if(newFunction.parameters[i] === newFunction.parameters[j])
                return [i,j];
        }
    }

    return null;
}

//================================= PARAMETER FUNCTIONS =============================================

//creates a parameter and returns the parameter input field
function addParameter() 
{
    currentParamList.push("");
    let newIndex = currentParamList.length-1;

    //setup label
    var newParameterLabel = document.createElement("label");
    newParameterLabel.innerText = "Parameter " + newIndex + ": ";

    //set up input field
    var newParameterInput = document.createElement("input");
    newParameterInput.type = "text";
    newParameterInput.id = "parameter" + newIndex;
    newParameterInput.addEventListener('input', parameterInputHandler);
    newParameterInput.addEventListener('propertychange', parameterInputHandler); //IE8

    //set up delete button
    var deleteBtn = document.createElement("button");
    deleteBtn.id = "delParameter" + newIndex;
    deleteBtn.innerHTML = "Delete";
    deleteBtn.style.marginLeft = "0.2em";
    deleteBtn.className = "btn";

    //put the new stuff into a div
    var newDiv = document.createElement("div");
    newDiv.style.margin = "0.2em";
    newDiv.appendChild(newParameterLabel);
    newDiv.appendChild(newParameterInput)
    newDiv.appendChild(deleteBtn);

    //delete button onclick
    deleteBtn.onclick = function() { deleteParameter(newDiv, newIndex) };

    //append the div to the parameter list section
    paramListDiv.appendChild(newDiv);

    //add a corresponding arg description
    addArgumentDescription(newIndex);

    //update everything that relies on parameters
    updateExample();
    updateCommandText();

    return newParameterInput; //for use in other functions
}

//returns whether successfully deleted
function deleteParameter(divToDelete, index)
{
    let shouldDelete = confirm('Are you sure you want to delete parameter ' + index + '?');

    if(shouldDelete)
    {
        //removes the div visually
        paramListDiv.removeChild(divToDelete);
        argumentDescription.removeChild(document.getElementById("argument"+index));

        //removes the parameter from all of the relevant lists
        currentParamList.splice(index, 1);
        currentParamData.splice(index, 1);
        exampleParameters.splice(index, 1);

        //update things that rely on parameters
        updateAllArgumentDesc();
        updateExample();
        
        //update all the remaining stuff that wasn't deleted
        for(let i = 0; i < currentParamList.length; i++)
        {
            let currentDiv = paramListDiv.children[i];
            currentDiv.children[0].innerText = "Parameter " + i + ": ";
            currentDiv.children[1].id = "parameter"+i;
            currentDiv.children[2].id = "delParameter"+i;
            currentDiv.children[2].onclick = function() { deleteParameter(currentDiv, i) };
            
        }

        return true;
    }

    return false;
}


//================================ ARGUMENT DESC FUNCTIONS =================================================

//adds a new HTML div of the argument description returns the div with all the HTML elements inside of it
function addArgumentDescription(index) 
{
    currentParamData.push({name:"", type:"", description:""});

    //the name of the parameter
    var paramName = document.createElement("input");
    paramName.setAttribute("disabled", true);
    
    //input for type of the parameter
    var typeInput = document.createElement("input");
    typeInput.setAttribute("placeholder", "Type (e.g. Number)");
    typeInput.id = "argTypeInput"+index;
    //type event listeners
    typeInput.addEventListener('input', argumentTypeInputHandler);
    typeInput.addEventListener('propertychange', argumentTypeInputHandler); //IE8

    //input for the parameter's description
    var descInput = document.createElement("input");
    descInput.setAttribute("placeholder", "Description of parameter");
    descInput.id = "argDescInput"+index;
    //description event listeners
    descInput.addEventListener('input', argumentDescriptionInputHandler);
    descInput.addEventListener('propertychange', argumentDescriptionInputHandler); //IE8

    //add all the above stuff to a div
    var containerDiv = document.createElement("div");
    containerDiv.appendChild(paramName);
    containerDiv.appendChild(typeInput);
    containerDiv.appendChild(descInput);

    //style the div
    containerDiv.style.margin = "0.4em";
    containerDiv.id = "argument" + index;

    //put the div on the page
    argumentDescription.appendChild(containerDiv);
    return containerDiv;
}

//updates a specific argument description element when editing a parameter name
function updateArgumentDescByIndex(index)
{
    let currentDiv = document.getElementById("argument"+index);
    currentDiv.children[0].value = `<strong>${currentParamData[index].name}</strong>:`;
    currentDiv.children[1].value = currentParamData[index].type;
    currentDiv.children[2].value = currentParamData[index].description;
}

//for when a parameter is deleted; updates the index ordering of the parameters
function updateAllArgumentDesc()
{
    for(let i = 0; i < argumentDescription.children.length; i++)
    {
        let currentDiv = argumentDescription.children[i];
        currentDiv.id = "argument" + i;
        currentDiv.children[0].value = `<strong>${currentParamData[i].name}</strong>:`;
        currentDiv.children[1].value = currentParamData[i].type;
        currentDiv.children[2].value = currentParamData[i].description;
    
    }
}

//================================ MISC. FUNCTIONS ====================================================

//pulls from data elsewhere to update the text under the command heading
function updateCommandText()
{
    //command is name.skulptName(parameters)
    let name = fileNameInput.value;
    let skulptName = skulptNameInput.value;

    let text = name + "." + skulptName + "(";

    for(let i = 0; i < currentParamList.length; i++)
    {
        text += currentParamList[i] + ", ";
    }

    //cut off comma
    if(currentParamList.length > 0)
        text = text.substring(0, text.length-2);
    text += ")";
    
    commandText.innerHTML = text;

}

//updates the example text by recreating the input boxes
function updateExample()
{
    //creates the text for name.skulptName(
    let name = fileNameInput.value;
    let skulptName = skulptNameInput.value;
    exampleText.innerHTML = "";

    let text = name + "." + skulptName + "(";
    exampleText.innerText = text;

    //create the input boxes
    for(let i = 0; i < currentParamList.length; i++)
    {
        let newInput = document.createElement("input");
        newInput.id = "exampleParamInput" + i;
        newInput.setAttribute("size", "5");

        //checking if they already had some values in there
        if(exampleParameters != null)
        {
            if(i < exampleParameters.length)
                newInput.value = exampleParameters[i];
        }

        //input handlers to update exampleParameters
        newInput.addEventListener('input', exampleParamInputHandler);
        newInput.addEventListener('propertychange', exampleParamInputHandler); //IE8

        //add it to the HTML parent
        exampleText.appendChild(newInput);

        //comma between entries
        if(i != currentParamList.length-1)
            exampleText.appendChild(document.createTextNode(","));
    }

    //puts the last section (right parentheses) on the page 
    exampleText.appendChild(document.createTextNode(")"));

}

//updates the generated skulpt code box using the generateCode function in codeGenerator.js
function updateGeneratedCode()
{

    currentCode = generateCode(fileNameInput.value, functionList);
    codeDisplay.innerHTML = currentCode;
}

//clears all data in preparation for loading
function clearAll()
{
    fileNameInput.value = "";
    projectNameInput.value = "";
    functionDropdown.innerHTML = "";
    functionList = [];
    currentFunction = { function: null, index: -1 };
    currentParamList = [];  
    currentParamData = [];  
    exampleParameters = [];
    clearFunctionInfo();
    hideFunctionInfo();
    updateGeneratedCode();
}

//copies text to the clipboard; used for generated code
function copyText(id)
{
    let text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
  
}


//===================================== INPUT HANDLERS ====================================================

//when the user types in a new file name, the code is updated
const fileNameInputHandler = function(e) {
    fileNameInput.value = fileNameInput.value.replace(regex, "_");
    updateCommandText();
    updateExample();
    updateGeneratedCode();
}
fileNameInput.addEventListener('input', fileNameInputHandler);
fileNameInput.addEventListener('propertychange', fileNameInputHandler); //IE8


//when the user types in a new project name, the code is updated
const projectNameInputHandler = function(e) {
    projectNameInput.value = projectNameInput.value.replace(regex, "_");

}
projectNameInput.addEventListener('input', projectNameInputHandler);
projectNameInput.addEventListener('propertychange', projectNameInputHandler); //IE8

//when the user types in a new function skulpt name, the code is updated
const skulptNameInputHandler = function(e) {
    skulptNameInput.value = skulptNameInput.value.replace(regex, "_");
    updateCommandText();
    updateExample();
}
skulptNameInput.addEventListener('input', skulptNameInputHandler);
skulptNameInput.addEventListener('propertychange', skulptNameInputHandler); //IE8

//when the user types in a new severus function name, the code is updated
const severusNameInputHandler = function(e) {
    severusNameInput.value = severusNameInput.value.replace(regex, "_");
}
severusNameInput.addEventListener('input', severusNameInputHandler);
severusNameInput.addEventListener('propertychange', severusNameInputHandler); //IE8

//for when any of the parameters are updated (listeners added on their initialization)
const parameterInputHandler = function(e) {

    //grab the index & adjust regex for the name
    let paramIndex = parseInt(e.target.id.substring(9));
    let paramName = e.target.value.replace(regex, "_");
    e.target.value = paramName;

    //it's a new value
    if(currentParamList.length-1 < paramIndex)
    {
        currentParamList.push(paramName);
        currentParamData.push({name:paramName, type:"", description:""})
    }
    //edit an existing value
    else
    {
        currentParamList[paramIndex] = paramName; 
        currentParamData[paramIndex].name = paramName; 
    }

    //update argument description
    updateArgumentDescByIndex(paramIndex);

    //update command text
    updateCommandText();

}

//for when any type fields (in argument desc) are updated
const argumentTypeInputHandler = function(e) {
    
    //grab the index & adjust regex for the name
    let index = parseInt(e.target.id.substring(12));
    let value = e.target.value.replace(regex, "_");  
    e.target.value = value;

    //types are added afterwards
    if(value.length > 0)
    {
        if(value[0] != "(")
            value = "(" + value;
        
        if(value[value.length-1] != ")")
            value += ")";
    }
    currentParamData[index].type = value;

}

//for when any description fields  (in argument desc) are updated
const argumentDescriptionInputHandler = function(e) {
    let index = parseInt(e.target.id.substring(12));
    currentParamData[index].description = e.target.value;
}

//for whenever an individual field in the example parameters is changed
    //adjusts the regex & updates the value in the code
const exampleParamInputHandler = function(e) {

    let index = parseInt(e.target.id.substring(17));
    
    let value = e.target.value.replace(regex, "_");
    e.target.value = value;  

    //avoids accidentally pushing an extra value
    if(index < exampleParameters.length)
        exampleParameters[index] = value;
    else   
        exampleParameters.push(value);
}

//for loading from a file
const loader = document.getElementById('loadButton');
loader.addEventListener('change', (event) => {

  //get the files that were loaded
  const fileList = event.target.files;

  //reads the content of the file the user loaded
  if(fileList.length > 0)
  {
    var reader = new FileReader();
    reader.readAsText(fileList[0], "UTF-8");
    reader.onload = function (e) {

        //gets the page obj file with this function (from xmlGenerator.js)
        let skulptObj = convertFromXML(e.target.result);

        //clear fields in preparation for loading
        clearAll();

        fileNameInput.value = skulptObj.fileName;
        projectNameInput.value = skulptObj.projectName;
        
        //functions
        functionList = skulptObj.functionList;
        for(let i = 0; i < functionList.length; i++)
        {
            //append the function to the dropdown
            var newOption = document.createElement("option");
            newOption.text = functionList[i].skulptName;
            newOption.value = JSON.stringify(functionList[i]);
            functionDropdown.appendChild(newOption);
    
        }

        updateGeneratedCode();

        //reset the loader
        loader.value = "";

    }
  }

});