var workflowTemplates = {
  toolbox:
    '<a id="workflowNewStage" href="#" class="button success">Add Stage</a> \
    <a id="workflowSave" href="#" class="button">Save</a>'
, editor:
    '<h3> \
      <span id="editorTitle"></span> \
      <small id="editorSubTitle"></small> \
    </h3> \
    <form id="editorBody"></form> \
    <div id="editorControls"> \
      <a id="editorSave" href="#" class="button" style="display: none;">Save</a> \
      <a id="editorCancel" href="#" class="button" style="display: none;">Cancel</a> \
      <a id="editorDelete" href="#" class="button alert" style="display: none;">Delete</a> \
    </div>'
, stage: '<div class="stage" id="{{id}}"></div>'
, stage_body: '<div class="name text-center">{{name}}</div>'
, stage_edit_form:
    '<label for="editStageName">Name:</label><input id="editStageName" type="text" name="stageName" value="{{name}}" /> \
     <label for="editStageDescription">Description:</label><textarea id="editStageDescription" type="text" name="description">{{description}}</textarea>'

, transition_edit_form:
    '<label for="editTransitionName">Name:</label><input id="editTransitionName" type="text" name="transitionName" value="{{name}}" /> \
     <label for="editTransitionDescription">Description:</label><textarea id="editTransitionDescription" type="text" name="description">{{description}}</textarea>'
    //  <h5>Actions</h5> \
    //  <label for="">Make an assignment to:</label> \
    //  <input id="assignmentOptionCurrentUser" type="radio" name="assignment_type" value="current_user"><label for="assignmentOptionCurrentUser">the current user</label><br/> \
    //  <input id="assignmentOptionGroup" type="radio" name="assignment_type" value="group"><label for="assignmentOptionGroup">a role</label><br/> \
    //  <select id="assignmentGroupSelector" name="group"><option value="">------</option></select> \
    //  <input id="assignmentOptionUser" type="radio" name="assignment_type" value="user"><label for="assignmentOptionUser">a user</label> \
    //  <select id="assignmentUserSelector" name="user"><option value="">------</option></select>';

, error_banner:
    '<div data-alert class="alert-box warning" >{{message}}<a href="#" class="close">&times;</a></div>'
};
