// iWaga collection

Meteor.publish('iwagaData', function() {
    var cursor = iwagaData.find();
    return iwagaData.publishJoinedCursors(cursor);
});

Meteor.publish('iwagaTotal', function() {
    Counts.publish(this, 'iwagaTotal', iwagaData.find());
});

Meteor.publish('iwaga_last_30_days', function() {
    var today = moment().toDate();
    var last30d = moment().subtract(30, 'days').toDate();

    Counts.publish(this, 'iwaga_last_30_days', iwagaData.find({
        insert_date: {
            $gte: last30d,
            $lt: today
        }
    }));
});

Meteor.publish('iwagaBinaryData', function() {
    return iwagaBinaryData.find();
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// SleAp collection

Meteor.publish('sleapData', function() {
    var cursor = sleapData.find();
    return sleapData.publishJoinedCursors(cursor);
});

Meteor.publish('sleapTotal', function() {
    Counts.publish(this, 'sleapTotal', sleapData.find());
});

Meteor.publish('sleap_last_30_days', function() {
    var today = moment().toDate();
    var last30d = moment().subtract(30, 'days').toDate();

    Counts.publish(this, 'sleap_last_30_days', sleapData.find({
        insert_date: {
            $gte: last30d,
            $lt: today
        }
    }));
});

Meteor.publish('sleapBinaryData', function() {
    return sleapBinaryData.find();
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Domestic users collection

Meteor.publish('domesticUsers', function() {
    return domesticUsers.find();
});

Meteor.publish('domesticUsersTotal', function() {
    Counts.publish(this, 'domesticUsersTotal', domesticUsers.find());
});

Meteor.publish('domesticUsers_last_30_days', function() {
    var today = moment().toDate();
    var last30d = moment().subtract(30, 'days').toDate();

    Counts.publish(this, 'domesticUsers_last_30_days', domesticUsers.find({
        insert_date: {
            $gte: last30d,
            $lt: today
        }
    }));
});