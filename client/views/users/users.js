/*jshint esversion:6 */

import vex from 'vex-js';
vex.dialog = require('vex-js/js/vex.dialog.js');

var pageSession = new ReactiveDict();

var usersViewItems = function(cursor) {
	if (!cursor) {
		return [];
	}

	var searchString = pageSession.get("usersViewSearchString");
	var sortBy = pageSession.get("usersViewSortBy");
	var sortAscending = pageSession.get("usersViewSortAscending");
	if (typeof(sortAscending) == "undefined") sortAscending = true;

	var raw = cursor.fetch();

	// filter
	var filtered = [];
	if (!searchString || searchString === "") {
		filtered = raw;
	} else {
		searchString = searchString.replace(".", "\\.");
		var regEx = new RegExp(searchString, "i");
		var searchFields = ["user_id", "first_name", "last_name", "dob", "height"];
		filtered = _.filter(raw, function(item) {
			var match = false;
			_.each(searchFields, function(field) {
				var value = (getPropertyValue(field, item) || "") + "";

				match = match || (value && value.match(regEx));
				if (match) {
					return false;
				}
			});
			return match;
		});
	}

	// sort
	if (sortBy) {
		filtered = _.sortBy(filtered, sortBy);

		// descending?
		if (!sortAscending) {
			filtered = filtered.reverse();
		}
	}

	return filtered;
};

var usersViewExport = function(cursor, fileType) {
	var data = usersViewItems(cursor);
	var exportFields = ["user_id", "type", "first_name", "last_name", "dob", "height", "insert_date", "edit_date"];

	var str = convertArrayOfObjects(data, exportFields, fileType);

	var filename = "domesticUsers." + fileType;

	downloadLocalResource(str, filename, "application/octet-stream");
};

Template.users.onRendered(function() {
    $(document).foundation();
});

Template.users.helpers({
    records: function() {
        return usersViewItems(domesticUsers.find());
    },
    notEmpty: function() {
        return domesticUsers.find().count();
    },
    resourcesReady: function () {
        return FlowRouter.subsReady('domesticUsers');
    }
});

Template.users.events({
    'click #import': function(e, t) {
        e.preventDefault();
        vex.defaultOptions.className = 'vex-theme-default';
        vex.dialog.open({
            message: 'Wybierz plik: <br><i><b>ddbscale_users.json</b></i>',
            input: "<input type=\"file\" id=\"file\" />",
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'OK'
                }), $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Anuluj'
                })
            ],
            callback: function(data) {
                if (data !== false) {
                    var file = document.getElementById('file').files[0];
                    var reader = new FileReader();
                    reader.onload = function() {
                        var json = JSON.parse(reader.result);
                        if (json.ddbscale_users) {
                            var users = json.ddbscale_users;

                            users.forEach(function(user) {
                                var existingUser = domesticUsers.findOne({user_id: user.USER_ID});

                                if (!existingUser) {
                                    var data = {
                                        user_id: user.USER_ID,
										type: ["iwaga"],
                                        first_name: user.NAME,
                                        last_name: user.LAST_NAME,
                                        dob: user.BIRTH_DATE,
                                        height: user.HEIGHT,
                                        insert_date: new Date()
                                    };

                                    Meteor.call('addUsers', data);
                                } else {
                                    alertify.notify("Użytkownik " + user.NAME + " " + user.LAST_NAME + " już istnieje.", "error");
                                }
                            });
                        } else {
                            alertify.notify("Wybrano zły plik.", "error");
                        }
                    };

                    reader.readAsText(file);
                }
            }
        });
    },
	"click #export-default": function(e, t) {
		e.preventDefault();
		usersViewExport(domesticUsers.find(), "csv");
	},

	"click #export-csv": function(e, t) {
		e.preventDefault();
		usersViewExport(domesticUsers.find(), "csv");
	},

	"click #export-tsv": function(e, t) {
		e.preventDefault();
		usersViewExport(domesticUsers.find(), "tsv");
	},

	"click #export-json": function(e, t) {
		e.preventDefault();
		usersViewExport(domesticUsers.find(), "json");
	},
    'click .button-remove-all': function(e, t) {
        e.preventDefault();

        vex.defaultOptions.className = 'vex-theme-default';
        vex.dialog.confirm({
            message: 'Czy na pewno usunąć wszystkie rekordy?',
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'Tak'
                }), $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Nie'
                })
            ],
            callback: function(value) {
                if (value !== false) {
                    Meteor.call('removeUsersAll');
                    return false;
                }
            }
        });
    },
    'click .sort': function(e, t) {
		e.preventDefault();

		var oldSortBy = pageSession.get("usersViewSortBy");
		var newSortBy = $(e.target).attr("data-sort");

		pageSession.set("usersViewSortBy", newSortBy);
		if (oldSortBy == newSortBy) {
			var sortAscending = pageSession.get("usersViewSortAscending") || false;
			pageSession.set("usersViewSortAscending", !sortAscending);
		} else {
			pageSession.set("usersViewSortAscending", true);
		}
	},
    'click td': function(e, t) {
		e.preventDefault();

		FlowRouter.go('userDetails', {id: this._id});
		return false;
	},
    'click #edit-button': function(e, t) {
		e.preventDefault();

		FlowRouter.go('userEdit', {id: this._id});
		return false;
	},
    'click #delete-button': function(e, t) {
        e.preventDefault();
        e.stopPropagation();

        var self = this;

        vex.defaultOptions.className = 'vex-theme-default';
        vex.dialog.confirm({
            message: 'Czy na pewno usunąć ten rekord?',
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'Tak'
                }), $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Nie'
                })
            ],
            callback: function(value) {
                if (value !== false) {
                    console.log(self._id);
                    Meteor.call('removeUsersRecord', self._id);
                    return false;
                }
            }
        });
    },
    'click #search-button': function(e, t) {
        e.preventDefault();

		var searchInput = $("#search-input");
		if (searchInput) {
			searchInput.focus();
			var searchString = searchInput.val();
			pageSession.set("usersViewSearchString", searchString);
		}

		return false;
    },
    'keydown #search-input': function(e, t) {
        var searchInput;

		switch (e.which) {
			case 13:
				e.preventDefault();

				searchInput = $('#search-input');
				if (searchInput) {
					var searchString = searchInput.val();
					pageSession.set("usersViewSearchString", searchString);
				}

				return false;
			case 27:
				e.preventDefault();

				searchInput = $('#search-input');
				if (searchInput) {
					searchInput.val("");
					pageSession.set("usersViewSearchString", "");
				}

				return false;
			default:
				return true;
		}
    }
});