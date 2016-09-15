var myAppModule = angular.module('gaTest', ['ngAnalytics', 'ngTable']);

myAppModule.run(['ngAnalyticsService', function (ngAnalyticsService) {
    ngAnalyticsService.setClientId('753916689677-t8c9thn89e1qthkkmpecp3a547ig2coj.apps.googleusercontent.com');
}]);

myAppModule.controller('MainCtrl', function (NgTableParams, $scope) {
    $scope.showReport = false;
    $scope.startDate = '30daysAgo';
    $scope.endDate = 'today';

    $scope.charts = [{
        reportType: 'ga',
        query: {
            metrics: 'ga:metric1',
            dimensions: 'ga:dimension2',
            'start-date': $scope.startDate,
            'end-date': $scope.endDate
        },
        chart: {
            container: 'chart-container-1',
            type: 'LINE',
            options: {
                width: '50%'
            }
        }
    }, {
        reportType: 'ga',
        query: {
            metrics: 'ga:metric1',
            dimensions: 'ga:dimension2',
            'start-date': $scope.startDate,
            'end-date': $scope.endDate
        },
        chart: {
            container: 'chart-container-2',
            type: 'PIE',
            options: {
                width: '100%',
                is3D: true,
                title: 'Browser Usage'
            }
        }
    }];

    // $scope.extraChart = {
    //     reportType: 'ga',
    //     query: {
    //         metrics: 'ga:metric1',
    //         dimensions: 'ga:dimension2',
    //         'start-date': '30daysAgo',
    //         'end-date': 'today',
    //         ids: 'ga:96998894'
    //     },
    //     chart: {
    //         container: 'chart-container-3',
    //         type: 'TABLE',
    //         options: {
    //             width: '100%'
    //         }
    //     }
    // };

    // $scope.defaultIds = {
    //     ids: 'ga:96998894'
    // };

    $scope.queries = [{
        // Plays per each title video (report[0])
        query: {
            'start-date': $scope.startDate,
            'end-date': $scope.endDate,
            //ids: 'ga:96998894',
            metrics: 'ga:metric1',
            dimensions: 'ga:dimension3',
            filters: 'ga:eventAction==playProgress'
        }
    }, {
        // Use for calculate average elapsed time (report[1])
        query: {
            'start-date': $scope.startDate,
            'end-date': $scope.endDate,
            //ids: 'ga:96998894',
            metrics: 'ga:metric1',
            dimensions: 'ga:dimension3,ga:dimension4'
        }
    }, {
        // Plays per each milestone event video (report[2])
        query: {
            'start-date': $scope.startDate,
            'end-date': $scope.endDate,
            //ids: 'ga:96998894',
            metrics: 'ga:metric1',
            dimensions: 'ga:dimension3, ga:eventAction',
            filters: 'ga:eventAction==playProgressEnd,ga:eventAction==playProgressStarted,ga:eventAction==playProgressQuarter,ga:eventAction==playProgressHalf,ga:eventAction==playProgressThreeQuarters'
        }
    }];

    // If a report is ready
    $scope.$on('$gaReportSuccess', function (e, report, element) {
        $scope.showReport = true;
        plays = $scope.calculatePlays(report[0]);
        averageTimePlayed = $scope.calculateAvgPlayed(report[1]);
        milestones = $scope.calculateMilestones(report[2]);

        data = $scope.buildData(plays, averageTimePlayed, milestones);
        $scope.tableParams = new NgTableParams({ count: 5}, { counts: [5, 10, 25], dataset: data});
    });

    // If a report error
    $scope.$on('$gaReportError', function (e, report, element) {
        console.log(report, element);
    });

    $scope.buildData = function(plays, averageTimePlayed, milestones) {
        data = [];
        _.each(plays, function(value, key) {
            item = {};
            item['title'] = key;
            item['plays'] = value;
            item['average_time_played'] = averageTimePlayed[key].sum;
            item['play_progress_quarter'] = (milestones[key].playProgressQuarter == undefined) ? 0 : milestones[key].playProgressQuarter;
            item['play_progress_half'] = (milestones[key].playProgressHalf == undefined) ? 0 : milestones[key].playProgressHalf;
            item['play_progress_three_quarters'] = (milestones[key].playProgressThreeQuarters == undefined) ? 0 : milestones[key].playProgressThreeQuarters;
            item['play_progress_end'] = (milestones[key].playProgressEnd == undefined) ? 0 : milestones[key].playProgressEnd;
            data.push(item);
        });
        return data;
    };

    $scope.calculatePlays = function(response) {
        if (response.rows.length == 0) {
            return;
        }

        plays = {};
        _.each(response.rows, function(rows) {
            if (rows[1] == 'undefined') {
                return;
            }
            plays[rows[0]] = parseInt(rows[1]);
        });
        return plays;
    };

    $scope.calculateAvgPlayed = function(response) {
        if (response.rows.length == 0) {
            return;
        }

        averageTimePlayed = {};
        _.each(response.rows, function(rows) {
            if (rows[1] == 'undefined') {
                return;
            }
            if (averageTimePlayed[rows[0]] == undefined) {
                averageTimePlayed[rows[0]] = {
                    'elapsed_time': [rows[1]],
                    'sum': parseFloat(rows[1])
                };
            } else {
                array = averageTimePlayed[rows[0]].elapsed_time;
                array.push(rows[1]);
                averageTimePlayed[rows[0]].sum += parseFloat(rows[1]);
                averageTimePlayed[rows[0]].average_time_played = averageTimePlayed[rows[0]].sum/array.length;
            }
        });
        return averageTimePlayed;
    };

    $scope.calculateMilestones = function(response) {
        if (response.rows.length == 0) {
            return;
        }

        milestones = {};
        _.each(response.rows, function(rows) {
            if (milestones[rows[0]] == undefined) {
                item = {};
                item[rows[1]] = parseInt(rows[2]);
                milestones[rows[0]] = item;
            } else {
                object = milestones[rows[0]];
                object[rows[1]] = parseInt(rows[2]);
            }
        });
        return milestones;
    };
});