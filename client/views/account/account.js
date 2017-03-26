var pageSession = new ReactiveDict();

Template.account.onRendered(function() {
    pageSession.set('change-data', false);
    pageSession.set('change-password', false);
    pageSession.set('remove-account', false);
});

Template.account.helpers({
    changeData: function() {
        return pageSession.get('change-data');
    },
    changePassword: function() {
        return pageSession.get('change-password');
    },
    removeAccount: function() {
        return pageSession.get('remove-account');
    }
});

Template.account.events({
    "click #change-data": function(e, t) {
        e.preventDefault();

        pageSession.set('change-password', false);
        pageSession.set('remove-account', false);
        pageSession.set('change-data', true);
    },
    "click #change-password": function(e, t) {
        e.preventDefault();

        pageSession.set('change-data', false);
        pageSession.set('remove-account', false);
        pageSession.set('change-password', true);
    },
    "click #remove-account": function(e, t) {
        e.preventDefault();

        pageSession.set('change-data', false);
        pageSession.set('change-password', false);
        pageSession.set('remove-account', true);
    },
    "click #cancel": function(e, t) {
        e.preventDefault();

        pageSession.set('change-data', false);
        pageSession.set('change-password', false);
        pageSession.set('remove-account', false);
    },
    "click #accept-data": function(e, t) {
        e.preventDefault();

        var email = $('#email').val();
        var name = $('#name').val();

        if (isValidEmail(email) && name) {
            Meteor.call('changeUserData', email, name);

            pageSession.set('change-data', false);
            pageSession.set('change-password', false);
            pageSession.set('remove-account', false);

            alertify.success('Pomyślnie zmieniono dane.');
        } else {
            alertify.error('Wprowadzono niepoprawny adres e-mail.');
        }
    },
    "click #accept-password": function(e, t) {
        e.preventDefault();

        var oldPassword = $('#old-password').val();
        var newPassword = $('#new-password').val();
        var newPasswordConfirm = $('#new-password-confirm').val();

        if (newPassword === newPasswordConfirm) {
            Accounts.changePassword(oldPassword, newPassword, function(error) {
                if (error) {
                    alertify.error('Wprowadzono niepoprawne stare hasło.');
                } else {
                    pageSession.set('change-data', false);
                    pageSession.set('change-password', false);
                    pageSession.set('remove-account', false);

                    alertify.success('Pomyślnie zmieniono hasło.');
                }
            });
        } else {
            alertify.error('Potwierdzenie hasła nie zgadza się.');
        }
    },
    "click #accept-remove": function(e, t) {
        e.preventDefault();

        Meteor.call('removeUserAccount');

        Meteor.logout(function() {
            FlowRouter.go('login');
            alertify.success('Pomyślnie usunięto konto użytkownika.');
        });
    }
});