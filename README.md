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
    > **NOTE**: When selecting `Promise & Return` as your type, the **Severus Function Name** section will change to **Severus Function Calls.** This does not autogenerate wrappers / casting of the variables & functions located in the `promise:` section, and must be entered manually.
- The **Parameters** section contains an `Add Parameters` button. You can click it to add a new parameter. Parameters each contain a `Delete` button, as well, to delete them.
- The **Argument Description** section contains fields for the types and descriptions of each parameter.
    >**NOTE**: Parentheses around the type are added automatically in the variable storage, so do not add them manually (they will be converted to underscores).
- The **Command** section shows the command that would be called. This is automatically generated based on other information.
- The **Description** contains a text area element that will take in the function's description. It can be dragged to be made bigger.
- The **Example** section allows you to write in example values for each of the parameters.
- The `Save Function` button saves all the fields as an object and stores it in the function list.
- The `Cancel Function` button cancels all edits of the function, and does not save the function if it is a new function.
- The `Save/Generate Skulpt` button at the top of the page will convert the data in the page to XML and save it using the file name you created.
- The `Load Skulpt` button at the top of the page will open the file explorer to allow you to select an XML file to load in previously created data.
    >**NOTE**: You can also load any XML file by dragging and dropping it anywhere on the page.

## Additional Notes
- Reloading the page will create a fresh skulpt file
    - Note that this will undo any changes you've made. Save the file if you wish to save your work before doing so.
- Any saved changes made to a function (with the `Save Function` button) will not be saved in the file unless you save the file itself again (from the top of the page).
- If you are creating a new function, or editing another function, the `Edit` button will override any unsaved work.