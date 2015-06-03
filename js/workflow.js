/*********************
 ** Workflow
 *********************/
var workspace, editor;
var reassignmentActionList = {};

var connectorPaintStyle = {
      lineWidth: 2,
      strokeStyle: "#008cba",
      joinstyle: "round",
      outlineColor: "white",
      outlineWidth: 0
    };

var sourceEndpoint = {
      endpoint: "Dot",
      paintStyle:{ fillStyle: "white", strokeStyle: "#008cba", radius: 4 },
      hoverPaintStyle: {
        fillStyle: "#43ac6a",
        strokeStyle: "#008cba"
      },
      connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],
      connectorStyle: connectorPaintStyle,
      maxConnections:-1,
      isSource: true,
    };

var targetEndpoint = {
      // anchor:[ "Perimeter", { shape:"Rectangle",anchorCount:150 } ],
      endpoint: "Dot",
      paintStyle:{ fillStyle: "none", strokeStyle: "#008cba", radius: 5 },
      hoverPaintStyle: {
        fillStyle:"#43ac6a",
        strokeStyle:"#008cba"
      },
      maxConnections:-1,
      dropOptions:{ activeClass: "active" }, //hoverClass: "hover",
      isTarget: true,
    };


function Stage(id, name) {
  if (id === undefined) {
    id = this.generateId();
  }

  this.id = id;
  this.name = name;
  this.description = '';
  this.status = 'DRAFT';
  this.elem;
  this.epTargetTopCenterUUID = 'epTargetTopCenter-' + this.id;
  this.epTargetBottomCenterUUID = 'epTargetBottomCenter-' + this.id;
  this.epTargetLeftMiddleUUID = 'epTargetLeftMiddle-' + this.id;
  this.epTargetRightMiddleUUID = 'epTargetRightMiddle-' + this.id;
  this.epSourceTopCenterUUID = 'epSourceTopCenter-' + this.id;
  this.epSourceBottomCenterUUID = 'epSourceBottomCenter-' + this.id;
  this.epSourceLeftMiddleUUID = 'epSourceLeftMiddle-' + this.id;
  this.epSourceRightMiddleUUID = 'epSourceRightMiddle-' + this.id;
  workspace.stage_list[this.id] = this;
  this.sourceOfTransitionList = [];
  this.targetOfTransitionList = [];
}

// ------- ------- ------- ------- ------- ------- ------- ------- -------
// ------- ------- ------- ------- ------- ------- ------- ------- -------

Stage.prototype.generateId = function() {
  var id = 'stage' + parseInt((Math.random() * 1000000));
  if (workspace.stage_list[this.id] !== undefined) {
    id = this.generateId();
  }

  return id;
};

Stage.prototype.createStageElement = function(top, left) {
  var html = Mustache.render(workflowTemplates.stage, this);
  workspace.workspace_elem.append(html);
  this.elem = $('#' + this.id);

  if (top !== undefined && left !== undefined) {
    this.elem.css({top: top, left: left});
  }

  this.render();

  var thisStage = this;

  this.elem.draggable({
    containment: workspace.workspace_elem,
    scroll: true,
    grid: [ 20, 20 ],
    stop: function() {
      thisStage.startDrag.call(thisStage);
    }

  });

  //workspace.plumbing.makeTarget($('#' + this.id), targetEndpoint);
  this.renderSourceEndpoints();
  this.bindEditEvents();
  this.status = 'OK';
};

Stage.prototype.bindEditEvents = function() {
  this.elem.click({stage: this}, this.edit);
};

Stage.prototype.startDrag = function() {
  workspace.plumbing.repaint(this.elem);
};

Stage.prototype.edit = function(event) {
  var stage = event.data.stage;
  var html = Mustache.render(workflowTemplates.stage_edit_form, stage);
  editor.setup.call(editor, event.data.stage.name, 'Stage', html, stage, stage.save, stage.cancelEditing, stage.delete);
  stage.elem.addClass('editing');
};

