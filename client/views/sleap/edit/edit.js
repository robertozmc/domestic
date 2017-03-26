Template.sleapEdit.onRendered(function() {
    $('#datepicker').datepicker({
        autoclose: true,
        todayHighlight: true,
        todayBtn: true,
        forceParse: false,
        keyboardNavigation: false,
        language: "pl"
    });
});

Template.sleapEdit.helpers({
    sleap: function() {
        return sleapData.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.sleapEdit.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('sleap');
    },
    "click .button-cancel": function(e, t) {
        e.preventDefault();

        FlowRouter.go('sleap');
    },
    "click .button-accept": function(e, t) {
        e.preventDefault();

        var sleap = sleapData.findOne({_id: FlowRouter.getParam('id')});

        var editDate = new Date();
        editDate.setMinutes(editDate.getMinutes() + 60);

        if (sleap) {
            var data = {
                measurement_id: $('#measurement-id').val(),
                user_id: $('#user-id').val(),
                weight: $('#weight').val(),
                ffm: $('#ffm').val(),
                bmi: $('#bmi').val(),
                saturation: $('#saturation').val(),
                pulse: $('#pulse').val(),
                measure_date: moment($('#datepicker').val(), 'DD-MM-YYYY', true).add(1, 'h').toDate(),
                insert_date: sleap.insert_date,
                edit_date: editDate
            };

            Meteor.call('editSleApRecord', sleap._id, data);
            FlowRouter.go('sleap');
            alertify.success('Pomyślnie edytowano rekord.');
        }
    }
});