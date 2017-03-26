Template.userEdit.onRendered(function() {
    $('#datepicker').datepicker({
        autoclose: true,
        todayHighlight: true,
        todayBtn: true,
        forceParse: false,
        keyboardNavigation: false,
        language: "pl"
    });
});

Template.userEdit.helpers({
    user: function() {
        return domesticUsers.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.userEdit.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('domesticUsers');
    },
    "click .button-cancel": function(e, t) {
        e.preventDefault();

        FlowRouter.go('domesticUsers');
    },
    "click .button-accept": function(e, t) {
        e.preventDefault();

        var user = domesticUsers.findOne({_id: FlowRouter.getParam('id')});

        var editDate = new Date();
        editDate.setMinutes(editDate.getMinutes() + 60);

        if (user) {
            var data = {
                user_id: $('#user-id').val(),
                type: $('#type').val(),
                first_name: $('#first-name').val(),
                last_name: $('#last-name').val(),
                dob: moment($('#datepicker').val(), 'DD-MM-YYYY', true).add(1, 'h').toDate(),
                height: $('#height').val(),
                insert_date: user.insert_date,
                edit_date: editDate
            };

            Meteor.call('editUsersRecord', user._id, data);
            FlowRouter.go('domesticUsers');
            alertify.success('Pomyślnie edytowano rekord.');
        }
    }
});