Stage.prototype.save = function(data) {
  if (this.status == 'DRAFT') {
    this.createStageElement();
  }

  this.name = data.stageName;
  this.description = data.description;
  this.elem.removeClass('editing');
  this.render();
};

Stage.prototype.delete = function(data) {
  for (var i = 0; i < this.sourceOfTransitionList.length; i++) {
    workspace.plumbing.detach(this.sourceOfTransitionList[i].connection);
    delete workspace.transition_list[this.sourceOfTransitionList[i].id];
  }
  for (var i = 0; i < this.targetOfTransitionList.length; i++) {
    workspace.plumbing.detach(this.targetOfTransitionList[i].connection);
    delete workspace.transition_list[this.targetOfTransitionList[i].id];
  }

  workspace.plumbing.deleteEndpoint(this.epTargetTopCenter);
  workspace.plumbing.deleteEndpoint(this.epTargetBottomCenter);
  workspace.plumbing.deleteEndpoint(this.epTargetLeftMiddle);
  workspace.plumbing.deleteEndpoint(this.epTargetRightMiddle);

  workspace.plumbing.deleteEndpoint(this.epSourceTopCenter);
  workspace.plumbing.deleteEndpoint(this.epSourceBottomCenter);
  workspace.plumbing.deleteEndpoint(this.epSourceLeftMiddle);
  workspace.plumbing.deleteEndpoint(this.epSourceRightMiddle);

  this.elem.remove();

  delete workspace.stage_list[this.id];
};

Stage.prototype.cancelEditing = function(data) {
  this.elem.removeClass('editing');
};

Stage.prototype.render = function() {
  var html = Mustache.render(workflowTemplates.stage_body, this);
  this.elem.html(html);
  workspace.plumbing.repaint(this.elem);
};

Stage.prototype.renderSourceEndpoints = function() {
  this.epTargetTopCenter = workspace.plumbing.addEndpoint(this.id, targetEndpoint, { anchor: "TopCenter", uuid: this.epTargetTopCenterUUID});
  this.epTargetBottomCenter = workspace.plumbing.addEndpoint(this.id, targetEndpoint, { anchor: "BottomCenter", uuid: this.epTargetBottomCenterUUID });
  this.epTargetLeftMiddle = workspace.plumbing.addEndpoint(this.id, targetEndpoint, { anchor: "LeftMiddle", uuid: this.epTargetLeftMiddleUUID });
  this.epTargetRightMiddle = workspace.plumbing.addEndpoint(this.id, targetEndpoint, { anchor: "RightMiddle", uuid: this.epTargetRightMiddleUUID });

  this.epSourceTopCenter = workspace.plumbing.addEndpoint(this.id, sourceEndpoint, { anchor: "TopCenter", uuid: this.epSourceTopCenterUUID});
  this.epSourceBottomCenter = workspace.plumbing.addEndpoint(this.id, sourceEndpoint, { anchor: "BottomCenter", uuid: this.epSourceBottomCenterUUID });
  this.epSourceLeftMiddle = workspace.plumbing.addEndpoint(this.id, sourceEndpoint, { anchor: "LeftMiddle", uuid: this.epSourceLeftMiddleUUID });
  this.epSourceRightMiddle = workspace.plumbing.addEndpoint(this.id, sourceEndpoint, { anchor: "RightMiddle", uuid: this.epSourceRightMiddleUUID });
};

Stage.prototype.addTransition = function(transition, type) {
  if (type === 'source') {
    this.sourceOfTransitionList = this.sourceOfTransitionList.concat(transition);
  } else if (type === 'target') {
    this.targetOfTransitionList = this.targetOfTransitionList.concat(transition);
  }
};

// ------- ------- ------- ------- ------- ------- ------- ------- -------
// ------- ------- ------- ------- ------- ------- ------- ------- -------

