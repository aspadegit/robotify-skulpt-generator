# Skulpt Code Generator

## Running & Building
After your first clone, run `npm install`. This shouldn't be necessary after it has been run once, unless there are updates.<br><br>
To run, use `npm run start`.<br><br>
To build, use `npm run build`.

## How To Use
- This generator generates code based on the information in each of the input fields.
- Start with filling in the file name and project name.
- The **Choose an Existing Function** section contains a dropdown to edit or delete an existing function
    > __NOTE__: The `Delete` button will delete the **currently selected function in the dropdown.** This does not include unsaved functions created with the `New Function` button, but *does* affect a function selected with the `Edit` button.
- The `New Function` button shows the fields that allow you to edit a function and clears them in preparation for new information.
    > **NOTE**: This will clear any unsaved information filled out so far.
- The bottom half of the screen consists of all of the fields necessary for a single function
    - All fields available are required for this section
- The **Skulpt Function Name** and **Severus Function Name** sections are for the Skulpt and Severus names respectively. 
- The **Type** section contains a dropdown that allows you to select between a Promise function and a Return function.
- The **Parameters** section contains an `Add Parameters` button. You can click it to add a new parameter. Parameters each contain a `Delete` button, as well, to delete them.
- The **Argument Description** section contains fields for the types and descriptions of each parameter.
    >**NOTE**: Parentheses around the type are added automatically in the variable storage, so do not add them manually (they will be converted to underscores).
- The **Command** section shows the command that would be called. This is automatically generated based on other information.
- The **Description** contains a text area element that will take in the function's description. It can be dragged to be made bigger.
- The **Example** section allows you to write in example values for each of the parameters.
- The `Save Function` button saves all the fields as an object and stores it in the function list.
