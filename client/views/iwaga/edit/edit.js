Template.iwagaEdit.onRendered(function() {
    $('#datepicker').datepicker({
        autoclose: true,
        todayHighlight: true,
        todayBtn: true,
        forceParse: false,
        keyboardNavigation: false,
        language: "pl"
    });
});

Template.iwagaEdit.helpers({
    iwaga: function() {
        return iwagaData.findOne({_id: FlowRouter.getParam('id')});
    }
});

Template.iwagaEdit.events({
    "click .button-back": function(e, t) {
        e.preventDefault();

        FlowRouter.go('iwaga');
    },
    "click .button-cancel": function(e, t) {
        e.preventDefault();

        FlowRouter.go('iwaga');
    },
    "click .button-accept": function(e, t) {
        e.preventDefault();

        var iwaga = iwagaData.findOne({_id: FlowRouter.getParam('id')});

        var editDate = new Date();
        editDate.setMinutes(editDate.getMinutes() + 60);

        if (iwaga) {
            var data = {
                measurement_id: $('#measurement-id').val(),
                user_id: $('#user-id').val(),
                weight: $('#weight').val(),
                ffm: $('#ffm').val(),
                bmi: $('#bmi').val(),
                saturation: $('#saturation').val(),
                pulse: $('#pulse').val(),
                measure_date: moment($('#datepicker').val(), 'DD-MM-YYYY', true).add(1, 'h').toDate(),
                insert_date: iwaga.insert_date,
                edit_date: editDate
            };

            Meteor.call('editIWagaRecord', iwaga._id, data);
            FlowRouter.go('iwaga');
            alertify.success('Pomyślnie edytowano rekord.');
        }
    }
});