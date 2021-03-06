'use strict';

/* Filters */

angular.module('myApp.filters', []).
        /**
         * This filter is used to turn off the unneeded days on step 3 of
         * creating an appointment. (e.g. if there are no proposals on Monday,
         * the Monday filter will be automatically set to false). Filters is passed
         * as a variable and is an array containing all filters used on step 3. 
         * Each number in the array represents a day of the week.
         * For each proposal, we check if it fulfills any of the prerequisits 
         * of the set filters and set the needed days to true.
         */
        filter('orderProposals', function() {
            return function(proposals, filters) {
                var filtered = [];
                if (filters && !filters.updateDay) {
                    filters["0"] = true;
                    filters["1"] = true;
                    filters["2"] = true;
                    filters["3"] = true;
                    filters["4"] = true;
                    filters["5"] = true;
                    filters["6"] = true;
                }
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
                //Disables the day buttons when the day is not in the list
                if (filters && !filters.updateDay) {
                    filters["0"] = false;
                    filters["1"] = false;
                    filters["2"] = false;
                    filters["3"] = false;
                    filters["4"] = false;
                    filters["5"] = false;
                    filters["6"] = false;
                    for (var proposal in filtered) {
                        filters[new Date(filtered[proposal].the_date).getDay()] = true;
                    }
                }
                return filtered;
            };
        });