function Transition(connection) {
  this.id = connection.id;
  this.connection = connection;
  connection.addOverlay([ 'Label', { label: '', id: this.id + 'Label' } ]);
  this.overlay = connection.getOverlay(this.id + 'Label');
  this.sourceStage = workspace.stage_list[connection.sourceId];
  this.targetStage = workspace.stage_list[connection.targetId];
  this.name = '';
  this.description = '';
  workspace.transition_list[this.id] = this;
  this.reassignmentAction = undefined;

  this.sourceStage.addTransition(this, 'source');
  this.targetStage.addTransition(this, 'target');
}

Transition.prototype.edit = function() {
  var transition_name = this.name;
  if (transition_name === '') {
    transition_name = 'New Transition';
  }

  var html = Mustache.render(workflowTemplates.transition_edit_form, this);
  editor.setup.call(editor, transition_name, 'Transition', html, this, this.save, this.cancelEditing, this.delete);

  // $(group_list).each(function(){
  //   $('#assignmentGroupSelector').append('<option value="' + this.id + '">' + this.name + '</option>');
  // });
  //
  // $(user_list).each(function(){
  //   $('#assignmentUserSelector').append('<option value="' + this.id + '">' + this.name + '</option>');
  // });


  // if (this.reassignmentAction !== undefined) {
  //   editor.bodyElem.find('input[name="assignment_type"][value="' + this.reassignmentAction.type + '"]')[0].checked = true;
  //
  //   if (this.reassignmentAction.type == 'group') {
  //     editor.bodyElem.find('#assignmentGroupSelector').val(this.reassignmentAction.group);
  //   }
  //
  //   if (this.reassignmentAction.type == 'user') {
  //     editor.bodyElem.find('#assignmentUserSelector').val(this.reassignmentAction.user);
  //   }
  // }

  editor.bodyElem.find('input:first').focus();

  return false;
};

Transition.prototype.save = function(data) {
  this.name = data.transitionName;
  this.description = data.description;
  this.setLabel(this.name);

  if (this.reassignmentAction === undefined) {
    this.reassignmentAction = new ReassignmentAction(this, data.assignment_type, data.group, data.user);
  } else {
    this.reassignmentAction.save(data.assignment_type, data.group, data.user);
  }
};

Transition.prototype.delete = function(data) {
  workspace.plumbing.detach(this.connection);
  delete workspace.transition_list[this.id];
};

Transition.prototype.cancelEditing = function(data) {

};

Transition.prototype.setLabel = function(label) {
  this.overlay.setLabel(label);
};

// ------- ------- ------- ------- ------- ------- ------- ------- ---
// ------- ------- ------- ------- ------- ------- ------- ------- -------

function ReassignmentAction(transition, type, group, user) {
  this.transition = transition;
  this.type = type;
  this.group = group;
  this.user = user;
  reassignmentActionList[this.transition.id] = this;
}

ReassignmentAction.prototype.save = function(type, group, user) {
  this.type = type;
  this.user = user;
  this.group = group;
};

// ------- ------- ------- ------- ------- ------- ------- ------- -------
// ------- ------- ------- ------- ------- ------- ------- ------- -------

function Editor(editor_elem) {
  this.elem = editor_elem;
  this.titleElem = $('#editorTitle');
  this.subTitleElem = $('#editorSubTitle');
  this.bodyElem = $('#editorBody');
  this.saveElem = $('#editorSave');
  this.cancelElem = $('#editorCancel');
  this.deleteElem = $('#editorDelete');
  this.isDirty = false;

  var thisEditor = this;

  this.saveElem.click(this.save);
  this.bodyElem.submit(this.save);
  this.cancelElem.click(this.cancel);
  this.deleteElem.click(this.delete);
}

Editor.prototype.setup = function(title, subTitle, html, subject, saveEvent, cancelEvent, deleteEvent) {

  if (this.cancelEvent !== undefined) {
    this.cancel();
  }

  if (this.subject !== undefined) {
    this.clear();
  }

  this.setTitle(title);
  this.setSubTitle(subTitle);
  this.setBody(html);
  this.setsubject(subject);
  this.setSaveEvent(saveEvent);
  this.setCancelEvent(cancelEvent);
  this.setDeleteEvent(deleteEvent);

  this.bodyElem.find('input').change(function() {
    editor.isDirty = true;
  });
};

