'use strict';
/* Controllers */

angular.module('myApp.controllers', []).
        controller('LoginCtrl', function($scope, $location, $q, $rootScope, $modal, hospiviewFactory, dataFactory, languageFactory) {
            /**
             * Check if the localStorage item "users" exists. If is doesn't,
             * it means this is the first time the application is running. 
             * The user will then be redirected to the selectserver.html page.
             * 
             * Else, the localStorage item "users" will be used to create a
             * list of users of the application.
             * */
            if (localStorage.getItem("users") === null) {
                $location.path('/selectserver/new');
            } else {
                $scope.users = JSON.parse(localStorage.getItem("users"));
            }

            /**
             * showPasswordBoolean and savePassword will be set to false.
             * 
             */
            $scope.showPasswordBoolean = false;
            $scope.savePassword = false;

            /**
             * Will be called on change in the select. Checks if the user model
             * (this is the local user of the application, not the username for
             * the server) is empty. If it isn't, the localStorage data of that
             * user will be loaded. With this data, the servers model will be set.
             * Otherwise the servers model will be emptied.
             * 
             * The username and password field will be emptied and savePassword
             * will be set to false.
             */
            $scope.getServersUser = function() {
                if (!(angular.isUndefined($scope.user))) {
                    $scope.selectedUser = JSON.parse(localStorage.getItem($scope.user));
                    $scope.servers = $scope.selectedUser.servers;
                } else {
                    $scope.servers = "";
                }
                $scope.username = "";
                $scope.password = "";
                $scope.savePassword = false;
            };

            /**
             * Will be called on change in the select. Checks if the server model
             * is empty. If it isn't, the username will be automatically filled
             * out. Depending on the usersettings, the passwordfield will be 
             * filled out and the savePassword checkbox will be checked.
             */
            $scope.getLoginUser = function() {
                if (!(angular.isUndefined($scope.server))) {
                    $scope.username = $scope.server.user_login;
                    if ($scope.selectedUser.save_password === true) {
                        $scope.password = $scope.server.user_password;
                        $scope.savePassword = $scope.selectedUser.save_password;
                    }
                } else {
                    $scope.username = "";
                    $scope.password = "";
                    $scope.savePassword = false;
                }
            };
            /**
             * Throw a warning if the user checks the savePassword checkbox.
             */
            $scope.savePasswordWarning = function() {
                if ($scope.savePassword === false)
                    alert($rootScope.getLocalizedString('loginPasswordCheckedMessage'));
            };
            /**
             * Toggle showPasswordBoolean. Password field will either show dots 
             * (false) or text (true). Toggled by pressing the icon in front
             * of the password field.
             */
            $scope.showpassword = function() {
                $scope.showPasswordBoolean = !$scope.showPasswordBoolean;
            };
            /**
             * Call getAuthentication(username, password, server_url) method of 
             * the factory hospiviewFactory. The username and password input field
             * will be passed as parameters. The last parameter is the url of the
             * server the user wants to login on. On a successful call, the 
             * response data (XML) will be parsed to JSON with the xml2json 
             * library (/js/xml2json.min.js) in the parseJson(xml) function. If
             * the StatusCode sent by the webservice is 1, the passed parameters
             * were correct. No error message will be shown, status of the checkbox
             * and the uuid of the session will be saved in localStorage.
             * rootScope user and server are being set (rootscope is available
             * throughout the application during this session). The type of user
             * is determined and set in the rootscope. (0 = doctor, 1 = patient).
             * The user will then be redirected to mainmenu.html.
             * If the StatusCode is not 1, an message error will be displayed.
             * If the call failed, an error message will be displayed
             */
            $scope.login = function() {
                $scope.loggingIn = true;

                hospiviewFactory.getAuthentication($scope.username, $scope.password, $scope.server.hosp_url).
                        success(function(data) {
                            var json = parseJson(data);
                            if (json.Authentication.Header.StatusCode == 1) {
                                $scope.error = false;
                                for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                                    if ($scope.selectedUser.servers[i].id === $scope.server.id)
                                        $scope.selectedUser.servers[i].uuid = json.Authentication.Detail.uuid;
                                    $rootScope.currentServer = $scope.selectedUser.servers[i];
                                }
                                localStorage.setItem($scope.user, JSON.stringify($scope.selectedUser));
                                $rootScope.user = $scope.user;
                                if (json.Authentication.Detail.isexternal == 0) {
                                    $rootScope.type = 0;
                                } else {
                                    $rootScope.type = 1;
                                }
                                postLogin();
                            } else {
                                $scope.loggingIn = false;
                                $scope.error = true;
                                $scope.errormessage = $rootScope.getLocalizedString('loginError');
                            }
                            ;
                        }).
                        error(function() {
                            $scope.loggingIn = false;
                            callOfflineModal();
                        });
            };

            /**
             * loads all the necessary data from the server using the methods of hospiviewfactory and datafactory
             * 
             */
            function postLogin() {
                var year = new Date().getFullYear().toString(),
                        holidayPromise = [],
                        UnitPromise;
                //Holidays
                $rootScope.publicHolidays = [];
                //SearchUnits
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                $rootScope.absentDays = [];
                //Absent days
                $rootScope.absentDays = [];


                for (var i = 1; i < 4; i++) {
                    holidayPromise.push(hospiviewFactory.getPublicHolidays(i, year, '00', $scope.server.hosp_url));
                }
                UnitPromise = hospiviewFactory.getUnitAndDepList($rootScope.currentServer.uuid, $rootScope.currentServer.hosp_url);

                $q.all(holidayPromise).then(function(responses) {
                    dataFactory.setHolidays(responses);
                }, error);
                UnitPromise
                        .then(function(response) {
                            dataFactory.setSearchUnits(response);
                        }, error)
                        .then(function() {
                            return dataFactory.setAbsentDays(year);
                        }, error)
                        .then(function() {
                            return languageFactory.initRemoteLanguageStrings($scope.server.hosp_url);
                        })
                        .then(setData, error);
            }

            /**
             * When a promise gets rejected during postLogin() this method be used to properly handle the error
             * 
             * @param {type} data
             */
            function error(data) {
                $scope.loggingIn = false;
                $scope.error = true;
                $scope.errormessage = data;
            }

            /**
             * When the data from postLogin() is loaded successfully, this function is called
             * Because this function depends on the current scope it can not be abstracted
             * 
             */
            function setData() {
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.currentdate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                if (angular.isUndefined($rootScope[$rootScope.searchString]) || $rootScope[$rootScope.searchString] === 0) {
                    dataFactory.searchReservations()
                            .then(function(reservations) {
                                setReservations(reservations);
                            }, error);
                }
                else {
                    if ($rootScope.startDate < $rootScope.searchRangeStart || $rootScope.endDate > $rootScope.searchRangeEnd) {
                        $scope.reservations = $rootScope[$rootScope.searchString];
                        dataFactory.searchReservations()
                                .then(function(reservations) {
                                    setReservations(reservations);
                                }, error);
                    }
                    $rootScope.isOffline = true;
                    //pageTransition('next');
                    $location.path('/doctor/appointmentsView');
                }
            }

            function setReservations(reservations) {
                $rootScope[$rootScope.searchString] = reservations;
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    $rootScope.isOffline = false;
                    //pageTransition('next');
                    $location.path('/doctor/appointmentsView');
                }

            }
            function callModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: ModalInstance,
                });
                modalInstance.result.then(function(answer) {
                    if (answer === true) {
                        var newStartDate = new Date($rootScope.startDate);
                        newStartDate.setDate(newStartDate.getDate() + 14);
                        var newEndDate = new Date($rootScope.endDate);
                        newEndDate.setDate(newEndDate.getDate() + 14);
                        $rootScope.startDate = formatDate(newStartDate);
                        $rootScope.endDate = formatDate(newEndDate);
                        setSearchDates($rootScope.startDate, $rootScope.endDate);
                        searchReservations();
                    }
                }, function() {
                    console.log("error");
                });
            }

            function ModalInstance($scope, $modalInstance) {
                //Don't use $scope.continue, 'continue' is a reserved keyword
                $scope.ok = function() {
                    $scope.proceed = true;
                    $modalInstance.close($scope.proceed);
                };
                $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                };
            }

            function callOfflineModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'offlineModal',
                    controller: ModalInstance
                });
                modalInstance.result.then(function(answer) {
                    if (answer === true) {
                        if ($scope.server.user_login === $scope.username && $scope.server.user_password === $scope.password) {
                            $rootScope.user = $scope.user;
                            $rootScope.searchString = $rootScope.user + 'Reservations';
                            $rootScope[$rootScope.searchString] = JSON.parse(localStorage.getItem($rootScope.searchString));
                            $rootScope.searchRangeStart = localStorage.getItem($scope.user + "SearchRangeStart");
                            $rootScope.searchRangeEnd = localStorage.getItem($scope.user + "SearchRangeEnd");
                            $rootScope.absentDays = JSON.parse(localStorage.getItem($scope.user + "AbsentDays"));
                            $rootScope.publicHolidays = JSON.parse(localStorage.getItem($scope.user + "PublicHolidays"));
                            $rootScope.currentdate = new Date();
                            $rootScope.isOffline = true;
                            //pageTransition('next');
                            $location.path('/doctor/appointmentsView');
                        }
                        else {
                            $scope.loggingIn = false;
                            $scope.error = true;
                            $scope.errormessage = $rootScope.getLocalizedString('loginError');
                            ;
                        }
                    }
                }, function() {
                    console.log("error");
                });
            }

        }).
        controller('MainmenuCtrl', function($scope, $location, $rootScope) {
            alert('main');
            
            /**
             * If the user in rootScope is not set, the user is not logged in
             * and is redirected to the login screen. Otherwise the user model
             * will be set with the rootScope.
             */
            if ($rootScope.user === null || angular.isUndefined($rootScope.user)) {
                $location.path('/login');
            } else {
                $scope.user = $rootScope.user;
            }

            /**
             * rootScope user and type will be set to null and the user will be 
             * redirected to the login.
             * screen.
             */
            
            $scope.logout = function() {
                $rootScope.user = null;
                $rootScope.type = null;
                pageTransition('prev');
                $location.path('/login');
            };
            $scope.createAppointment = function() {
                $location.path('/login');
            };
            /**
             * Depending on the type of user, the user will be redirected to 
             * the appropriate appointments screen.
             */
            $scope.viewAppointments = function() {
                if ($rootScope.type === 0) {
                    $location.path('/doctor/appointmentsSearch');
                } else {
                    if ($rootScope.type === 1) {
                        $location.path('/patient/appointmentsPatient');
                    }
                }
            };
            $scope.settings = function() {
                $location.path('/settings');
            };
        }).
        controller('DoctorViewAppointmentsCtrl', function($scope, $rootScope, $location, $q, hospiviewFactory, dataFactory) {

            console.log($rootScope.depFilter);

            $scope.loadingCalendar = false;
            $scope.eventPerDay;
            if ($rootScope.eventClick == true) {
                $scope.date = formatDate(new Date($rootScope.currentdate));
                $scope.showDate = formatShowDate(new Date($scope.date), $rootScope.languageID);
            } else {
                var lowestDate = new Date(2500, 1, 1);
                for (var i = 0; i < $rootScope[$rootScope.searchString].length; i++) {
                    var compareDate = new Date($rootScope[$rootScope.searchString][i].the_date);
                    if (compareDate < lowestDate && compareDate >= new Date()) {
                        lowestDate = compareDate;
                    }
                }
                $scope.date = formatDate(new Date(lowestDate));
                $scope.showDate = formatShowDate(lowestDate, $rootScope.languageID);
            }
            var user = JSON.parse(localStorage.getItem($rootScope.user));
            $scope.cellcontent = user.cellcontent;

            $scope.reservations = $rootScope[$rootScope.searchString];

            $scope.nextDay = function() {
                var newDate = new Date($scope.date);
                newDate.setDate(newDate.getDate() + 1);
                $scope.date = formatDate(newDate);
                $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                if (new Date($scope.date) > new Date($rootScope.searchRangeEnd)) {
                    search(newDate, 1);
                }
            };
            $scope.previousDay = function() {
                var newDate = new Date($scope.date);
                newDate.setDate(newDate.getDate() - 1);
                $scope.date = formatDate(newDate);
                $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                if (new Date($scope.date) < new Date($rootScope.searchRangeStart)) {
                    search(newDate, 2)
                }
            };

            $scope.details = function(reservation) {
                $rootScope.reservationDetail = reservation;
                $rootScope.currentdate = reservation.the_date;
                $location.path('/doctor/appointmentDetail');
            };

            $scope.settings = function() {
                $location.path('/settings');
            };

            $scope.filter = function() {
                $location.path('/appointmentsFilter');
            };

            $scope.calendarView = function() {
                if ($rootScope.isOffline === true) {
                    $location.path('/appointmentsCalendar');
                } else {
                    $scope.loadingCalendar = true;
                    var searchStart = new Date($rootScope.searchRangeStart);
                    var searchEnd = new Date($rootScope.searchRangeEnd);
                    var current = new Date($rootScope.currentdate);
                    var request1 = false;
                    var request2 = false;
                    if (searchEnd.getMonth() <= current.getMonth()) {

                        $rootScope.startDate = new Date(searchEnd);
                        searchEnd.setMonth(current.getMonth() + 1);
                        searchEnd.setDate(1);
                        $rootScope.endDate = new Date(searchEnd);
                        request1 = true;
                    }
                    if (searchEnd.getMonth() > current.getMonth()) {
                        if (searchEnd.getFullYear() < current.getMonth())
                            searchEnd.setFullYear(current.getFullYear() - 1);
                        $rootScope.endDate = new Date(searchEnd);
                    }
                    if (searchStart.getMonth() >= current.getMonth() && searchStart.getDate() > 1) {
                        $rootScope.endDate = new Date(searchStart);
                        searchStart.setMonth(current.getMonth());
                        searchStart.setDate(1);
                        $rootScope.startDate = new Date(searchStart);
                        request2 = true;
                    }
                    if (searchStart.getMonth() < current.getMonth()) {
                        if (searchStart.getFullYear() > current.getMonth())
                            searchStart.setFullYear(current.getFullYear() - 1);
                        $rootScope.startDate = new Date(searchStart);
                    }
                    if (request1 == true && request2 == true) {
                        $rootScope[$rootScope.searchString] = [];
                        $rootScope.startDate = searchStart;
                        $rootScope.endDate = searchEnd;
                    }
                    if (request1 == true || request2 == true) {
                        search();
                    } else {
                        $location.path('/appointmentsCalendar');
                    }
                }
            };
            $scope.style = function(value) {
                var color = '#' + value;
                return {"background-color": color};
            };
            $scope.logout = function() {
                $rootScope.user = null;
                $rootScope.type = null;
                //pageTransition('prev');
                $location.path('/login');
            };
            function search(newDate, swipe) {
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                hospiviewFactory.getUnitAndDepList($rootScope.currentServer.uuid, $rootScope.currentServer.hosp_url)
                        .then(function(response) {
                            dataFactory.setSearchUnits(response);
                        }, error)
                        .then(function() {
                            setData(newDate, swipe);
                        }, error);
            }

            function setData(newDate, swipe) {
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                dataFactory.searchReservations()
                        .then(function(reservations) {
                            setReservations(reservations);
                        }, error);
            }

            function error(data) {
                $scope.loggingIn = false;
                $scope.error = true;
                $scope.errormessage = data;
            }

            function setReservations(reservations) {
                for (var i = 0; i < reservations.length; i++)
                    $rootScope[$rootScope.searchString].push(reservations[i]);
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    //pageTransition('next');
                    $location.path('/appointmentsCalendar');
                }
            }
            function callModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: ModalInstance,
                });
                modalInstance.result.then(function(answer) {
                    if (answer === true) {
                        var newStartDate = new Date($rootScope.startDate);
                        newStartDate.setDate(newStartDate.getDate() + 14);
                        var newEndDate = new Date($rootScope.endDate);
                        newEndDate.setDate(newEndDate.getDate() + 14);
                        $rootScope.startDate = formatDate(newStartDate);
                        $rootScope.endDate = formatDate(newEndDate);
                        setSearchDates($rootScope.startDate, $rootScope.endDate);
                        searchReservations();
                    }
                }, function() {
                    console.log("error");
                });
            }

            function ModalInstance($scope, $modalInstance) {
                //Don't use $scope.continue, 'continue' is a reserved keyword
                $scope.ok = function() {
                    $scope.proceed = true;
                    $modalInstance.close($scope.proceed);
                };
                $scope.cancel = function() {
                    $scope.proceed = false;
                    $modalInstance.dismiss('cancel');
                };
            }
        }).
        controller('FilterCtrl', function($scope, $rootScope, $location, hospiviewFactory) {

            $scope.back = function() {
                $location.path('/doctor/appointmentsView');
            };

            var user = JSON.parse(localStorage.getItem($rootScope.user));
            $scope.servers = user.servers;

            $scope.loadUnit = function() {
                if (!(angular.isUndefined($scope.serverFilter))) {
                    if ($scope.serverFilter == null) {
                        $scope.disableUnits = true;
                        $scope.disableDepartments = true;
                    }
                    else {
                        $scope.disableUnits = false;
                        $scope.units = $rootScope['allUnitsAndGroups.' + $scope.serverFilter.id];
                    }
                }
            };

            $scope.loadDep = function() {
                if (!(angular.isUndefined($scope.unitFilter))) {
                    if ($scope.unitFilter == null || $scope.unitFilter.type == "group")
                        $scope.disableDepartments = true;
                    else {
                        $scope.disableDepartments = false;
                        for (var i = 0; i < $scope.unitFilter.Detail.Dep.length; i++) {
                            if ($scope.unitFilter.Detail.Dep[i].dep_name === "") {
                                $scope.unitFilter.Detail.Dep[i].dep_name = "Allemaal";
                                break;
                            }
                        }
                        $scope.departments = $scope.unitFilter.Detail.Dep;
                    }
                }
            };

            if (angular.isUndefined($rootScope.serverFilter) || $rootScope.serverFilter === '' || $rootScope.serverFilter == null) {
                $rootScope.serverFilter = '';
                $scope.disableUnits = true;
                $scope.disableDepartments = true;
            } else {
                for (var i = 0; i < $scope.servers.length; i++)
                    if ($scope.servers[i].id === $rootScope.serverFilter.id)
                        $scope.serverFilter = $scope.servers[i];
                $scope.loadUnit();
                if (angular.isUndefined($rootScope.unitFilter) || $rootScope.unitFilter === '' || $rootScope.unitFilter == null) {
                    $rootScope.unitFilter = '';
                    $rootScope.depFilter = '';
                    $scope.disableDepartments = true;
                } else {
                    for (var i = 0; i < $scope.units.length; i++)
                        if ($scope.units[i].Header.name === $rootScope.unitFilter.Header.name)
                            $scope.unitFilter = $scope.units[i];
                    $scope.loadDep();
                    console.log($rootScope.depFilter);
                    if (angular.isUndefined($rootScope.depFilter) || $rootScope.depFilter === '' || $rootScope.depFilter == null) {
                        $rootScope.depFilter = '';
                    } else {
                        for (var i = 0; i < $scope.departments.length; i++)
                            if ($scope.departments[i].dep_name === $rootScope.depFilter.dep_name)
                                $scope.depFilter = $scope.departments[i];
                        console.log($scope.depFilter);
                    }
                }
            }


            if ($rootScope.serverAdded === true || $rootScope.serverChanged === true || angular.isUndefined($rootScope.allUnitsAndGroups)) {
                $rootScope.serverChanger = false;
                $rootScope.serverAdded = false;

                for (var j = 0; j < user.servers.length; j++) {
                    var unitsandgroups = [];

                    /*variable created to refresh the scope of the user variable*/
                    var selectedServer = user.servers[j];
                    hospiviewFactory.getUnitAndDepList(selectedServer.uuid, selectedServer.hosp_url).
                            success(function(data) {
                                var json = parseJson(data);
                                if (json.UnitsAndDeps.Header.StatusCode == 1) {
                                    var units = json.UnitsAndDeps.Detail.Unit;
                                    for (var i = 0; i < units.length; i++) {
                                        units[i].type = "doctor";
                                        units[i].Header.name = units[i].Header.unit_name;
                                        unitsandgroups.push(units[i]);
                                    }
                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = "Fout in de gegevens.";
                                }
                            }).
                            error(function() {
                                alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                            });
                    hospiviewFactory.getUnitDepGroups(selectedServer.uuid, selectedServer.hosp_url).
                            success(function(data) {
                                var json = parseJson(data);
                                if (json.UnitDepGroups.Header.StatusCode == 1) {
                                    var groups = json.UnitDepGroups.Detail.Group;
                                    for (var i = 0; i < groups.length; i++) {
                                        groups[i].type = "group";
                                        groups[i].Header.name = groups[i].Header.group_name;
                                        unitsandgroups.push(groups[i]);
                                    }
                                    var rootScopeString = 'allUnitsAndGroups.' + selectedServer.id;
                                    $rootScope[rootScopeString] = unitsandgroups;
                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                                }
                            }).
                            error(function() {
                                alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                            });
                }
            }

            $scope.applyFilter = function() {
                if ($scope.serverFilter !== '')
                    $rootScope.serverFilter = $scope.serverFilter;
                if ($scope.unitFilter !== '')
                    $rootScope.unitFilter = $scope.unitFilter;
                if ($scope.depFilter !== '')
                    $rootScope.depFilter = $scope.depFilter;
                $location.path('/doctor/appointmentsView');
            };

            $scope.removeFilter = function() {
                $rootScope.unitFilter = '';
                $scope.depFilter = '';
                $location.path('/doctor/appointmentsView');
            }
        }).
        controller('searchCtrl', function($scope, $rootScope, hospiviewFactory, dataFactory) {
            $scope.next = function() {
                if ($rootScope.isOffline === true) {
                    $('#doctorCalendar').fullCalendar('next');
                } else {
                    calendarView('next');
                }
            };
            $scope.prev = function() {
                if ($rootScope.isOffline === true) {
                    $('#doctorCalendar').fullCalendar('prev');
                } else {
                    calendarView('prev');
                }
            };
            $scope.loadingMonth = false;
            function calendarView(calendarBrows) {
                var searchStart = new Date($rootScope.searchRangeStart);
                var searchEnd = new Date($rootScope.searchRangeEnd);
                var calendarDate = $("#doctorCalendar").fullCalendar('getDate');
                var current = new Date(calendarDate);
                var nextMonthCount = 0;
                if (calendarBrows === 'prev')
                    nextMonthCount--;
                else
                    nextMonthCount++;
                var request1 = false;
                var request2 = false;
                if (calendarBrows === 'next') {
                    if (current.getMonth() == 11 && searchEnd.getFullYear() == current.getFullYear()) {
                        $rootScope.endDate = formatDate(new Date(searchEnd.getFullYear() + 1, 0, 1));
                        searchStart.setMonth(current.getMonth() + nextMonthCount);
                        searchStart.setDate(1);
                        $rootScope.startDate = formatDate(new Date(searchStart));
                        request2 = true;
                    }
                    else {
                        if (searchEnd.getMonth() <= current.getMonth() + nextMonthCount && searchEnd.getFullYear() == current.getFullYear()) {
                            if (calendarBrows === 'prev')
                                nextMonthCount--;
                            else
                                nextMonthCount++;
                            $rootScope.startDate = formatDate(new Date(searchEnd));
                            searchEnd.setMonth(current.getMonth() + nextMonthCount);
                            searchEnd.setDate(1);
                            $rootScope.endDate = formatDate(new Date(searchEnd));
                            request1 = true;
                        }
                    }
                }

                if (calendarBrows === 'prev') {
                    if (current.getMonth() == 0 && searchStart.getFullYear() == current.getFullYear()) {
                        $rootScope.startDate = formatDate(new Date(searchStart.getFullYear() - 1, 11, 1));
                        searchEnd.setMonth(current.getMonth() + nextMonthCount);
                        searchEnd.setDate(1);
                        $rootScope.endDate = formatDate(new Date(searchEnd));
                        request1 = true;
                    }
                    else {
                        if (searchStart.getMonth() > current.getMonth() + nextMonthCount && searchStart.getFullYear() == current.getFullYear()) {
                            $rootScope.endDate = formatDate(new Date(searchStart));
                            searchStart.setMonth(current.getMonth() + nextMonthCount);
                            searchStart.setDate(1);
                            $rootScope.startDate = formatDate(new Date(searchStart));
                            request2 = true;
                        }
                    }
                }
                if (request1 == true || request2 == true) {
                    search(calendarBrows);
                } else {
                    $('#doctorCalendar').fullCalendar(calendarBrows);
                }
            }

            function search(calendarBrows) {
                $scope.loadingMonth = true;
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                hospiviewFactory.getUnitAndDepList($rootScope.currentServer.uuid, $rootScope.currentServer.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response);
                        }, error)
                        .then(function() {
                            setData(calendarBrows);
                        }, error);
            }

            /**
             * Rejected promises will be handled by this function
             * 
             * @param {type} data
             */
            function error(data) {
                $scope.loadingCalendar = false;
                $scope.error = true;
                $scope.errormessage = data;
            }

            function setData(calendarBrows) {
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                dataFactory.searchReservations()
                        .then(function(reservations) {
                            setReservations(reservations, calendarBrows);
                        }, error);
            }

            function setReservations(reservations, calendarBrows) {
                for (var i = 0; i < reservations.length; i++) {
                    $rootScope[$rootScope.searchString].push(reservations[i]);
                }
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal(calendarBrows);
                } else {
                    var countEvent = dataFactory.loadCalendar();
                    localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    $('#doctorCalendar').fullCalendar('removeEvents');
                    $('#doctorCalendar').fullCalendar('addEventSource', countEvent);
                    $scope.loadingMonth = false;
                    $('#doctorCalendar').fullCalendar(calendarBrows);
                }
            }

            function callModal(calendarBrows) {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: ModalInstance,
                });
                modalInstance.result.then(function(answer) {
                    if (answer === true) {
                        var newStartDate = new Date($rootScope.startDate);
                        newStartDate.setDate(newStartDate.getDate() + 14);
                        var newEndDate = new Date($rootScope.endDate);
                        newEndDate.setDate(newEndDate.getDate() + 14);
                        $rootScope.startDate = formatDate(newStartDate);
                        $rootScope.endDate = formatDate(newEndDate);
                        setSearchDates($rootScope.startDate, $rootScope.endDate);
                        searchReservations(calendarBrows);
                    }
                }, function() {
                    console.log("error");
                });
            }

            function ModalInstance($scope, $modalInstance) {
                //Don't use $scope.continue, 'continue' is a reserved keyword
                $scope.ok = function() {
                    $scope.proceed = true;
                    $modalInstance.close($scope.proceed);
                };
                $scope.cancel = function() {
                    $scope.proceed = false;
                    $modalInstance.dismiss('cancel');
                };
            }
            ;
        }).
        controller('DoctorViewappointmentDetailCtrl', function($scope, $location, $rootScope) {
            $scope.reservation = $rootScope.reservationDetail;
            $scope.back = function() {
                //pageTransition('next');
                $location.path('/doctor/appointmentsView');
            };
        }).
        controller('DoctorViewAppointmentsCalendarCtrl', function($scope, $location, $rootScope, $interval, dataFactory) {

            var current = new Date($rootScope.currentdate);
            var showWeekends = false;
            $scope.back = function() {
                //pageTransition('prev');
                $location.path('/doctor/appointmentsView');
            };
            $scope.uiConfig = {
                calendar: {
                    height: 500,
                    editable: false,
                    defaultView: 'month',
                    timeFormat: 'H:mm',
                    month: current.getMonth(),
                    year: current.getFullYear(),
                    firstDay: 1,
                    weekNumbers: true,
                    monthNames: getMonthNames($rootScope.languageID),
                    dayNamesShort: getDayNamesShort($rootScope.languageID),
                    weekends: showWeekends,
                    header: {
                        left: '',
                        center: 'title',
                        right: ''
                    },
                    titleFormat: {
                        day: 'd/m'
                    },
                    eventClick: function(calEvent, jsEvent, view) {
                        var getClickedDay = calEvent.start;
                        $rootScope.currentdate = formatDate(new Date(getClickedDay.getFullYear(), getClickedDay.getMonth(), getClickedDay.getDate()));
                        $rootScope.eventClick = true;
                        window.location.href = 'index.html#/doctor/appointmentsView';
                    }
                }
            };
            var countEvent = dataFactory.loadCalendar();
            $scope.eventSources = [countEvent];
//            $('#doctorCalendar').fullCalendar('addEventSource', [countEvent]);
            $scope.next = function() {
                $('#doctorCalendar').fullCalendar('next');
            }
            $scope.prev = function() {
                $('#doctorCalendar').fullCalendar('prev');
            }
            $scope.today = function() {
                $('#doctorCalendar').fullCalendar('today');
            }

            $scope.weekend = function() {
                $scope.uiConfig.calendar.weekends = !$scope.uiConfig.calendar.weekends;
            };
        }).
        controller('PatientViewAppointmentsCtrl', function($scope, $location) {
            $scope.backToMainMenu = function() {
                //pageTransition('prev');
                $location.path('/mainmenu');
            };
        }).
        controller('SettingsCtrl', function($scope, $location, $rootScope) {

            $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
            $scope.servers = $scope.selectedUser.servers;

            $scope.server1 = true;
            $scope.server2 = false;
            $scope.server3 = false;

            $scope.abbreviation1 = $scope.selectedUser.servers[0].hosp_short_name;

            if ($scope.servers.length >= 2) {
                $scope.abbreviation2 = $scope.selectedUser.servers[1].hosp_short_name;
                $scope.showServer2 = true;
            }
            if ($scope.servers.length == 3) {
                $scope.abbreviation3 = $scope.selectedUser.servers[2].hosp_short_name;
                $scope.showServer3 = true;
            }

            $scope.server1Select = function() {
                $scope.server1 = true;
                $scope.server2 = false;
                $scope.server3 = false;
                $scope.server1Img = "img/hospi.png";
                $scope.server2Img = "img/hospi-gray.png";
                $scope.server3Img = "img/hospi-gray.png";
            }
            $scope.server2Select = function() {
                $scope.server1 = false;
                $scope.server2 = true;
                $scope.server3 = false;
                $scope.server1Img = "img/hospi-gray.png";
                $scope.server2Img = "img/hospi.png";
                $scope.server3Img = "img/hospi-gray.png";
            }
            $scope.server3Select = function() {
                $scope.server1 = false;
                $scope.server2 = false;
                $scope.server3 = true;
                $scope.server1Img = "img/hospi-gray.png";
                $scope.server2Img = "img/hospi-gray.png";
                $scope.server3Img = "img/hospi.png";
            }

            $scope.cellcontentchange = function(newCellcontent) {
                $scope.selectedUser.cellcontent = newCellcontent;
            };
            $scope.save = function() {
                for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                    if ($scope.selectedUser.servers[i].id == $scope.server.id)
                    {
                        $scope.selectedUser.servers[i] = $scope.server;
                        localStorage.setItem($rootScope.user, JSON.stringify($scope.selectedUser));
                    }
                }
                //pageTransition('prev');
                $location.path('/doctor/appointmentsView');
            };
            $scope.addOrEditServer = function(action, server) {
                if (action === "add" && $scope.selectedUser.servers.length === 3)
                    alert("Er kunnen maximaal 3 ziekenhuizen worden opgeslaan.");
                else {
                    if (action === "edit")
                        $rootScope.editServer = server;
                }
                //pageTransition('next');
                $location.path('/selectserver/' + action);
            };
        }).
        controller('SelectserverCtrl', function($scope, $location, $rootScope, $routeParams, hospiviewFactory) {

            /**
             * If it's the first time a user uses the application, the back button
             * has to be hidden so the user is foreced to select a server.
             */
            if ($routeParams.action == "new")
                $scope.newBoolean = true;
            else
                $scope.newBoolean = false;

            /**
             * Uses hospiviewFactory to do a request. On success the XML will be
             * parsed too JSON. The servers will be put in the $scope servers.
             * If 
             */
            hospiviewFactory.getHospiViewServerList().
                    success(function(data) {
                        var json = parseJson(data);
                        $scope.servers = json.HospiviewServerList.Detail.Server;
                    }).
                    error(function() {
                        alert($rootScope.getLocalizedString('connectionError'));
                    });

            /**
             * Set to false to hide the next part of the form. If the user selected
             * a hospital, it will be set to true.
             */
            $scope.serverSelected = false;

            /**
             * Set to null so no radioButton is selected. The moment a radioButton
             * is selected the other, the right information will be shown.
             */
            $scope.accountRadio = null;
            $scope.accountTrue = false;
            $scope.accountFalse = false;

            /**
             * Set to true if the user wishes to save his password on his/her
             * device.
             */
            $scope.showPasswordBoolean = false;
            $scope.savePassword = false;


            $scope.datenr = {nr: $scope.nationalRegister, date: $scope.dateOfBirth};
            $scope.userFunctionList = [$rootScope.getLocalizedString('newFunctionPatient'),
                $rootScope.getLocalizedString('newFunctionRepresentative'),
                $rootScope.getLocalizedString('newFunctionHouseDoctor'),
                $rootScope.getLocalizedString('newFunctionDoctor')];
            $scope.userFunctionSelected = false;
            $scope.needsNationalReg = function(userFunction) {
                return userFunction === $rootScope.getLocalizedString('newFunctionPatient') || userFunction === $rootScope.getLocalizedString('newFunctionRepresentative');
            };
            $scope.needsRiziv = function(userFunction) {
                return userFunction === $rootScope.getLocalizedString('newFunctionDoctor') || userFunction === $rootScope.getLocalizedString('newFunctionHouseDoctor');
            };
            $scope.requestAccount = function() {
                $scope.requestMessage = $rootScope.getLocalizedString('newUserRequestMessage');
                $scope.accountRadio = $rootScope.getLocalizedString('yes');
                $scope.accountTrue = true;
                $scope.accountFalse = false;
            };
            $scope.savePasswordWarning = function() {
                if ($scope.savePassword == false)
                    alert($rootScope.getLocalizedString('loginPasswordCheckedMessage'));
            };
            $scope.login = function() {
                if (angular.isUndefined($scope.username) && angular.isUndefined($scope.password)) {
                    $scope.error = true;
                    $scope.errormessage = "Gelieve uw gegevens in te vullen";
                } else {
                    hospiviewFactory.getAuthentication($scope.username, $scope.password, $scope.server.hosp_url).
                            success(function(data) {
                                var json = parseJson(data);
                                var localStorageName = json.Authentication.Detail.user_name;
                                if (json.Authentication.Header.StatusCode == 1) {
                                    if ($routeParams.action == "new" || $routeParams.action == "newLocalUser") {
                                        if (localStorage.getItem(localStorageName) === null) {
                                            $scope.error = false;
                                            $rootScope.user = localStorageName;
                                            $rootScope.currentServer = $scope.server;
                                            if ($routeParams.action == "new")
                                                addToLocalStorage("users", [{"username": localStorageName}]);
                                            else {
                                                var localUsers = JSON.parse(localStorage.getItem("users"));
                                                localUsers.push({"username": localStorageName});
                                                localStorage.setItem("users", JSON.stringify(localUsers));
                                            }
                                            addToLocalStorage(localStorageName,
                                                    {"servers": [{"id": $rootScope.currentServer.id,
                                                                "hosp_short_name": $rootScope.currentServer.hosp_short_name,
                                                                "hosp_full_name": $rootScope.currentServer.hosp_full_name,
                                                                "hosp_url": $rootScope.currentServer.hosp_url,
                                                                "user_password": $scope.password,
                                                                "user_login": $scope.username,
                                                                "reg_no": json.Authentication.Detail.reg_no,
                                                                "unique_pid": json.Authentication.Detail.unique_pid,
                                                                "uuid": json.Authentication.Detail.uuid,
                                                                "isexternal": json.Authentication.Detail.isexternal,
                                                                "shortcut1": {"unit": "", "department": ""},
                                                                "shortcut2": {"unit": "", "department": ""},
                                                                "shortcut3": {"unit": "", "department": ""}}],
                                                        "save_password": $scope.savePassword,
                                                        "language_id": json.Authentication.Detail.language_id,
                                                        "cellcontent": 'patient',
                                                        "refreshrate": 60});
                                            if (json.Authentication.Detail.isexternal == 0)
                                                $rootScope.type = 0;
                                            else
                                                $rootScope.type = 1;
                                            $rootScope.user = null;
                                            $rootScope.type = null;
                                            //pageTransition('next');
                                            $location.path('/login');
                                        } else {
                                            $scope.error = true;
                                            $scope.errormessage = "Account is reeds op dit toestel toegevoegd.";
                                        }
                                    } else {
                                        if ($routeParams.action == "add") {
                                            var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                                            var addServer = {"id": $scope.server.id,
                                                "hosp_full_name": $scope.server.hosp_full_name,
                                                "hosp_url": $scope.server.hosp_url,
                                                "user_password": $scope.password,
                                                "user_login": $scope.username,
                                                "reg_no": json.Authentication.Detail.reg_no,
                                                "unique_pid": json.Authentication.Detail.unique_pid,
                                                "uuid": json.Authentication.Detail.uuid,
                                                "isexternal": json.Authentication.Detail.isexternal,
                                                "shortcut1": {"unit": "", "department": ""},
                                                "shortcut2": {"unit": "", "department": ""},
                                                "shortcut3": {"unit": "", "department": ""}};
                                            selectedUser.servers.push(addServer);
                                            localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                                            $rootScope.serverAdded = true;
                                        } else {
                                            var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                                            for (var i = 0; i < selectedUser.servers.length; i++) {
                                                if (selectedUser.servers[i].id == $rootScope.editServer.id) {
                                                    var editServer = {"id": $scope.server.id,
                                                        "hosp_full_name": $scope.server.hosp_full_name,
                                                        "hosp_url": $scope.server.hosp_url,
                                                        "user_password": $scope.password,
                                                        "user_login": $scope.username,
                                                        "reg_no": json.Authentication.Detail.reg_no,
                                                        "unique_pid": json.Authentication.Detail.unique_pid,
                                                        "uuid": json.Authentication.Detail.uuid,
                                                        "isexternal": json.Authentication.Detail.isexternal,
                                                        "shortcut1": {"unit": "", "department": ""},
                                                        "shortcut2": {"unit": "", "department": ""},
                                                        "shortcut3": {"unit": "", "department": ""}};
                                                    selectedUser.servers[i] = editServer;
                                                }
                                            }
                                            localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                                            $rootScope.serverChanged = true;
                                        }
                                        $rootScope.user = null;
                                        $rootScope.type = null;
                                        //pageTransition('next');
                                        $location.path('/login');
                                    }

                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = $rootScope.getLocalizedString('loginError');
                                }
                            }).
                            error(function() {
                                alert($rootScope.getLocalizedString('connectionError'));
                            });
                }
            };

            /**
             * Adds a new animation to the screentransition and redirects to
             * the settings page.
             */
            $scope.cancel = function() {
                //pageTransition('prev');
                $location.path('/settings');
            };

            /**
             * By clicking on the icon in the passwordfield, you can either
             * show or hide the password
             */
            $scope.showpassword = function() {
                $scope.showPasswordBoolean = !$scope.showPasswordBoolean;
            };
        });
