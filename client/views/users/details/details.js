Template.userDetails.helpers({
    user: function() {
        return domesticUsers.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.userDetails.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('domesticUsers');
    }
});