Template.sleapDetails.helpers({
    sleap: function() {
        return sleapData.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.sleapDetails.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('sleap');
    }
});

Template.sleapFileRow.helpers({
    file: function() {
        var sleapDataInstance = sleapData.findOne({_id: FlowRouter.getParam('id')});

        if (sleapDataInstance) {
            return sleapDataInstance.sleap_data.getFileRecord();
        }
    }
});