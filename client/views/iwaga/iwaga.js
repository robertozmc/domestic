/*jshint esversion:6 */

import vex from 'vex-js';
vex.dialog = require('vex-js/js/vex.dialog.js');

var pageSession = new ReactiveDict();

var iwagaViewItems = function(cursor) {
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

var iwagaViewExport = function(cursor, fileType) {
	var data = iwagaViewItems(cursor);
	var exportFields = ["measurement_id", "user_id", "user.first_name", "user.last_name", "weight", "ffm", "bmi", "saturation", "pulse", "measure_date", "insert_date", "edit_date"];

	var str = convertArrayOfObjects(data, exportFields, fileType);

	var filename = "iwagaData." + fileType;

	downloadLocalResource(str, filename, "application/octet-stream");
};

Template.iwaga.onRendered(function() {
    $(document).foundation();
});

Template.iwaga.helpers({
    records: function() {
        return iwagaViewItems(iwagaData.find());
    },
    notEmpty: function() {
        return iwagaData.find().count();
    },
    resourcesReady: function () {
        return FlowRouter.subsReady('iwagaData');
    }
});

Template.iwaga.events({
    'click #import': function(e, t) {
        e.preventDefault();
        vex.defaultOptions.className = 'vex-theme-default';
        vex.dialog.open({
            message: 'Wybierz pliki: <br><i><b>ddbscale_measurements.json<br>ddbscale_number_data.json<br>ddbscale_time_data.json<br>ddbscale_time_data_binary.json</b></i>',
            input: "<input type=\"file\" id=\"file\" multiple/> <br> <div>Wybierz pliki:<br><b><i>ddbscale_time_data_rX_c4.data</i></b><div> <input type=\"file\" id=\"file1\" multiple/>",
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'OK'
                }), $.extend({}, vex.dialog.buttons.NO, {
                    text: 'Anuluj'
                })
            ],
            callback: function(data) {
				if (data !== false) {
					// json files: ddbscale_measurements.json, ddbscale_number_data.json, ddbscale_time_data.json, ddbscale_time_data_binary.json
					var jsonFiles = document.getElementById('file');

					var fileMeasurements = jsonFiles.files[0];
					var fileNumberData = jsonFiles.files[1];
					var fileTimeData = jsonFiles.files[2];
					var fileTimeDataRecords = jsonFiles.files[3];

					// binary files: ddbscale_time_data_rX_c4.data
					var filesBinaryTimeData;
					if (document.getElementById('file1').files[0]) {
						filesBinaryTimeData = document.getElementById('file1').files;
					}

					// file readers for json files
                    var readerMeasurements = new FileReader();
					var readerNumberData = new FileReader();
					var readerTimeData = new FileReader();
					var readerTimeDataRecords = new FileReader();

					// file reader for binary files
					var readerBinaryTimeData = new FileReader();

					// arrays for json files data
					var measurementsArray = [];
					var numberDataArray = [];
					var timeDataArray = [];
					var timeDataRecordsArray = [];
					var timeDataBinaryArray = [];

					// saving binary data with EKG
					// check if files exists
					if (document.getElementById('file1').files[0]) {
						for (var i = 0, ln = filesBinaryTimeData.length; i < ln; i++) {
					    	var fileObj = iwagaBinaryData.insert(filesBinaryTimeData[i]);
							timeDataBinaryArray.push(fileObj);
					    }
					}

					// read ddbscale_time_data_binary.json
					readerTimeDataRecords.onload = function() {
						var json  = JSON.parse(readerTimeDataRecords.result);

						json.forEach(function(timeData) {
							var existingMeasurement = iwagaData.findOne({"measurement_id": timeData.measure});

							if (!existingMeasurement) {
								timeDataBinaryArray.forEach(function(binaryData) {
									if (binaryData.original.name == timeData.name) {
										var data = {
											measurement_id: timeData.measure,
											ekg_data: binaryData
										};

										timeDataRecordsArray.push(data);
									}
								});
							} else {
								alertify.notify("Pomiar " + timeData.measure + " już istnieje.", "error");
							}
						});
					};

					// read ddbscale_measurements.json
                    readerMeasurements.onload = function() {
                        var json = JSON.parse(readerMeasurements.result);
                        if (json.ddbscale_measurements) {
                            var measurements = json.ddbscale_measurements;

                            measurements.forEach(function(measurement) {
                                var existingMeasurement = iwagaData.findOne({"measurement_id": measurement.ID_POM});

                                if (!existingMeasurement) {
                                    var data = {
                                        measurement_id: measurement.ID_POM,
                                        user_id: measurement.USER_ID,
                                        measure_date: measurement.DATE_TIME
                                    };

									measurementsArray.push(data);
                                } else {
                                    alertify.notify("Pomiar " + measurement.ID_POM + " już istnieje.", "error");
                                }
                            });
                        } else {
                            alertify.notify("Wybrano zły plik.", "error");
                        }
                    };

					// read ddbscale_number_data.json
					readerNumberData.onload = function() {
						var json = JSON.parse(readerNumberData.result);
						if (json.ddbscale_number_data) {
							var measurements = json.ddbscale_number_data;

							measurements.forEach(function(measurement) {
                                var existingMeasurement = iwagaData.findOne({"measurement_id": measurement.ID_POM});

                                if (!existingMeasurement) {
                                    var data = {
                                        measurement_id: measurement.ID_POM,
                                        weight: measurement.WGH,
                                        ffm: measurement.FFM,
										bmi: measurement.BMI,
										saturation: measurement.SAT,
										pulse: measurement.PUL
                                    };

									numberDataArray.push(data);
                                } else {
                                    alertify.notify("Pomiar " + measurement.ID_POM + " już istnieje.", "error");
                                }
                            });
						} else {
							alertify.notify("Wybrano zły plik.", "error");
						}
					};

					// read ddbscale_time_data.json
					readerTimeData.onload = function() {
						var json = JSON.parse(readerTimeData.result);
						if (json.ddbscale_time_data) {
							var measurements = json.ddbscale_time_data;

							measurements.forEach(function(measurement) {
                                var existingMeasurement = iwagaData.findOne({"measurement_id": measurement.ID_POM});

                                if (!existingMeasurement) {
									timeDataRecordsArray.forEach(function(timeData) {
										if (timeData.measurement_id == measurement.ID_POM) {
											var data = {
		                                        measurement_id: measurement.ID_POM,
		                                        ekg_type: measurement.TYPE,
												ekg_data: timeData.ekg_data
		                                    };

											timeDataArray.push(data);
										}
									});
                                } else {
                                    alertify.notify("Pomiar " + measurement.ID_POM + " już istnieje.", "error");
                                }
                            });

							measurementsArray.forEach(function(measurement) {
								var user = domesticUsers.findOne({user_id: measurement.user_id});
								if (user) {
									var user_guid = user._id;
									var data = {};

									numberDataArray.forEach(function(number) {
										if (measurement.measurement_id == number.measurement_id) {
											data = {
												measurement_id: parseInt(measurement.measurement_id),
												user_id: measurement.user_id,
												user_guid: user_guid,
												measure_date: measurement.measure_date,
												weight: number.weight,
												ffm: number.ffm,
												bmi: number.bmi,
												saturation: number.saturation,
												pulse: number.pulse,
												insert_date: new Date()
											};

											timeDataArray.forEach(function(time) {
												if (measurement.measurement_id == time.measurement_id) {
													data.ekg_type = time.ekg_type;
													data.ekg_data = time.ekg_data;
													console.log("Gdy dane poprawne");
													Meteor.call('addIWagaRecord', data);
												}
											});
										}
									});

									if (data.measurement_id && !data.ekg_data) {
										console.log("Gdy dane niepoprawne i bez EKG");
										Meteor.call('addIWagaRecord', data);
									}

									if (!data.measurement_id) {
										timeDataArray.forEach(function(time) {
											if (measurement.measurement_id == time.measurement_id) {
												data = {
													measurement_id: measurement.measurement_id,
													user_id: measurement.user_id,
													user_guid: user_guid,
													measure_date: measurement.measure_date,
													ekg_type: time.ekg_type,
													ekg_data: time.ekg_data,
													insert_date: new Date()
												};
												console.log("Gdy dane niepoprawne i bez pomiarów");
												Meteor.call('addIWagaRecord', data);
											}
										});
									}
								} else {
									alertify.notify("Pomiar dla użytkownika nie będącego w bazie.", "error");
								}
							});
						} else {
							alertify.notify("Wybrano zły plik.", "error");
						}
					};

					// read all files as text
					readerTimeDataRecords.readAsText(fileTimeDataRecords);
                    readerMeasurements.readAsText(fileMeasurements);
					readerNumberData.readAsText(fileNumberData);
					readerTimeData.readAsText(fileTimeData);
                }
            }
        });
    },
	"click #export-default": function(e, t) {
		e.preventDefault();
		iwagaViewExport(iwagaData.find(), "csv");
	},

	"click #export-csv": function(e, t) {
		e.preventDefault();
		iwagaViewExport(iwagaData.find(), "csv");
	},

	"click #export-tsv": function(e, t) {
		e.preventDefault();
		iwagaViewExport(iwagaData.find(), "tsv");
	},

	"click #export-json": function(e, t) {
		e.preventDefault();
		iwagaViewExport(iwagaData.find(), "json");
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
                    Meteor.call('removeIWagaAll');
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

		FlowRouter.go('iwagaDetails', {id: this._id});
		return false;
	},
    "click #edit-button": function(e, t) {
		e.preventDefault();

		FlowRouter.go('iwagaEdit', {id: this._id});
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
                    Meteor.call('removeIWagaRecord', self._id);
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