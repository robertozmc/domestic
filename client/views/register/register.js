var pageSession = new ReactiveDict();

Template.register.onCreated(function() {
    pageSession.set('errorMessage', '');
    pageSession.set('verificationEmailSent', '');
});

Template.register.helpers({
    errorMessage: function() {
        return pageSession.get('errorMessage');
    },
    verificationEmailSent: function() {
		return pageSession.get('verificationEmailSent');
	},
    path: function() {
        return FlowRouter.path('login');
    }
});

Template.register.events({
    submit: function(e, t) {
        e.preventDefault();
        pageSession.set('errorMessage', '');

        var register_name = t.find('#register_name').value;
		var register_email = t.find('#register_email').value.trim();
		var register_password = t.find('#register_password').value;
        var register_confirm_password = t.find('#register_confirm_password').value;

        // check name
		if (register_name === '') {
			pageSession.set('errorMessage', 'Proszę podać imię i nazwisko.');
			t.find('#register_name').focus();
			return false;
		}

		// check email
		if (register_email === '') {
			pageSession.set('errorMessage', 'Proszę wprowadzić adres e-mail.');
			t.find('#register_email').focus();
			return false;
		}
		if (!isValidEmail(register_email)) {
			pageSession.set('errorMessage', 'Proszę wprowadzić prawidłowy adres e-mail.');
			t.find('#register_email').focus();
			return false;
		}

        // check password
		var min_password_len = 6;
		if (!isValidPassword(register_password, min_password_len)) {
			pageSession.set('errorMessage', 'Twoje hasło musi mieć przynajmniej ' + min_password_len + ' znaków.');
			t.find('#register_password').focus();
			return false;
		}
        if (register_confirm_password !== register_password) {
            pageSession.set('errorMessage', 'Potwierdzenie hasła nie zgadza się.');
			t.find('#register_password').focus();
			return false;
        }

        Accounts.createUser({
			email: register_email,
			password : register_password,
			profile: {
				name: register_name
			}
		}, function(err) {
			if (err) {
				var message;
				switch (err.error) {
					case 403:
						message = 'Podany adres e-mail już istnieje.';
						break;
					case 499:
						pageSession.set('verificationEmailSent', true);
						break;
					case 500:
						message = 'Wewnętrzny błąd serwera.';
						break;
					default:
						message = err.message;
						break;
				}
				pageSession.set('errorMessage', message);

				return false;
			} else {
				pageSession.set('errorMessage', '');
				pageSession.set('verificationEmailSent', true);

				return true;
			}
        });
    },
    "click #ok": function(e, t) {
		FlowRouter.go("login");
	}
});