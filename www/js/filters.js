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
        }).
        filter('orderProposals', function() {
            return function(proposals, filters) {
                console.log("filters: " + JSON.stringify(filters));
                var filtered = [];
                for (var proposal in proposals) {
                    for (var i = 0; i <= 6; i++) {
                        if (proposals[proposal].setDayNumber === i && filters[i] === true &&
                                (proposals[proposal].afternoon === filters.afternoon || proposals[proposal].morning === filters.morning)) {
                            for (var j = 0; j < filters.unitList.length; j++) {
                                if (filters.unitList[j].checked && (proposals[proposal].unit_id === filters.unitList[j].Header.unit_id)) {
                                    if (proposals[proposal].location_name) {
                                        for (var k = 0; k < filters.locations.length; k++) {
                                            if (filters.locations[k].checked && (proposals[proposal].location_name === filters.locations[k].location_name)) {
                                                filtered.push(proposals[proposal]);
                                            }
                                        }
                                    } else {
                                        filtered.push(proposals[proposal]);
                                    }
                                }
                            }
                        }
                    }
                }
                if(filters){
                    filters["0"] = false;
                    filters["1"] = false;
                    filters["2"] = false;
                    filters["3"] = false;
                    filters["4"] = false;
                    filters["5"] = false;
                    filters["6"] = false;
                    for(var proposal in filtered){
                        filters[new Date(filtered[proposal].the_date).getDay()] = true;
                    }
                }
                return filtered;
            };
        });
