Template.home.onCreated(function() {
    Meteor.subscribe('iwagaTotal');
    Meteor.subscribe('iwaga_last_30_days');
    Meteor.subscribe('sleapTotal');
    Meteor.subscribe('sleap_last_30_days');
    Meteor.subscribe('domesticUsersTotal');
    Meteor.subscribe('domesticUsers_last_30_days');
});

Template.home.onRendered(function() {
    Meteor.call('iwagaChartData', function (err, result) {
        var days = [];
        var sumIWaga = [];
        var sumSleAp = [];
        var row;
        var pos;

        for (var i = 0; i < 30; i++) {
            sumIWaga[i] = 0;
            sumSleAp[i] = 0;
            days[i] = i + 1;
        }

        for (row in result.iwaga) {
            pos =  result.iwaga[row].day - 1;
            sumIWaga[pos] = result.iwaga[row].Total;
        }

        Meteor.call('sleapChartData', function(err, result) {
            for (row in result.sleap) {
                pos = result.sleap[row].day - 1;
                sumSleAp[pos] = result.sleap[row].Total;
            }

            var data = {
                labels: days,
                datasets: [
                    {
                        label: 'iWaga',
                        fillColor: "rgba(246, 138, 0, 0.4)",
                        strokeColor: "rgba(246, 138, 0, 1)",
                        pointColor: "rgba(246, 138, 0, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: sumIWaga
                    },
                    {
                        label: 'SleAp',
                        fillColor: "rgba(0, 186, 19, 0.4)",
                        strokeColor: "rgba(0, 186, 19, 1)",
                        pointColor: "rgba(0, 186, 19, 1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: sumSleAp
                    }
                ]
            };

            var ctx = document.getElementById('chart').getContext('2d');
            var chart = new Chart(ctx).Line(data); //options
        });
    });
});