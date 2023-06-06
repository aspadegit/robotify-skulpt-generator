
export function generateCode(fileName, functionList)
{
    
    // string that is necessary for the beginning of the skulpt file
    let starterString = `
    let $builtinmodule = function (name) {
    let mod = {};
    mod.__name__ = new Sk.builtin.str("${fileName}");

    `

    let code = starterString;

    //loop over each function and add to the code
    for(let i = 0; i < functionList.length; i++)
    {
        
    }

    // string that is necessary for the end of the skulpt file
    let enderString = `

    return mod;
    };
    `

    return code + enderString;

}

function generatePromiseFunction(promiseName, promiseParam, severusName, severusParam)
{
    return "\ni'm a promise function named " + promiseName;
}

function generateReturnFunction(returnName, returnParam, severusName, severusParam)
{
    return "\ni'm a return function named" + returnName;
}
