
export function convertToXML(fileName, projectName, functionList)
{
    var xmlDoc = document.implementation.createDocument(null, "skulptGenerator");

    //create file name node & put the name inside it
    var file = xmlDoc.createElement("file");
    file.appendChild(addText(xmlDoc, fileName));

    //create project name node & put the name inside it
    var project = xmlDoc.createElement("project");
    project.appendChild(addText(xmlDoc, projectName));

    //append the file & project nodes to the document
    xmlDoc.documentElement.appendChild(file);
    xmlDoc.documentElement.appendChild(project);

    //add all of the functions to a functions list
    var functions = xmlDoc.createElement("functions");
    for(let i = 0; i < functionList.length; i++)
    {
        functions.appendChild(functionToXML(xmlDoc, functionList[i]));
    }

    xmlDoc.documentElement.appendChild(functions);

    let blob = new Blob([new XMLSerializer().serializeToString(xmlDoc)], {type: 'application/xml'});
    
    let link = document.getElementById("saveLink");
  
    link.download = fileName + ".xml";
    link.href = URL.createObjectURL(blob);
}

export function convertFromXML(xmlString)
{
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "application/xml");
    console.log(xml);

}


// ========================================= HELPER FUNCTIONS ==============================================

function functionToXML(xmlDoc, currentFunction)
{
    var functionNode = xmlDoc.createElement("function");

    //put skulpt's text value in and then append it to the function
    var skulpt = createAddText(xmlDoc, "skulpt", currentFunction.skulptName);
    functionNode.appendChild(skulpt);

    //put severus's text value in then append to the function
    var severus = createAddText(xmlDoc, "severus", currentFunction.severusName);
    functionNode.appendChild(severus);

    var parameterNode = xmlDoc.createElement("parameters");
    //append parameters
        //note: stores parameters and parameter data together, since they have the same indices and paramData has names
    for(let i = 0; i < currentFunction.parameterData.length; i++)
    {
        parameterNode.appendChild(parameterToXML(xmlDoc, currentFunction.parameterData[i]));
    }

    functionNode.appendChild(parameterNode);

    //append function's type
    var type = createAddText(xmlDoc, "type", currentFunction.type);
    functionNode.appendChild(type);

    //append function's description
    var description = createAddText(xmlDoc, "description", currentFunction.description);
    functionNode.appendChild(description);

    //append each of the example parameters
    var exampleParameters = xmlDoc.createElement("exampleParameters");
    for(let i = 0; i < currentFunction.exampleParam.length; i++)
    {
        let newParam = createAddText(xmlDoc, "exampleParameter", currentFunction.exampleParam[i]);
        exampleParameters.appendChild(newParam);
    }
    functionNode.appendChild(exampleParameters);

    //append the final function to the xml
    return functionNode;

}


function parameterToXML(xmlDoc, currentParameter)
{
    var parameter = xmlDoc.createElement("parameter");
    
    //name
    var name = createAddText(xmlDoc, "name", currentParameter.name);
    parameter.appendChild(name)

    //type
    var type = createAddText(xmlDoc, "paramType", currentParameter.type);
    parameter.appendChild(type);

    //description
    var desc = createAddText(xmlDoc, "paramDescription", currentParameter.description);
    parameter.appendChild(desc);

    return parameter;
}

//creates an element and adds text to it
    //for use in tags that only have a single text element inside
function createAddText(xmlDoc, elementName, text)
{
    var newElement = xmlDoc.createElement(elementName);
    newElement.appendChild(addText(xmlDoc, text));
    return newElement;
}

//slightly shorter to type; easier to read
function addText(xmlDoc, text)
{
    return xmlDoc.createTextNode(text);
}