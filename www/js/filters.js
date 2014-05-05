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
            return function(proposals) {
                var proposalPerDate = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []};
                var array = [];
                var lowestDate = new Date(2500,12,1);
                
                for (var proposal in proposals) {
                    var dayNumber = new Date(proposals[proposal].the_date).getDay();
                    var date = new Date(proposals[proposal].the_date);
                    if(lowestDate > date)
                        lowestDate = new Date(date);
                    proposals[proposal].UTC = Date.UTC(date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            proposals[proposal].time_from.substring(0, 2),
                            proposals[proposal].time_from.substring(3, 5));
                    proposalPerDate[dayNumber].push(proposals[proposal]);
                }

                var currentDayCounter = new Date().getDay();
                for (var day in proposalPerDate) {
                    if (proposalPerDate[currentDayCounter].length > 0) {
                        proposalPerDate[currentDayCounter].sort(function(a, b) {
                            return new Date(a.UTC) > new Date(b.UTC);
                        });

                        for (var proposal in proposalPerDate[currentDayCounter]) {
                            array.push(proposalPerDate[currentDayCounter][proposal]);
                        }
                    }
                    if (currentDayCounter === 6)
                        currentDayCounter = 0;
                    else
                        currentDayCounter++;
                }
                console.log(array);

                /*
                 array.sort(function(a, b) {
                 var current = new Date().getDay();
                 var datea = new Date(a.the_date).getDay();
                 var dateb = new Date(b.the_date).getDay();
                 
                 console.log("current: " + current);
                 console.log("start a: " + datea);
                 console.log("start b: " + dateb);
                 
                 if(datea >= current)
                 datea = datea - current;
                 else
                 datea= datea + current;
                 
                 if(dateb >= current)
                 dateb = dateb - current;
                 else
                 dateb = dateb + current;
                 console.log("eind a: " + datea);
                 console.log("eind b: " + dateb);
                 return datea - dateb;
                 });*/
                return array;
            };
        });
