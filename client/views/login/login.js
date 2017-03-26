var pageSession = new ReactiveDict();

Template.login.onCreated(function() {
    pageSession.set('errorMessage', '');
});

Template.login.helpers({
    errorMessage: function() {
        return pageSession.get('errorMessage');
    },
    path: function(type) {
        switch (type) {
            case 'register':
                return FlowRouter.path('register');
            case 'forgot':
                return FlowRouter.path('forgot');
            default:
                return false;
        }
    }
});

Template.login.events({
    submit: function(e, t) {
        e.preventDefault();
        pageSession.set('errorMessage', '');

		var login_email = t.find('#login_email').value.trim();
		var login_password = t.find('#login_password').value;

		// check email
		if (login_email === '') {
			pageSession.set('errorMessage', 'Proszę wprowadzić adres e-mail.');
			t.find('#login_email').focus();
			return false;
		}
		if (!isValidEmail(login_email)) {
			pageSession.set('errorMessage', 'Proszę wprowadzić prawidłowy adres e-mail.');
			t.find('#login_email').focus();
			return false;
		}

		// check password
		if (login_password === '') {
			pageSession.set('errorMessage', 'Proszę wprowadzić hasło.');
			t.find('#login_email').focus();
			return false;
		}

		Meteor.loginWithPassword(login_email, login_password, function(err) {
			if (err) {
				var message;
				switch (err.error) {
					case 403:
						message = 'Nie znaleziono użytkownika o podanych danych.';
						break;
					case 499:
						message = 'Niezweryfikowany adres e-mail.';
						break;
					default:
						message = err.message;
						break;
				}
				pageSession.set('errorMessage', message);
				return false;
			} else {
                FlowRouter.go('home');
                return true;
            }
		});
    }
});