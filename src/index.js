import './index.css';

const fileNameInput = document.getElementById("fileName");
const projectNameInput = document.getElementById("projectName");
const codeDisplay = document.getElementById("codeDisplay").firstChild;

var currentCode = "";
var functionList = [];


//when the user types in a new file name, the code is updated
const fileNameInputHandler = function(e) {
    codeDisplay.innerHTML = e.target.value;
}

fileNameInput.addEventListener('input', fileNameInputHandler);
fileNameInput.addEventListener('propertyChange', fileNameInputHandler); //IE8


//when the user types in a new project name, the code is updated
const projectNameInputHandler = function(e) {
    
}
projectNameInput.addEventListener('input', projectNameInputHandler);
projectNameInput.addEventListener('propertyChange', projectNameInputHandler); //IE8


function updateGeneratedCode()
{
    codeDisplay.innerHTML = currentCode;
}