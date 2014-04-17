'use strict';

/* Filters */

angular.module('myApp.filters', []).
        filter('ServerFilter', function() {
            return function(items, server) {
                var filtered = [];
                if (!angular.isUndefined(server)) {
                    angular.forEach(items, function(item) {
                        if (item.name.toLowerCase().indexOf(server) >= 0)
                            filtered.push(item);
                    });
                }
                return filtered;
            };
        }).
        filter('DateFilter', function() {
            return function(reservations, date) {
                var filtered = [];
                angular.forEach(reservations, function(reservation) {
                    if (date.getTime() === reservation.the_date.getTime())
                        filtered.push(reservation);
                });
                return filtered;
            };
        });
