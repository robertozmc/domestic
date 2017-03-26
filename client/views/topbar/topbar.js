Template.topbar.helpers({
    path: function(type) {
        switch (type) {
            case 'home':
                return FlowRouter.url('home');
            case 'iwaga':
                return FlowRouter.url('iwaga');
            case 'sleap':
                return FlowRouter.url('sleap');
            case 'users':
                return FlowRouter.url('users');
            case 'account':
                return FlowRouter.url('account');
            default:
                return false;
        }
    }
});

Template.topbar.events({
    "click #logout": function() {
        Meteor.logout(function() {
            FlowRouter.go('login');
        });
    }
});