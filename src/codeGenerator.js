
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

        functionList[i].parameters.forEach(function(element, index, array) {
            // add a comma if its not the last element in the parameters array
            severusFunctionParameters+=`Sk.ffi.remapToJs(${element})`;

            if (index != array.length-1) {
                severusFunctionParameters+=','
            }
        })

        let severusFunctionCall = `${functionList[i].severusName}(${severusFunctionParameters})`;

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
