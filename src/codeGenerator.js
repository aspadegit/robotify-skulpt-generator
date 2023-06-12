/*
    This file generates the skulpt code, imported in index.js
    Separate from index.js for cleanliness
*/

//takes in information from index.js to generate skulpt code, then creates and returns the string
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
        
        let severusFunctionParameters = "";

        //add commas to parameters for the function
        functionList[i].parameters.forEach(function(element, index, array) {

            // add a comma if its not the last element in the parameters array
            severusFunctionParameters+=`Sk.ffi.remapToJs(${element})`;

            if (index != array.length-1) {
                severusFunctionParameters+=','
            }
        })

        let severusFunctionCall = `${functionList[i].severusName}(${severusFunctionParameters})`;

        //determine the type of function (for which helper function should be called)
        if(functionList[i].type === "Promise")
            code += generatePromiseFunction(functionList[i].skulptName, functionList[i].parameters, severusFunctionCall);
        else
            code += generateReturnFunction(functionList[i].skulptName, functionList[i].parameters, severusFunctionCall);
    }

    // string that is necessary for the end of the skulpt file
    let enderString = `

    return mod;
};
    `

    return code + enderString;

}

//=============================== HELPER FUNCTIONS ============================================================

//helper function that returns a skulpt code string for an individual promise function
function generatePromiseFunction(promiseName, promiseParam, severusFunctionCall)
{

    let promise = `
    mod.${promiseName} = new Sk.builtin.func(function ${promiseName}(${promiseParam.toString()}) {

    let susp = new Sk.misceval.Suspension();
    Sk.builtin.pyCheckArgsLen("${promiseName}", ${promiseParam.length}, ${promiseParam.length}, ${promiseParam.length});
    susp.resume = function () {
        if (susp.data["error"]) {
                throw new Sk.builtin.IOError(susp.data["error"].message);
        } else {
                return new Sk.builtin.int_(susp.data["result"]);
            }
        };

        susp.data = {
            type: "Sk.promise",
            promise: ${severusFunctionCall}.then(() => susp.resume())
        };

        return susp;
    });
`;

    return promise;
}

//helper function that returns a skulpt code string for an individual return function
function generateReturnFunction(returnName, returnParam, severusFunctionCall)
{
    return `
    mod.${returnName} = new Sk.builtin.func(function ${returnName}(${returnParam.toString()}) {
        let susp = new Sk.misceval.Suspension();
        Sk.builtin.pyCheckArgsLen("${returnName}", ${returnParam.length}, ${returnParam.length}, ${returnParam.length});
        return Sk.ffi.remapToPy(${severusFunctionCall});
    });
`;
}