Editor.prototype.clear = function() {
  this.setTitle('');
  this.setSubTitle('');
  this.setBody('');
  this.saveEvent = undefined;
  this.cancelEvent = undefined;
  this.saveElem.hide();
  this.cancelElem.hide();
  this.deleteElem.hide();
  this.subject = undefined;
  this.isDirty = false;
};

Editor.prototype.setsubject = function(subject) {
  this.subject = subject;
};

Editor.prototype.setTitle = function(title) {
  this.titleElem.text(title);
};

Editor.prototype.setSubTitle = function(subTitle) {
  this.subTitleElem.text(subTitle);
};

Editor.prototype.setBody = function(html) {
  this.bodyElem.html(html);
};

Editor.prototype.setSaveEvent = function(saveEvent) {
  this.saveEvent = saveEvent;
  if (this.saveEvent !== undefined) {
    this.saveElem.show();
  }
};

Editor.prototype.setCancelEvent = function(cancelEvent) {
  this.cancelEvent = cancelEvent;
  if (this.cancelEvent !== undefined) {
    this.cancelElem.show();
  }
};

Editor.prototype.setDeleteEvent = function(deleteEvent) {
  this.deleteEvent = deleteEvent;
  if (this.deleteEvent !== undefined) {
    this.deleteElem.show();
  }
};

Editor.prototype.save = function(event) {
  var data = {};

  editor.bodyElem.find('input[type!="radio"], textarea, input[type="radio"]:checked, select').each(function() {
    data[$(this).attr('name')] = $(this).val();
  });

  editor.saveEvent.call(editor.subject, data);
  editor.clear();
  event.preventDefault();
};

Editor.prototype.cancel = function(event) {
  editor.cancelEvent.call(editor.subject);
  editor.clear();
  if (event !== undefined) {
    event.preventDefault();
  }
};

Editor.prototype.delete = function(event) {
  editor.deleteEvent.call(editor.subject);
  editor.clear();
  event.preventDefault();
};

// ------- ------- ------- ------- ------- ------- ------- ------- -------
// ------- ------- ------- ------- ------- ------- ------- ------- -------

