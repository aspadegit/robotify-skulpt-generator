import './index.css';
import {generateCode} from './codeGenerator.js';

//TODO: test deleting and adding functions in different patterns
//TODO: block empty functions saving?
//TODO: replacing special characters in names?

const fileNameInput = document.getElementById("fileName");
const projectNameInput = document.getElementById("projectName");
const codeDisplay = document.getElementById("codeDisplay").firstChild;
const functionDropdown = document.getElementById("functionDropdown");
const skulptNameInput = document.getElementById("skulptNameInput");
const severusNameInput = document.getElementById("severusNameInput");
const paramListDiv = document.getElementById("paramList");
const typeDropdown = document.getElementById("typeDropdown");

var currentCode = "";

//current function & current parameter list (for editing a function)
var currentFunction = { function: null, index: -1 };
var currentParamList = [];

//overall function list; for generating code
var functionList = [];

window.onload = function() 
{
    updateGeneratedCode();
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
        type: selectedType
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

    if(selectedFunction.type === "Promise")
        typeDropdown.selectedIndex = 0;
    else
        typeDropdown.selectedIndex = 1;

    //remove all the parameters and then add them back
    paramListDiv.innerHTML = "";
    
    currentParamList = [];
    for(let i = 0; i < selectedFunction.parameters.length; i++)
    {
        addParameter().value = selectedFunction.parameters[i];
    }
    return true;

}

function newFunction()
{
    showFunctionInfo();

    //say we're editing a new function
    currentFunction.function = null;
    currentFunction.index = -1;
    currentParamList = [];

    //clear everything
    clearFunctionInfo();
}

//returns whether successfully deleted
function deleteFunction()
{
    if(currentFunction.function === null)
        return false;

    let shouldDelete = confirm('Are you sure you want to delete ' + currentFunction.function.skulptName + '?');

    if(shouldDelete)
    {
        functionDropdown.remove(functionDropdown.selectedIndex);
        clearFunctionInfo();

        functionList.splice(currentFunction.index,1);
        updateGeneratedCode();

        currentFunction.function = null;
        currentFunction.index = -1;

        return true;
    }

    return false;
}

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
        currentParamList.splice(index, 1);
        
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

//when the user types in a new file name, the code is updated
const fileNameInputHandler = function(e) {
    updateGeneratedCode();
}

fileNameInput.addEventListener('input', fileNameInputHandler);
fileNameInput.addEventListener('propertychange', fileNameInputHandler); //IE8


//when the user types in a new project name, the code is updated
const projectNameInputHandler = function(e) {
    
}
projectNameInput.addEventListener('input', projectNameInputHandler);
projectNameInput.addEventListener('propertychange', projectNameInputHandler); //IE8

//for when any of the parameters are updated
const parameterInputHandler = function(e) {
    let paramIndex = parseInt(e.target.id.substring(9));

    //it's a new value
    if(currentParamList.length-1 < paramIndex)
    {
        currentParamList.push(e.target.value);
    }
    //edit an existing value
    else
    {
        currentParamList[paramIndex] = e.target.value;
    }

}


function updateGeneratedCode()
{
    currentCode = generateCode(fileNameInput.value, functionList);
    codeDisplay.innerHTML = currentCode;
}