Template.iwagaDetails.helpers({
    iwaga: function() {
        return iwagaData.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.iwagaDetails.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('iwaga');
    }
});

Template.iwagaFileRow.helpers({
    file: function() {
        var iwagaDataInstance = iwagaData.findOne({_id: FlowRouter.getParam('id')});

        if (iwagaDataInstance.ekg_data) {
            return iwagaDataInstance.ekg_data.getFileRecord();
        }
    }
});