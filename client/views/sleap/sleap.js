/*jshint esversion:6 */

import vex from 'vex-js';
vex.dialog = require('vex-js/js/vex.dialog.js');

var pageSession = new ReactiveDict();

var sleapViewItems = function(cursor) {
	if (!cursor) {
		return [];
	}

	var searchString = pageSession.get("searchString");
	var sortBy = pageSession.get("sortBy");
	var sortAscending = pageSession.get("sortAscending");
	if (typeof(sortAscending) == "undefined") sortAscending = true;

	var raw = cursor.fetch();

	// filter
	var filtered = [];
	if (!searchString || searchString === "") {
		filtered = raw;
	} else {
		searchString = searchString.replace(".", "\\.");
		var regEx = new RegExp(searchString, "i");
		var searchFields = ["measurement_id", "user_guid", "user.first_name", "user.last_name", "weight", "ffm", "bmi", "saturation", "pulse", "ekg_data", "ekg_type", "measure_date"];
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

var sleapViewExport = function(cursor, fileType) {
	var data = sleapViewItems(cursor);
	var exportFields = ["measurement_id", "user_id", "user.first_name", "user.last_name", "measure_date", "insert_date", "edit_date"];

	var str = convertArrayOfObjects(data, exportFields, fileType);

	var filename = "sleapData." + fileType;

	downloadLocalResource(str, filename, "application/octet-stream");
};

Template.sleap.onRendered(function() {
    $(document).foundation();
});

Template.sleap.helpers({
    records: function() {
        return sleapViewItems(sleapData.find());
    },
    notEmpty: function() {
        return sleapData.find().count();
    },
    resourcesReady: function () {
        return FlowRouter.subsReady('sleapData');
    }
});

Template.sleap.events({
    'click #import': function(e, t) {
        e.preventDefault();
        vex.defaultOptions.className = 'vex-theme-default';
        vex.dialog.open({
            message: 'Wybierz plik: <br><i><b>DANE.ECG</b></i>',
            input: "<div><input type=\"file\" id=\"file\"/></div> <div>Wprowadź imię użytkownika:</div> <div><input type=\"text\" id=\"first_name\" placeholder=\"Imię\"/></div> <div>Wprowadź nazwisko użytkownika</div> <div><input type=\"text\" id=\"last_name\" placeholder=\"Nazwisko\"/></div> <div>Data pomiaru:</div> <div><input type=\"date\"  id=\"date\"/></div>",
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'OK'
                }), $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Anuluj'
                })
            ],
            callback: function(data) {
                if (data !== false) {

					var firstName = document.getElementById('first_name').value;
					var lastName = document.getElementById('last_name').value;
					var measureDate = document.getElementById('date').value;

					var file = document.getElementById('file').files[0];
					var fileObj = sleapBinaryData.insert(file);

					var user = domesticUsers.findOne({first_name: firstName, last_name: lastName});

					if (!user) {

						userId = domesticUsers.insert({
							user_id: Random.id(),
							type: ["sleap"],
							first_name: firstName,
							last_name: lastName,
							insert_date: new Date()
						});

						user = domesticUsers.findOne({_id: userId});

						if (user) {
							sleapRecord = {
								measurement_id: Random.id(),
								user_id: user.user_id,
								user_guid: user._id,
								sleap_data: fileObj,
								measure_date: measureDate,
								insert_date: new Date()
							};

							if (sleapRecord) {
								Meteor.call('addSleApRecord', sleapRecord);
							}
						}
					} else {
						sleapRecord = {
							measurement_id: Random.id(),
							user_id: user.user_id,
							user_guid: user._id,
							sleap_data: fileObj,
							measure_date: measureDate,
							insert_date: new Date()
						};

						if (sleapRecord) {
							Meteor.call('addSleApRecord', sleapRecord);
						}
					}


                    // var file = document.getElementById('file').files[0];
					// var reader = new FileReader();
					//
					// reader.onload = function() {
					// 	var arrayBuffer = reader.result;
					// 	var arrayBufferSize = arrayBuffer.byteLength;
					// 	var temp = new Uint8Array(arrayBuffer);
					//
					// 	impedanceArray = [];
					// 	ekgArray = [];
					// 	temperatureArray = [];
					//
					// 	for (var i = 0; i < arrayBufferSize; i = i + 7) {
					// 		var impedanceLeft = createBinaryString(temp[i]);
					// 		var impedanceCenter = createBinaryString(temp[i + 1]);
					// 		var impedanceRight = createBinaryString(temp[i + 2]);
					//
					// 		var ekgLeft = createBinaryString(temp[i + 3]);
					// 		var ekgCenter = createBinaryString(temp[i + 4]);
					// 		var ekgRight = createBinaryString(temp[i + 5]);
					//
					// 		var impedanceBinaryString = impedanceLeft + impedanceCenter + impedanceRight;
					// 		var ekgBinaryString = ekgLeft + ekgCenter + ekgRight;
					//
					// 		var impedance = parseInt(impedanceBinaryString, 2);
					// 		var ekg = parseInt(ekgBinaryString, 2);
					// 		var temperature = temp[i + 6];
					//
					// 		impedanceArray.push(impedance);
					// 		ekgArray.push(ekg);
					// 		temperatureArray.push(temperature);
					// 	}
					//
					// 	var dataImpedance = {
					// 		impedance: impedanceArray
					// 	};
					//
					// 	var dataEkg = {
					// 		ekg: ekgArray
					// 	};
					//
					// 	var dataTemperature = {
					// 		temperature: temperatureArray
					// 	};
					//
					// 	// Meteor.call('addSleApImpedanceRecord', dataImpedance);
					// 	// Meteor.call('addSleApEkgRecord', dataEkg);
					// 	Meteor.call('addSleApTemperatureRecord', dataTemperature);
					// };
					//
					// reader.readAsArrayBuffer(file);
                }
            }
        });
    },
	"click #export-default": function(e, t) {
		e.preventDefault();
		sleapViewExport(sleapData.find(), "csv");
	},

	"click #export-csv": function(e, t) {
		e.preventDefault();
		sleapViewExport(sleapData.find(), "csv");
	},

	"click #export-tsv": function(e, t) {
		e.preventDefault();
		sleapViewExport(sleapData.find(), "tsv");
	},

	"click #export-json": function(e, t) {
		e.preventDefault();
		sleapViewExport(sleapData.find(), "json");
	},
    "click .button-remove-all": function(e, t) {
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
                    Meteor.call('removeSleApAll');
                    return false;
                }
            }
        });
    },
    'click .sort': function(e, t) {
		e.preventDefault();

		var oldSortBy = pageSession.get("sortBy");
		var newSortBy = $(e.target).attr("data-sort");

		pageSession.set("sortBy", newSortBy);
		if (oldSortBy == newSortBy) {
			var sortAscending = pageSession.get("sortAscending") || false;
			pageSession.set("sortAscending", !sortAscending);
		} else {
			pageSession.set("sortAscending", true);
		}
	},
    "click td": function(e, t) {
		e.preventDefault();

		FlowRouter.go('sleapDetails', {id: this._id});
		return false;
	},
    "click #edit-button": function(e, t) {
		e.preventDefault();

		FlowRouter.go('sleapEdit', {id: this._id});
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
                    Meteor.call('removeSleApRecord', self._id);
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
			pageSession.set("searchString", searchString);
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
					pageSession.set("searchString", searchString);
				}

				return false;
			case 27:
				e.preventDefault();

				searchInput = $('#search-input');
				if (searchInput) {
					searchInput.val("");
					pageSession.set("searchString", "");
				}

				return false;
			default:
				return true;
		}
    }
});