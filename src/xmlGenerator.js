
export function convertToXML(fileName, projectName, functionList)
{
    var xmlDoc = document.implementation.createDocument(null, "skulptGenerator");

    var file = xmlDoc.createElement("file");
    var innerText = xmlDoc.createTextNode("test file name");

    file.appendChild(innerText);

    xmlDoc.documentElement.appendChild(file);

    console.log(xmlDoc);

    /*
    let blob = new Blob([new XMLSerializer().serializeToString(xmlDoc)], {type: 'text/xml'});
    
    let link = document.getElementById("saveLink");
  
    link.download = fileName + ".xml";
    link.href = URL.createObjectURL(blob);*/
}