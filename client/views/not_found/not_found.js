Template.notFound.onCreated(function() {
    setTimeout(function() {
        FlowRouter.go('login');
    }, 4000);
});