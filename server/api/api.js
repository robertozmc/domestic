var Api = new Restivus({
    apiPath: 'api/'
});

Api.addRoute('users', {
    post: function() {
        // adding user data
        var data = this.bodyParams;

        data.insert_date = new Date();

        Meteor.call('addUsers', data);

        return ' ';
    }
});

Api.addRoute('iwaga', {
    post: function() {
        // adding iwaga data
        var data = this.bodyParams;

        var user = domesticUsers.findOne({user_id: data.user_id});

        data.user_guid = user._id;
        data.insert_date = new Date();

        Meteor.call('addIWagaRecord', data);

        return ' ';
    }
});

Api.addRoute('sleap', {
    post: function() {
        // adding sleap data
        var data = this.bodyParams;

        var user = domesticUsers.findOne({user_id: data.user_id});

        data.user_guid = user._id;
        data.insert_date = new Date();

        Meteor.call('addSleApRecord', data);

        return ' ';
    }
});