var workspace = {
  stage_list: {}
, transition_list: {}
, initialize: function(data) {
    workspace.workspace_elem = data.workspace;
    workspace.editor_elem = data.editor;
    workspace.toolbox_elem = data.toolbox;
    workspace.saveEvent = data.save;

    // $('#workspace').height((($(window).height() - $('#workspace').position().top)) - 20);

    var editor_html = Mustache.render(workflowTemplates.editor);
    workspace.editor_elem.append(editor_html);

    var toolbox_html = Mustache.render(workflowTemplates.toolbox);
    workspace.toolbox_elem.append(toolbox_html);


    $('#workflowNewStage').click(function(event) {
      workspace.newStage();
      event.preventDefault();
    });

    $('#workflowSave').click(function(event) {
      var workflow_json = JSON.stringify(workspace.toJSON());
      workspace.saveEvent.call(workspace, workspace.toJSON());
      event.preventDefault();
    });

    jsPlumb.ready(function() {
      workspace.plumbing = jsPlumb.getInstance({
        DragOptions: {'cursor': 'pointer', 'zIndex': 2000},
        ConnectionOverlays: [
          ['Arrow', {location: 1}]
        ],
        Container: 'workspace'
      });
    });

    workspace.plumbing.bind("connectionDragStop", function(connection) {
      var transition = new Transition(connection);
      transition.edit();
    });

    workspace.plumbing.bind("click", function(conn, originalEvent) {
      workspace.transition_list[conn.id].edit.call(workspace.transition_list[conn.id]);
    });

    if (data.initial_data !== undefined) {
      workspace.fromJSON(data.initial_data);
    }

    editor = new Editor(data.editor);
  }
, newStage: function() {
    var html = Mustache.render(workflowTemplates.stage_edit_form, null);
    var stage = new Stage();
    editor.setup('New Stage', '', html, stage, stage.save, workspace.cancelNewStage);
    editor.bodyElem.find('input:first').focus();
  }
, cancelNewStage: function(data) {
    delete workspace.stage_list[this.id];
  }
, toJSON: function() {

    var stage_list = [];
    for (var stageId in workspace.stage_list) {
      var stage = workspace.stage_list[stageId];
      var stage_json = {
        "id": stage.id
      , "name": stage.name
      , "description": stage.description
      , "status": stage.status
      , "epTargetTopCenterUUID": stage.epTargetTopCenterUUID
      , "epTargetBottomCenterUUID": stage.epTargetBottomCenterUUID
      , "epTargetLeftMiddleUUID": stage.epTargetLeftMiddleUUID
      , "epTargetRightMiddleUUID": stage.epTargetRightMiddleUUID
      , "epSourceTopCenterUUID": stage.epSourceTopCenterUUID
      , "epSourceBottomCenterUUID": stage.epSourceBottomCenterUUID
      , "epSourceLeftMiddleUUID": stage.epSourceLeftMiddleUUID
      , "epSourceRightMiddleUUID": stage.epSourceRightMiddleUUID
      , "posX": stage.elem.position().left
      , "posY": stage.elem.position().top
      };

      stage_list = stage_list.concat(stage_json);
    }

    var transition_list = [];
    for (var transitionId in workspace.transition_list) {
      var transition = workspace.transition_list[transitionId];
      var transition_json = {
        "id": transition.id
      , "name": transition.name
      , "description": transition.description
      , "sourceStageId": transition.sourceStage.id
      , "targetStageId": transition.targetStage.id
      , "sourceEndpoint": transition.connection.endpoints[0].getUuid()
      , "targetEndpoint": transition.connection.endpoints[1].getUuid()
      , "reassignmentType": transition.reassignmentAction.type
      , "reassignmentGroup": transition.reassignmentAction.group
      , "reassignmentUser": transition.reassignmentAction.user
      };

      transition_list = transition_list.concat(transition_json);
    }

    var workflow_json = {
      "workflow": {
        "stage_list": stage_list
      , "transition_list": transition_list
      }
    };

    return workflow_json;
  }
, fromJSON: function(initial_data) {
    var stage_list = initial_data['workflow']['stage_list'];
    var transition_list = initial_data['workflow']['transition_list'];

    for (var i = 0; i < stage_list.length; i++) {
      var stageID = stage_list[i];

      var stage = new Stage(stageID.id);

      stage.name = stageID.name;
      stage.description = stageID.description;
      stage.status = stageID.status;

      stage.epTargetTopCenterUUID = stageID.epTargetTopCenterUUID;
      stage.epTargetBottomCenterUUID = stageID.epTargetBottomCenterUUID;
      stage.epTargetLeftMiddleUUID = stageID.epTargetLeftMiddleUUID;
      stage.epTargetRightMiddleUUID = stageID.epTargetRightMiddleUUID;
      stage.epSourceTopCenterUUID = stageID.epSourceTopCenterUUID;
      stage.epSourceBottomCenterUUID = stageID.epSourceBottomCenterUUID;
      stage.epSourceLeftMiddleUUID = stageID.epSourceLeftMiddleUUID;
      stage.epSourceRightMiddleUUID = stageID.epSourceRightMiddleUUID;

      stage.createStageElement(stageID.posY, stageID.posX);
    }

    for (var j = 0; j < transition_list.length; j++) {
      var transitionID = transition_list[j];

      var connection = workspace.plumbing.connect({
        uuids: [transitionID.sourceEndpoint, transitionID.targetEndpoint],
        connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],
        paintStyle: connectorPaintStyle
      });

      var transition = new Transition(connection);

      transition.name = transitionID.name;
      transition.description = transitionID.description;
      transition.setLabel(transition.name);

      transition.reassignmentAction = new ReassignmentAction(transition, transitionID.reassignmentType, transitionID.reassignmentGroup, transitionID.reassignmentUser);

    }

  }
};
