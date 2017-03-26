Template.verifyEmail.onCreated(function() {
    Accounts.verifyEmail(FlowRouter.getParam('token'));
});

Template.verifyEmail.helpers({
    path: function() {
        return FlowRouter.path('login');
    }
});