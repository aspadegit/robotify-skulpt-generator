import './index.css';
import {generateCode} from './codeGenerator.js';
import { convertToXML } from './xmlGenerator';

//TODO: test deleting and adding functions in different patterns
//TODO: block empty functions saving?
//TODO: replacing special characters in names?
//TODO: make current function actually respond. to being a current function
    // currently only updates current function on save
    // will need input handlers
    // also TODO: revisit deleting a function after doing this
    //may not need to do this
//TODO: copy text buttons

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

var currentCode = "";

//current function & current parameter list (for editing a function)
var currentFunction = { function: null, index: -1 };
var currentParamList = [];  // list of variable names (for easy access / codeGenerator)
var currentParamData = [];  // list of {name, type, desc}
var exampleParameters = [];

//overall function list; for generating code
var functionList = [];

window.onload = function() 
{
    updateGeneratedCode();
    convertToXML(fileNameInput.value, projectNameInput.value, functionList);
    document.getElementById("saveFunction").onclick = function() { saveFunction() };
    document.getElementById("deleteFunctionBtn").onclick = function() { deleteFunction() };
    document.getElementById("editFunctionBtn").onclick = function() { editFunction() };
    document.getElementById("newFunctionBtn").onclick = function() { newFunction() };
    document.getElementById("addParamBtn").onclick = function() { addParameter() };
}

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

}

//returns whether it successfully loaded the edit
function editFunction()
{
    if(functionDropdown.options.length < 1)
        return false;
    
    showFunctionInfo();

    let selectedIndex = functionDropdown.selectedIndex;
    let selectedFunction = JSON.parse(functionDropdown.options[selectedIndex].value);

    //update what current function we're editing
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

    //remove all the parameters and then add them back
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

    return true;

}

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
    if(functionDropdown.options.length < 1)
        return false;
    
    //currentFunction.function = JSON.parse(functionDropdown.options[functionDropdown.selectedIndex].value);
    let selectedFunction = JSON.parse(functionDropdown.options[functionDropdown.selectedIndex].value);

    if(selectedFunction === null)
        return false;

    let shouldDelete = confirm('Are you sure you want to delete ' + selectedFunction.skulptName + '?');

    if(shouldDelete)
    {
        functionList.splice(functionDropdown.selectedIndex,1);
        functionDropdown.remove(functionDropdown.selectedIndex);

        updateGeneratedCode();

        return true;
    }

    return false;
}

//returns the parameter input field
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

    addArgumentDescription(newIndex);
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
        //removes the div visually & programmatically
        paramListDiv.removeChild(divToDelete);
        argumentDescription.removeChild(document.getElementById("argument"+index));

        currentParamList.splice(index, 1);
        currentParamData.splice(index, 1);
        exampleParameters.splice(index, 1);

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

function clearFunctionInfo()
{
    skulptNameInput.value = "";
    severusNameInput.value = "";
    typeDropdown.selectedIndex = 0;
    paramListDiv.innerHTML = "";
    argumentDescription.innerHTML = "";
    functionDescription.value = "";
    commandText.innerHTML = "No name given";
    exampleText.innerHTML = "No name given";
}

function hideFunctionInfo()
{
    let functionDependentElements = document.getElementsByClassName("functionDependent");
    for(let i = 0; i < functionDependentElements.length; i++)
    {
        functionDependentElements.item(i).hidden = true;
    }
}

function showFunctionInfo()
{
    let functionDependentElements = document.getElementsByClassName("functionDependent");
    for(let i = 0; i < functionDependentElements.length; i++)
    {
        functionDependentElements.item(i).hidden = false;
    }
}

//returns the div with all the HTML elements inside of it
function addArgumentDescription(index) 
{
    currentParamData.push({name:"", type:"", description:""});

    var paramName = document.createElement("input");
    paramName.setAttribute("disabled", true);
    
    var typeInput = document.createElement("input");
    typeInput.setAttribute("placeholder", "Type (e.g. Number)");
    typeInput.id = "argTypeInput"+index;
    typeInput.addEventListener('input', argumentTypeInputHandler);
    typeInput.addEventListener('propertychange', argumentTypeInputHandler); //IE8

    var descInput = document.createElement("input");
    descInput.setAttribute("placeholder", "Description of parameter");
    descInput.id = "argDescInput"+index;
    descInput.addEventListener('input', argumentDescriptionInputHandler);
    descInput.addEventListener('propertychange', argumentDescriptionInputHandler); //IE8

    var containerDiv = document.createElement("div");
    containerDiv.appendChild(paramName);
    containerDiv.appendChild(typeInput);
    containerDiv.appendChild(descInput);

    containerDiv.style.margin = "0.2em";
    containerDiv.id = "argument" + index;

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

//pulls from data elsewhere to update the text under the command heading
function updateCommandText()
{
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
            if(i < exampleParameters.length-1)
                newInput.value = exampleParameters[i];
            else
                exampleParameters.push("");
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

    exampleText.appendChild(document.createTextNode(")"));

}


function updateGeneratedCode()
{

    currentCode = generateCode(fileNameInput.value, functionList);
    codeDisplay.innerHTML = currentCode;
}

//===================================== INPUT HANDLERS ====================================================

//when the user types in a new file name, the code is updated
const fileNameInputHandler = function(e) {
    updateCommandText();
    updateGeneratedCode();
}

fileNameInput.addEventListener('input', fileNameInputHandler);
fileNameInput.addEventListener('propertychange', fileNameInputHandler); //IE8


//when the user types in a new project name, the code is updated
const projectNameInputHandler = function(e) {
    
}
projectNameInput.addEventListener('input', projectNameInputHandler);
projectNameInput.addEventListener('propertychange', projectNameInputHandler); //IE8

const skulptNameInputHandler = function(e) {
    updateCommandText();
    updateExample();
}
skulptNameInput.addEventListener('input', skulptNameInputHandler);
skulptNameInput.addEventListener('propertychange', skulptNameInputHandler); //IE8

//for when any of the parameters are updated
const parameterInputHandler = function(e) {
    let paramIndex = parseInt(e.target.id.substring(9));

    //it's a new value
    if(currentParamList.length-1 < paramIndex)
    {
        currentParamList.push(e.target.value);
        currentParamData.push({name:e.target.value, type:"", description:""})
    }
    //edit an existing value
    else
    {
        currentParamList[paramIndex] = e.target.value; 
        currentParamData[paramIndex].name = e.target.value; 
    }

    //update argument description
    updateArgumentDescByIndex(paramIndex);

    //update command text
    updateCommandText();

}

//for when any type fields (argument desc) are updated
const argumentTypeInputHandler = function(e) {
    
    let index = parseInt(e.target.id.substring(12));
    currentParamData[index].type = e.target.value;

}

//for when any description fields  (in argument desc) are updated
const argumentDescriptionInputHandler = function(e) {
    let index = parseInt(e.target.id.substring(12));
    currentParamData[index].description = e.target.value;
}

const exampleParamInputHandler = function(e) {
    let index = parseInt(e.target.id.substring(17));

    if(index < exampleParameters.length)
        exampleParameters[index] = e.target.value;
    else   
        exampleParameters.push(e.target.value);
}
