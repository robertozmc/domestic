UI.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

UI.registerHelper('formatDateTime', function(date) {
    return moment(date).format('DD-MM-YYYY HH:mm:ss');
});

UI.registerHelper('userName', function() {
    var name = '';
	if (Meteor.user() && Meteor.user().profile) {
        name = Meteor.user().profile.name;
    }

	return name;
});

UI.registerHelper('userEmail', function() {
    var email = '';
    if (Meteor.user()) {
        email = Meteor.user().emails[0].address;
    }

    return email;
});