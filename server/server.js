// GLOBAL VARIABLES DECLARATION

// SMTP credentials for emails sending
var smtp_username = 'roberto.zmc@gmail.com';
var smtp_password = 'giwaoxancrghsnps';
var smtp_server = 'smtp.gmail.com';
var smtp_port = 587;

var verifyEmail = true;

// Accounts configuration
Accounts.config({ sendVerificationEmail: verifyEmail });

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Meteor startup

Meteor.startup(function() {
	// MAIL_URL environment variable
	process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp_username) + ':' + encodeURIComponent(smtp_password) + '@' + encodeURIComponent(smtp_server) + ':' + smtp_port;

	if (Meteor.settings && Meteor.settings.env && _.isObject(Meteor.settings.env)) {
		for (var variableName in Meteor.settings.env) {
			process.env[variableName] = Meteor.settings.env[variableName];
		}
	}

	// Set URL for verification email
	Accounts.urls.verifyEmail = function (token) {
        return Meteor.absoluteUrl('verify/' + token);
    };
});

SSR.compileTemplate('emailActivation', Assets.getText('emailActivation.html'));

Accounts.emailTemplates.verifyEmail = {
	from: function () {
		return "domestic@gda.pl";
	},
	subject: function () {
		return "Aktywacja konta Domestic";
	},
	html: function (user, url) {
		var dataContext = {
			user: user,
			url: url
		};
		return Assets.getText('emailHeader.html') + SSR.render('emailActivation', dataContext) + Assets.getText('emailFooter.html');
	}
};

Accounts.validateLoginAttempt(function(info) {
    if (verifyEmail && info.user && info.user.emails && info.user.emails.length && !info.user.emails[0].verified ) {
    	throw new Meteor.Error(499, "Niezweryfikowany adres e-mail.");
    }

	return true;
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Permisions

sleapBinaryData.allow({
	'insert': function() {
		return true;
	},
	'download': function(userId, fileObj) {
		return true;
	}
});