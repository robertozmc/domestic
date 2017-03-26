// Route groups

var publicRoutes = FlowRouter.group({
    triggersEnter: [function(context, redirect) {
        if (Meteor.userId()) {
            FlowRouter.go('home');
        }
    }]
});

var privateRoutes = FlowRouter.group({
    triggersEnter: [function(context, redirect) {
        if (!Meteor.userId()) {
            FlowRouter.go('login');
        }
    }]
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Public routes

publicRoutes.route('/', {
    name: 'login',
    action: function () {
        BlazeLayout.render('layout', {content: 'login'});
    }
});

publicRoutes.route('/register', {
    name: 'register',
    action: function () {
        BlazeLayout.render('layout', {content: 'register'});
    }
});

publicRoutes.route('/verify/:token', {
    name: 'verify',
    action: function () {
        BlazeLayout.render('layout', {content: 'verifyEmail'});
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Private routes

privateRoutes.route('/home', {
    name: 'home',
    action: function () {
        BlazeLayout.render('layout', {header: 'topbar', content: 'home'});
    }
});

privateRoutes.route('/iwaga', {
    name: 'iwaga',
    subscriptions: function () {
        this.register('iwagaData', Meteor.subscribe('iwagaData'));
        this.register('domesticUsers', Meteor.subscribe('domesticUsers'));
        this.register('iwagaBinaryData', Meteor.subscribe('iwagaBinaryData'));
    },
    action: function () {
        BlazeLayout.render('layout', {header: 'topbar', content: 'iwaga'});
    }
});

privateRoutes.route('/sleap', {
    name: 'sleap',
    subscriptions: function () {
        this.register('domesticUsers', Meteor.subscribe('domesticUsers'));
        this.register('sleapData', Meteor.subscribe('sleapData'));
        this.register('sleapBinaryData', Meteor.subscribe('sleapBinaryData'));
    },
    action: function () {
        BlazeLayout.render('layout', {header: 'topbar', content: 'sleap'});
    }
});

privateRoutes.route('/users', {
    name: 'domesticUsers',
    subscriptions: function () {
        this.register('domesticUsers', Meteor.subscribe('domesticUsers'));
    },
    action: function () {
        BlazeLayout.render('layout', {header: 'topbar', content: 'users'});
    }
});

privateRoutes.route('/account', {
    name: 'account',
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'account'});
    }
});

privateRoutes.route('/users/:id/details', {
    name: 'userDetails',
    subscriptions: function () {
        this.register('domesticUsers', Meteor.subscribe('domesticUsers'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'userDetails'});
    }
});

privateRoutes.route('/users/:id/edit', {
    name: 'userEdit',
    subscriptions: function () {
        this.register('domesticUsers', Meteor.subscribe('domesticUsers'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'userEdit'});
    }
});

privateRoutes.route('/iwaga/:id/details', {
    name: 'iwagaDetails',
    subscriptions: function () {
        this.register('iwagaData', Meteor.subscribe('iwagaData'));
        this.register('iwagaBinaryData', Meteor.subscribe('iwagaBinaryData'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'iwagaDetails'});
    }
});

privateRoutes.route('/iwaga/:id/edit', {
    name: 'iwagaEdit',
    subscriptions: function () {
        this.register('iwagaData', Meteor.subscribe('iwagaData'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'iwagaEdit'});
    }
});

privateRoutes.route('/sleap/:id/details', {
    name: 'sleapDetails',
    subscriptions: function () {
        this.register('sleapData', Meteor.subscribe('sleapData'));
        this.register('sleapBinaryData', Meteor.subscribe('sleapBinaryData'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'sleapDetails'});
    }
});

privateRoutes.route('/sleap/:id/edit', {
    name: 'sleapEdit',
    subscriptions: function () {
        this.register('sleapData', Meteor.subscribe('sleapData'));
    },
    action: function() {
        BlazeLayout.render('layout', {header: 'topbar', content: 'sleapEdit'});
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Not found routes

FlowRouter.notFound = {
    action: function() {
        BlazeLayout.render('layout', {content: 'notFound'});
    }
};