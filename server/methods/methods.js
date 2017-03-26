Meteor.methods({

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // iWaga methods
    addIWagaRecord: function(data) {
        iwagaData.insert(data);
    },
    editIWagaRecord: function(id, data) {
        iwagaData.update(id, data);
    },
    removeIWagaRecord: function(id) {
        iwagaData.remove(id);
    },
    removeIWagaAll: function() {
        iwagaData.remove({});
    },
    iwagaChartData: function() {
		var today = moment().toDate();
		var last30d = moment().subtract(30, 'days').toDate();

		return {
			iwaga: iwagaData.aggregate(
                [
                    {
        				$match: {
        					insert_date: {
        						$gte: last30d,
        						$lt: today
        					}
        				}
        			}, {
        				$group: {_id: {$dayOfMonth: '$insert_date'}, Total: {$sum: 1}}
        			}, {
        				$project: {_id: 0, day: '$_id', Total: 1}
        			}, {
        				$sort: {day: 1}
        			}
			    ]
            )
		};
	},

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // SleAp methods
    addSleApRecord: function(data) {
        sleapData.insert(data);
    },
    editSleApRecord: function(id, data) {
        sleapData.update(id, data);
    },
    removeSleApRecord: function(id) {
        sleapData.remove(id);
    },
    removeSleApAll: function() {
        sleapData.remove({});
    },
    sleapChartData: function() {
		var today = moment().toDate();
		var last30d = moment().subtract(30, 'days').toDate();

		return {
			sleap: sleapData.aggregate(
                [
                    {
        				$match: {
        					insert_date: {
        						$gte: last30d,
        						$lt: today
        					}
        				}
        			}, {
        				$group: {_id: {$dayOfMonth: '$insert_date'}, Total: {$sum: 1}}
        			}, {
        				$project: {_id: 0, day: '$_id', Total: 1}
        			}, {
        				$sort: {day: 1}
        			}
			    ]
            )
		};
	},

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Domestic users methods
    addUsers: function(data) {
        domesticUsers.insert(data);
    },
    editUsersRecord: function(id, data) {
        domesticUsers.update(id, data);
    },
    removeUsersRecord: function(id) {
        domesticUsers.remove(id);
    },
    removeUsersAll: function() {
        domesticUsers.remove({});
    },

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Users methods
    changeUserData: function(email, name) {
        Meteor.users.update(Meteor.user()._id, {$set: {'emails.0.address': email, 'profile.name': name}});
    },
    removeUserAccount: function() {
        Meteor.users.remove({_id: Meteor.user()._id});
    }
});