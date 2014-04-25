'use strict';
/* Controllers */

angular.module('myApp.controllers', []).
        controller('LoginCtrl', function($scope, $location, $route, $q, $rootScope, $modal, hospiviewFactory, dataFactory) {

            /**
             * Adds an event listener to the ICASA logo to redirect the user
             * to the ICASA site.
             */
            $('.icasaLogo').live('tap', function() {
                var url = $(this).attr("rel");
                loadURL(url);
            });

            /**
             * Set the counter for the refresh back to 0. The interval depends on
             * the user.
             */
            $rootScope.refreshCounter = 0;

            /**
             * If the app is never used, the language will be set to English.
             * Otherwise, the saved language will be used.
             */
            if (localStorage.getItem("language") === null) {
                localStorage.setItem("language", 3);
                $rootScope.languageID = 3;
            } else {
                $rootScope.languageID = parseInt(localStorage.getItem("language"));
            }

            /**
             * Empty the variables used to filter the appointments.
             */
            $rootScope.filterActive = '';
            $rootScope.serverFilter = '';
            $rootScope.unitFilter = '';
            $rootScope.depFilter = '';

            /**
             * $rootScope.searchRangeStart tracks the earliest date checked
             * for appointments and $rootScope.searchRangeEnd tracks the last
             * date. These variables are being deleted on the login screen, 
             * otherwise dates in this range would be skipped while retrieving 
             * appointments.
             */
            $rootScope.searchRangeStart = undefined;
            $rootScope.searchRangeEnd = undefined;

            /**
             * showPasswordBoolean will be set to false.
             */
            $scope.showPasswordBoolean = false;

            /**
             * Check if the localStorage item "users" exists. If is doesn't,
             * it means this is the first time the application is running. 
             * The user will then be redirected to the selectserver.html page.
             * 
             * Else, the localStorage item "users" will be used to create a
             * list of users of the application.
             */
            if (localStorage.getItem("users") === null) {
                $location.path('/selectserver/new');
            } else {
                $scope.users = JSON.parse(localStorage.getItem("users"));
                $("#loginDiv").removeClass("invisible");
            }

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
                $scope.username = [];
                $scope.password = [];
                $scope.savePassword = [];
                if (angular.isDefined($scope.user)) {
                    $scope.selectedUser = JSON.parse(localStorage.getItem($scope.user));
                    $scope.servers = $scope.selectedUser.servers;
                    $scope.serverRadio = $scope.servers[0];
                    for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                        var checkboxString = "checkboxImgServer" + i;
                        if ($scope.selectedUser.servers[i].save_password === false) {
                            $scope[checkboxString] = 0;
                            $scope.selectedUser.servers[i].user_password = "";
                        } else {
                            $scope[checkboxString] = 1;
                        }
                    }
                    $scope.getLoginUser(0);
                } else {
                    $scope.servers[0] = undefined;
                    $scope.servers[1] = undefined;
                    $scope.servers[2] = undefined;
                    $scope.username[0] = "";
                    $scope.password[0] = "";
                    $scope.savePassword[0] = false;
                }
            };

            /**
             * Will be called on change in the select. Checks if the server model
             * is empty. If it isn't, the username will be automatically filled
             * out. Depending on the usersettings, the passwordfield will be 
             * filled out and the savePassword checkbox will be checked.
             */
            $scope.getLoginUser = function(index) {
                if (angular.isDefined($scope.servers[index])) {

                } else {
                    $scope.username[index] = "";
                    $scope.password[index] = "";
                    $scope.savePassword[index] = false;
                }
            };

            /**
             * 27.03.2014 Stijn Ceunen
             * If only 1 user is saved, this one will automatically be selected.
             */
            if ($scope.users !== undefined)
                if ($scope.users.length === 1) {
                    $scope.user = $scope.users[0].username;
                    $scope.getServersUser();
                    if ($scope.servers.length === 1) {
                        $scope.server = $scope.servers[0];
                        $scope.getLoginUser();
                    }
                } else {
                    $scope.serverRadio = false;
                    console.log($scope.servers);
                }

            $scope.changeCheckbox = function(serverNr) {
                var checkboxString = "checkboxImgServer" + serverNr;
                $scope.selectedUser.servers[serverNr].save_password = !$scope.selectedUser.servers[serverNr].save_password;
                if ($scope[checkboxString] === 0) {
                    $scope[checkboxString] = 1;
                } else {
                    $scope[checkboxString] = 0;
                }
                if ($scope[checkboxString] === 1)
                    alert($rootScope.getLocalizedString('loginPasswordCheckedMessage'));
            }

            /**
             * Throw a warning if the user checks the savePassword checkbox.
             */
            $scope.savePasswordWarning = function(savePassword) {
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
             * 
             */
            $scope.login = function() {
                $scope.loggingIn = true;
                $scope.error = false;
                var promises = [],
                        invalidFields = [],
                        authFailed = false,
                        validServers = [];

                $rootScope.currentServers = [];
                $scope.failedServers = [];
                console.log("all servers: " + $scope.selectedUser.servers.length);
                for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                    console.log($scope.selectedUser.servers[i].user_password);

                    invalidFields[i] = angular.isUndefined($scope.selectedUser.servers[i].user_password)  || $scope.selectedUser.servers[i].user_password==="";
                    if (!invalidFields[i]) {
                        promises.push(hospiviewFactory.getAuthentication($scope.selectedUser.servers[i].user_login, $scope.selectedUser.servers[i].user_password, $scope.selectedUser.servers[i].hosp_url));
                        validServers.push($scope.selectedUser.servers[i]);
                    } else
                        $scope.failedServers.push($scope.selectedUser.servers[i].hosp_short_name);
                }

                $q.all(promises).then(function(responses) {
                    console.log($scope.selectedUser);
                    console.log("servers with valid fields: " + promises.length);
                    if (responses.length == 0)
                        authFailed = true;
                    for (var r = 0; r < responses.length; r++) {
                        var json = parseJson(responses[r].data);
                        if (json.Authentication.Header.StatusCode != 1) {
                            console.log(validServers[r].hosp_full_name + " auth failed " + r);
                            $scope.failedServers.push(validServers[r].hosp_short_name);
                            if ($scope.failedServers.length == $scope.selectedUser.servers.length)
                                authFailed = true;
                        } else {
                            console.log(validServers[r].hosp_full_name + " auth success " + r);
                            $scope.error = false;
                            $rootScope.user = $scope.user;
                            $rootScope.type = parseInt(json.Authentication.Detail.isexternal);


                            validServers[r].uuid = json.Authentication.Detail.uuid;
                            console.log(json.Authentication.Detail.uuid + " ");
                            validServers[r].save_password = $scope.selectedUser.servers[r].save_password;
                            console.log($scope.selectedUser.servers[r].save_password);
                            $rootScope.currentServers.push(validServers[r]);
                            console.log($scope.selectedUser);
                            var saveUserSettings = JSON.parse(localStorage.getItem($scope.user));
                            console.log(saveUserSettings);
                            saveUserSettings.servers[r] = validServers[r];
                            localStorage.setItem($scope.user, JSON.stringify(saveUserSettings));
                        }
                    }
                    console.log("auth failed: " + authFailed);
                    if (!authFailed) {
                        setDates();
                        switch ($rootScope.type) {
                            case 0:
                            case 1:
                                postLoginDoctor();
                                break;
                            case 2:
                                postLoginPatient();
                                break;
                        }
                    } else {
                        $scope.loggingIn = false;
                        $scope.error = true;
                        $scope.errormessage = $rootScope.getLocalizedString('loginError');
                    }
                }, function() {
                    $scope.loggingIn = false;
                    callOfflineModal();
                });
            };

            /**
             * loads all the necessary data from the server using the methods of hospiviewfactory and datafactory
             * 
             */
            function postLoginDoctor() {
                var year = new Date().getFullYear().toString(),
                        holidayPromise = [];

                //SearchUnits
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                //Absent days
                $rootScope.absentDays = [];

                //Reset holidays
                $rootScope.publicHolidays = [];
                for (var i = 1; i < 4; i++) {
                    holidayPromise.push(hospiviewFactory.getPublicHolidays(i, year, '00', $rootScope.currentServers[0].hosp_url));
                }
                $q.all(holidayPromise).then(function(responses) {
                    dataFactory.setHolidays(responses);
                }, error);
                //End reset holidays

                getReservations(0);
            }

            /**
             * Gets the reservations from the server identified by a given index, when done it will call addReservations
             * @param {type} index
             * @returns {undefined}
             */
            function getReservations(index) {
                var year = new Date().getFullYear().toString(),
                        server = $rootScope.currentServers[index];
                $rootScope.searchUnits = [];
                console.log(server.uuid + " " + server.hosp_url);

                hospiviewFactory.getUnitAndDepList(server.uuid, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.setAbsentDays(year, server);
                }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    addReservations(reservations);
                });
            }

            var responseCount = 0;
            var allReservations = [];
            var firstCycle = true;
            /**
             * The reservations from every server get added into one array, 
             * when this function is executed for every server, the data will be handled by the setReservations function
             * @type Number
             */
            function addReservations(reservations) {
                if (firstCycle) {
                    responseCount = 0;
                    allReservations = [];
                }
                firstCycle = false;
                if (reservations !== undefined)
                    for (var r = 0; r < reservations.length; r++) {
                        reservations[r].hosp_short_name = $rootScope.currentServers[responseCount].hosp_short_name;
                        allReservations.push(reservations[r]);
                    }
                if (responseCount + 1 === $rootScope.currentServers.length) {
                    setReservations(allReservations);
                } else {
                    responseCount++;
                    getReservations(responseCount);
                }
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
             * Sets the dates between which reservations will be searched
             * 
             */
            function setDates() {
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.currentdate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
            }

            function setReservations(reservations) {
                firstCycle = true;
                $rootScope[$rootScope.searchString] = reservations;
                if ($scope.failedServers.length !== 0) {
                    var servers = "";
                    for (var i = 0; i < $scope.failedServers.length; i++) {
                        servers += "\n" + $scope.failedServers[i];
                    }
                    alert($rootScope.getLocalizedString('loginServerListFailed') + servers);
                }

                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    $rootScope.isOffline = false;
                    $rootScope.pageClass = "right-to-left";
                    $location.path('/doctor/appointmentsView');
                }
            }

            /**
             * Calls a dialog box and asks if the user wants to continue searching.
             * If yes, appointments will be searched for the next 14 days.
             * 
             * @returns {undefined}
             */
            function callModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: $rootScope.ModalInstance
                });
                modalInstance.result.then(function(answer) {
                    if (answer) {
                        var newStartDate = new Date($rootScope.startDate);
                        newStartDate.setDate(newStartDate.getDate() + 14);
                        var newEndDate = new Date($rootScope.endDate);
                        newEndDate.setDate(newEndDate.getDate() + 14);
                        $rootScope.startDate = formatDate(newStartDate);
                        $rootScope.endDate = formatDate(newEndDate);
                        dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                        switch ($rootScope.type) {
                            case 0:
                            case 1:
                                postLoginDoctor();
                                break;
                            case 2:
                                postLoginPatient();
                                break;
                        }

                    } else {
                        $scope.loggingIn = false;
                    }
                }, function() {
                    $scope.loggingIn = false;
                });
            }

            /**
             * Controller for the modal. Is declared in the rootScope, so can be used
             * by other controllers. If a button of the modal is clicked the 
             * modal will be closed and a parameter with the answer will be passed.
             * 
             * @param           $scope          scope of the modal
             * @param           $modalInstance  to access modalInstance functions
             * @returns boolean $scope.proceed  boolean indicating which button was pressed
             */
            $rootScope.ModalInstance = function($scope, $modalInstance) {
                //Don't use $scope.continue, 'continue' is a reserved keyword
                $scope.ok = function() {
                    $scope.proceed = true;
                    $modalInstance.close($scope.proceed);
                };
                $scope.cancel = function() {
                    $scope.proceed = false;
                    $modalInstance.close($scope.proceed);
                };
            }

            /**
             * Dialog box to ask the user if he wants to continue offline. 
             * If yes, appointments saved in localstorage will be used.
             * 
             * @returns {undefined}
             */
            function callOfflineModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'offlineModal',
                    controller: $rootScope.ModalInstance
                });
                modalInstance.result.then(function(answer) {
                    if (answer) {
                        var servers = JSON.parse(localStorage.getItem($scope.user)).servers,
                                hasAuthenticated = false,
                                absentDays = JSON.parse(localStorage.getItem($scope.user + "AbsentDays")),
                                reservations = JSON.parse(localStorage.getItem($scope.user + "Reservations")),
                                resLength = reservations.length,
                                absLength = absentDays.length;
                        for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                            console.log(servers[i].user_password === $scope.selectedUser.servers[i].user_password);
                            if (servers[i].user_login === $scope.selectedUser.servers[i].user_login && servers[i].user_password === $scope.selectedUser.servers[i].user_password) {
                                hasAuthenticated = true;
                            } else {
                                while (resLength--) {
                                    if (reservations[resLength].hosp_short_name === servers[i].hosp_short_name) {
                                        console.log('splice res' + servers[i].hosp_short_name);
                                        reservations.splice(resLength, 1);
                                    }
                                }
                                while (absLength--) {
                                    if (absentDays[absLength].hosp_short_name === servers[i].hosp_short_name) {
                                        console.log('splice abs' + servers[i].hosp_short_name);
                                        absentDays.splice(absLength, 1);
                                    }
                                }
                            }
                        }
                        if (hasAuthenticated) {
                            $rootScope.user = $scope.user;
                            $rootScope.searchString = $rootScope.user + 'Reservations';
                            $rootScope[$rootScope.searchString] = reservations;
                            $rootScope.searchRangeStart = localStorage.getItem($scope.user + "SearchRangeStart");
                            $rootScope.searchRangeEnd = localStorage.getItem($scope.user + "SearchRangeEnd");
                            $rootScope.absentDays = absentDays;
                            $rootScope.publicHolidays = JSON.parse(localStorage.getItem($scope.user + "PublicHolidays"));
                            $rootScope.currentdate = new Date();
                            $rootScope.isOffline = true;
                            $rootScope.type = servers[0].isexternal;
                            $rootScope.pageClass = "right-to-left";
                            if ($rootScope.type == 0 || $rootScope.type == 1)
                                $location.path('/doctor/appointmentsView');
                            else if ($rootScope.type == 2)
                                $location.path('/patient/appointmentsView');
                        }
                        else {
                            $scope.loggingIn = false;
                            $scope.error = true;
                            $scope.errormessage = $rootScope.getLocalizedString('loginError');
                        }
                    }
                }, function() {
                    console.log("error");
                });
            }

        }).
        controller('DoctorViewAppointmentsCtrl', function($scope, $route, $rootScope, $location, $interval, $modal, hospiviewFactory, dataFactory) {
            /**
             * Initiating variables. 
             * searchInProgress is used to disable the refresh if another
             * request is busy. 
             * loadingCalendar is used to show the loading animation to indicate
             * the application is doing somthing.
             */
            $rootScope.searchInProgress = false;
            $scope.loadingCalendar = false;

            /**
             * 
             */
            if ($rootScope.eventClick) {
                $scope.date = formatDate(new Date($rootScope.currentdate));
                $scope.showDate = formatShowDate(new Date($scope.date), $rootScope.languageID);
                $rootScope.eventClick = false;
            } else {
                var lowestDate = new Date(2500, 1, 1);
                var today = new Date();
                today.setHours(0, 0, 0);
                for (var i = 0; i < $rootScope[$rootScope.searchString].length; i++) {
                    var compareDate = new Date($rootScope[$rootScope.searchString][i].the_date);
                    if (compareDate < lowestDate && compareDate >= today) {
                        lowestDate = compareDate;
                    }
                }
                $scope.date = formatDate(new Date(lowestDate));
                $scope.lastKnownDate = new Date($scope.date);
                $scope.showDate = formatShowDate(lowestDate, $rootScope.languageID);
            }
            var user = JSON.parse(localStorage.getItem($rootScope.user));

            $scope.cellcontentPatient = user.cellcontent.patient;
            $scope.cellcontentTitle = user.cellcontent.title;
            $scope.cellcontentDepartment = user.cellcontent.department;

            if ($rootScope.currentServers.length === 1)
                $scope.oneServer = true;


            $rootScope.$on('setReservationsEvent', function(event, args) {
                if ($scope.reservations.length === 0) {
                    $scope.reservations = [];
                    $scope.reservations = $rootScope[$rootScope.searchString];
                }
            });


            /**
             * Gets the name of the icon that matches the current status of the given reservation
             * 
             * @param {type} reservation
             * @returns {String}
             */
            $scope.getStatusIcon = function(reservation) {
                var stepAmount = reservation.step_buttons;

                if (stepAmount == 4) {
                    if (reservation.time_gone !== "00:00:00")
                        return "out.png";
                }

                if (reservation.time_out !== "00:00:00")
                    if (stepAmount == 3)
                        return "out.png";
                    else if (stepAmount == 4)
                        return "finished.png";

                if (reservation.time_start !== "00:00:00")
                    if (stepAmount == 3) {
                        return "finished.png";
                    }
                    else if (stepAmount == 4)
                        return "arrived.png";

                if (reservation.time_in !== "00:00:00")
                    if (stepAmount == 3)
                        return "arrived.png";
                    else if (stepAmount == 4)
                        return "asked.png";

                return "none";
            };

            $scope.details = function(reservation) {
                $rootScope.eventClick = true;
                $rootScope.reservationDetail = reservation;
                $rootScope.currentdate = reservation.the_date;
                $rootScope.pageClass = "right-to-left";
                $location.path('/doctor/appointmentDetail');
            };

            $scope.settings = function() {
                $rootScope.eventClick = true;
                $rootScope.currentdate = new Date($scope.date);
                console.log($rootScope.currentdate);
                $rootScope.pageClass = "right-to-left";
                $location.path('/settings/default');
            };

            $scope.filter = function() {
                $rootScope.eventClick = true;
                $rootScope.currentdate = $scope.date;
                $rootScope.pageClass = "right-to-left";
                $location.path('/appointmentsFilter');
            };

            $scope.reservations = $rootScope[$rootScope.searchString];

            $scope.loadingNext = false;
            
            var daySearchLoopCount = 0;
            $scope.nextDay = function() {
                console.log($rootScope.searchRangeStart);
                console.log($rootScope.searchRangeEnd);
                var count = 0;
                daySearchLoopCount++;
                $rootScope.searchType = '';
                $scope.loadingNext = true;
                var newDate = new Date($scope.date);
                if (!$rootScope.nextDayRequest)
                    newDate.setDate(newDate.getDate() + 1);
                $scope.date = formatDate(newDate);
                $rootScope.nextDayRequest = false;
                if (new Date($scope.date) > new Date($rootScope.searchRangeEnd) && !$rootScope.isOffline) {
                    $rootScope.searchInProgress = true;
                    $rootScope.startDate = formatDate(new Date(newDate));
                    $rootScope.endDate = formatDate(new Date(newDate.setDate(newDate.getDate() + 14)));
                    $rootScope.nextDayRequest = true;
                    $rootScope.searchType = 'next';
                    search();
                } else {
                    for (var i = 0; i < $scope.reservations.length; i++) {
                        var filterDate = new Date($scope.reservations[i].the_date);
                        var check = new Date($scope.date);
                        filterDate.setHours(0, 0, 0, 0);
                        check.setHours(0, 0, 0, 0);
                        if (filterDate.getTime() === check.getTime())
                            count++;
                    }
                    
                    if(daySearchLoopCount==182){
                        alert('too many loops');
                        daySearchLoopCount=0;
                    }else{
                       if (count === 0) {
                            $scope.nextDay();
                        }
                        else {
                            $scope.lastKnownDate = new Date($scope.date);
                            $scope.loadingNext = false;
                        } 
                    }
                    
                }
                $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
            };
            $scope.previousDay = function() {
                console.log($rootScope.searchRangeStart);
                console.log($rootScope.searchRangeEnd);
                var count = 0;
                daySearchLoopCount++;
                $rootScope.searchType = '';
                $scope.loadingNext = true;
                var newDate = new Date($scope.date);
                if (!$rootScope.nextDayRequest)
                    newDate.setDate(newDate.getDate() - 1);
                $scope.date = formatDate(newDate);
                $rootScope.nextDayRequest = false;
                if (new Date($scope.date) < new Date($rootScope.searchRangeStart) && !$rootScope.isOffline) {
                    $rootScope.searchInProgress = true;
                    $rootScope.endDate = formatDate(new Date(newDate));
                    $rootScope.startDate = formatDate(new Date(newDate.setDate(newDate.getDate() - 14)));
                    $rootScope.nextDayRequest = true;
                    $rootScope.searchType = 'prev';
                    search();
                }
                else {
                    for (var i = 0; i < $scope.reservations.length; i++) {

                        var filterDate = new Date($scope.reservations[i].the_date);
                        var check = new Date($scope.date);
                        filterDate.setHours(0, 0, 0, 0);
                        check.setHours(0, 0, 0, 0);
                        if (filterDate.getTime() === check.getTime())
                            count++;
                    }
                    if(daySearchLoopCount==365){
                        daySearchLoopCount=0;
                    }else{
                        if (count === 0)
                            $scope.previousDay();
                        else {
                            $scope.lastKnownDate = new Date($scope.date);
                            $scope.loadingNext = false;
                        } 
                    }
                    
                }
                $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
            };


            $scope.calendarView = function() {
                $rootScope.searchInProgress = true;
                $rootScope.currentdate = $scope.date;
                if ($rootScope.isOffline) {
                    $rootScope.pageClass = "right-to-left";
                    $location.path('/appointmentsCalendar');
                } else {
                    $scope.loadingCalendar = true;
                    var searchStart = new Date($rootScope.searchRangeStart);
                    var searchEnd = new Date($rootScope.searchRangeEnd);

                    var current = new Date($rootScope.currentdate);
                    var request1 = false;
                    var request2 = false;
                    if (searchEnd.getMonth() <= current.getMonth() && searchEnd.getFullYear() == current.getFullYear()) {
                        searchEnd.setDate(searchEnd.getDate() + 1);
                        $rootScope.startDate = formatDate(new Date(searchEnd));
                        searchEnd.setMonth(current.getMonth() + 1);
                        searchEnd.setDate(1);
                        $rootScope.endDate = formatDate(new Date(searchEnd));
                        request1 = true;
                    } else {
                        if (searchEnd.getFullYear() < current.getFullYear()) {
                            searchEnd.setDate(searchEnd.getDate() + 1);
                            $rootScope.startDate = formatDate(new Date(searchEnd));
                            searchEnd.setMonth(current.getMonth() + 1);
                            searchEnd.setYear(current.getYear());
                            searchEnd.setDate(1);
                            $rootScope.endDate = formatDate(new Date(searchEnd));
                            request1 = true;
                        }
                    }
                    if (searchStart.getMonth() >= current.getMonth() && searchStart.getDate() > 1 && searchStart.getFullYear() == current.getFullYear()) {
                        searchStart.setDate(searchStart.getDate() - 1);
                        $rootScope.endDate = formatDate(new Date(searchStart));
                        searchStart.setMonth(current.getMonth());
                        searchStart.setDate(1);
                        $rootScope.startDate = formatDate(new Date(searchStart));
                        request2 = true;
                    } else {
                        if (searchStart.getFullYear() > current.getFullYear()) {
                            $rootScope.endDate = formatDate(new Date(searchStart));
                            searchStart.setMonth(current.getMonth());
                            searchStart.setFullYear(current.getFullYear());
                            searchStart.setDate(1);
                            $rootScope.startDate = formatDate(new Date(searchStart));
                            request2 = true;
                        }
                    }
                    if (request1 === true && request2 === true) {
                        $rootScope[$rootScope.searchString] = [];
                        $rootScope.startDate = searchStart;
                        $rootScope.endDate = searchEnd;
                    }
                    if (request1 === true || request2 === true) {
                        search();
                    } else {
                        $rootScope.searchInProgress = false;
                        $rootScope.pageClass = "right-to-left";
                        $location.path('/appointmentsCalendar');
                    }
                }
            };
            $scope.style = function(value) {
                var color = '#' + value;
                return {"background-color": color};
            };
            $scope.styleTest = function(reservation) {
                var colors = [];
                var color;
                var color2;
                if (reservation.color !== "")
                    colors.push(reservation.color);
                if (reservation.color2 !== "")
                    colors.push(reservation.color2);
                if (reservation.color3 !== "")
                    colors.push(reservation.color3);
                if (reservation.color4 !== "")
                    colors.push(reservation.color4);
                if (reservation.color5 !== "")
                    colors.push(reservation.color5);

                if (colors.length === 1) {
                    color = '#' + colors[0];
                    return {"background-color": color};
                }
                if (colors.length === 2) {
                    color = 'linear-gradient(to right, #' + colors[0] + ' 0%, #' + colors[0] + ' 50%, #' + colors[1] + ' 50%, #' + colors[1] + ' 100%)';
                    color2 = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 50%, #' + colors[1] + ' 50%, #' + colors[1] + ' 100%)';
                    return {"background": color2};
                }
                if (colors.length === 3) {
                    color = 'linear-gradient(to right, #' + colors[0] + ' 0%, #' + colors[0] + ' 33%, #' + colors[1] + ' 33%, #' + colors[1] + ' 66%, #' + colors[2] + ' 66%, #' + colors[2] + ' 100%)';
                    color2 = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 33%, #' + colors[1] + ' 33%, #' + colors[1] + ' 66%, #' + colors[2] + ' 66%, #' + colors[2] + ' 100%)';
                    return {"background": color2};
                }
                if (colors.length === 4) {
                    color = 'linear-gradient(to right, #' + colors[0] + ' 0%, #' + colors[0] + ' 25%, #' + colors[1] + ' 25%, #' + colors[1] + ' 50%, #' + colors[2] + ' 50%, #' + colors[2] + ' 75%, #' + colors[3] + ' 75%, #' + colors[3] + ' 100%)';
                    color2 = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 25%, #' + colors[1] + ' 25%, #' + colors[1] + ' 50%, #' + colors[2] + ' 50%, #' + colors[2] + ' 75%, #' + colors[3] + ' 75%, #' + colors[3] + ' 100%)';
                    return {"background": color2};
                }
                if (colors.length === 5) {
                    color = 'linear-gradient(to right, #' + colors[0] + ' 0%, #' + colors[0] + ' 20%, #' + colors[1] + ' 20%, #' + colors[1] + ' 40%, #' + colors[2] + ' 40%, #' + colors[2] + ' 60%, #' + colors[3] + ' 60%, #' + colors[3] + ' 80%, #' + colors[4] + ' 80%, #' + colors[4] + ' 100%)';
                    color2 = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 20%, #' + colors[1] + ' 20%, #' + colors[1] + ' 40%, #' + colors[2] + ' 40%, #' + colors[2] + ' 60%, #' + colors[3] + ' 60%, #' + colors[3] + ' 80%, #' + colors[4] + ' 80%, #' + colors[4] + ' 100%)';
                    return {"background": color2};
                }
            };
            $scope.logout = function() {
                $rootScope.user = null;
                $rootScope.type = null;
                $rootScope.pageClass = "left-to-right";
                $location.path('/login');
            };

            function search() {
                console.log("searching through " + $rootScope.currentServers.length + " servers");
                $rootScope.searchString = $rootScope.user + 'Reservations';
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                getReservations(0);
            }

            /**
             * Gets the reservations from the server identified by a given index, when done it will call addReservations
             * @param {type} index
             * @returns {undefined}
             */
            function getReservations(index) {
                console.log("start " + index);
                var server = $rootScope.currentServers[index];
                $rootScope.searchUnits = [];
                hospiviewFactory.getUnitAndDepList(server.uuid, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    console.log("end " + index);
                    addReservations(reservations);
                });
            }

            var responseCount = 0;
            var allReservations = [];
            var firstCycle = true;
            /**
             * The reservations from every server get added into one array, 
             * when this function is executed for every server, the data will be handled by the setReservations function
             * @type Number
             */
            function addReservations(reservations) {
                if (firstCycle) {
                    responseCount = 0;
                    allReservations = [];
                }
                firstCycle = false;
                console.log(responseCount + " " + reservations);
                if (reservations !== undefined) {
                    for (var r = 0; r < reservations.length; r++) {
                        console.log(responseCount);
                        reservations[r].hosp_short_name = $rootScope.currentServers[responseCount].hosp_short_name;
                        allReservations.push(reservations[r]);
                    }
                }
                if (responseCount + 1 === $rootScope.currentServers.length) {
                    setReservations(allReservations);
                } else {
                    responseCount++;
                    getReservations(responseCount);
                }
            }

            function error(data) {
                $scope.loggingIn = false;
                $scope.error = true;
                $scope.errormessage = data;
            }

            function setReservations(reservations) {
                console.log("setting reservations");
                firstCycle = true;
                if ($rootScope.refresh === true) {
                    $rootScope[$rootScope.searchString] = [];
                }
                for (var i = 0; i < reservations.length; i++)
                    $rootScope[$rootScope.searchString].push(reservations[i]);
                $scope.reservations = $rootScope[$rootScope.searchString];
                if (reservations.length === 0 && !$scope.loadingCalendar) {
                    console.log("modal");
                    callModal();
                } else {
                    if ($scope.loadingCalendar) {
                        $rootScope.pageClass = "right-to-left";
                        $location.path('/appointmentsCalendar');
                        $rootScope.searchInProgress = false;
                        $scope.loadingCalendar = false;
                    }
                    else {
                        if ($rootScope.refresh) {
                            $scope.loadingNext = false;
                        }
                        $rootScope.refresh = false;
                        $rootScope.searchInProgress = false;
                        if ($rootScope.searchType === 'next') {
                            $scope.nextDay();
                        }
                        if ($rootScope.searchType === 'prev') {
                            $scope.previousDay();
                        }
                    }
                }
            }

            /**
             * First calls the instance of the modal. The modal template is 
             * declared in login.html. The controller 
             * @returns {undefined}
             */
            function callModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: $rootScope.ModalInstance
                });
                modalInstance.result.then(function(answer) {
                    if (answer === true) {
                        if ($rootScope.searchType === 'next') {
                            var endSearch = new Date($rootScope.endDate);
                            endSearch.setDate(endSearch.getDate() + 1);
                            $rootScope.startDate = formatDate(new Date(endSearch));
                            endSearch.setDate(endSearch.getDate() + 14);
                            $rootScope.endDate = formatDate(new Date(endSearch));
                        }
                        if ($rootScope.searchType === 'prev') {
                            var startSearch = formatDate(new Date($rootScope.startDate));
                            $rootScope.endDate = formatDate(new Date(startSearch));
                            startSearch.setDate(startSearch.getDate() - 14);
                            $rootScope.startDate = formatDate(new Date(startSearch));
                        }
                        search();
                    } else {
                        $scope.date = formatDate(new Date($scope.lastKnownDate));
                        $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                        $scope.loadingNext = false;
                        $rootScope.nextDayRequest = false;
                    }
                }, function() {
                    $scope.date = formatDate(new Date($scope.lastKnownDate));
                    $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                    $scope.loadingNext = false;
                    $rootScope.nextDayRequest = false;
                });
            }
        }).
        controller('FilterCtrl', function($scope, $rootScope, $location, hospiviewFactory) {

            /** 
             * 25.03.2014 Stijn Ceunen
             * Redirects back to the appointments screen.
             */
            $scope.back = function() {
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };

            /**
             * 25.03.2014 Stijn Ceunen
             * Gets the servers the user saved and puts them in the scope.
             */
            var user = JSON.parse(localStorage.getItem($rootScope.user));
            $scope.servers = user.servers;

            /**
             * 26.03.2014 Stijn Ceunen
             * This will do a request to get all the units, groups and departments
             * of all the saved servers of the user. It will only be executed if 
             * the user has added a server, changed a saved server or the page 
             * is not visited yet since the user started the application.
             * First, the variables that record the add or edit of a server are
             * set back to false. After, a loop of all the servers the user has
             * saved will start. For each server the getUnitAndDepList and
             * getUnitDepGroups requests will be executed. The results will be
             * pushed into the unitsandgroups array which will be pushed in the 
             * rootScope at the end of the second request. In the getUnitAndDepList
             * request, there is a loop that will add the "type" property to the 
             * objects and it will be set to "doctor". The same will be done in
             * the getUnitDepGroups but is will be set to "group" in that loop.
             * This is used to group them in the select box. 
             */
            var startIndex = 0;
            if ($rootScope.serverAdded === true || $rootScope.serverChanged === true || !$rootScope['allUnitsAndGroups' + user.servers[0]] || !$rootScope['allUnitsAndGroups' + user.servers[1]] || !$rootScope['allUnitsAndGroups' + user.servers[2]]) {
                $rootScope.serverChanger = false;
                $rootScope.serverAdded = false;
                var unitsandgroups = [];
                startSearchUnitsAndGroups(startIndex);
            }

            function startSearchUnitsAndGroups(index) {
                if (!(index === $rootScope.currentServers.length)) {
                    console.log(index);
                    getUnitsAndGroups(index);
                } else {
                    startIndex = 0;
                }
            }


            function getUnitsAndGroups(index) {
                var selectedServer = user.servers[index];
                console.log(selectedServer);
                hospiviewFactory.getUnitAndDepList(selectedServer.uuid, selectedServer.hosp_url).
                        success(function(data) {
                            console.log($scope.selectedFilterServer);
                            /*variable created to refresh the scope of the user variable*/
                            var json = parseJson(data);
                            if (json !== null) {
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
                            }
                        }).
                        error(function() {
                            alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                        });
                hospiviewFactory.getUnitDepGroups(selectedServer.uuid, selectedServer.hosp_url).
                        success(function(data) {
                            var json = parseJson(data);
                            if (json !== null) {
                                if (json.UnitDepGroups.Header.StatusCode == 1) {
                                    var groups = json.UnitDepGroups.Detail.Group;
                                    for (var i = 0; i < groups.length; i++) {
                                        groups[i].type = "group";
                                        groups[i].Header.name = groups[i].Header.group_name;
                                        unitsandgroups.push(groups[i]);
                                    }
                                    var rootScopeString = 'allUnitsAndGroups' + selectedServer.id;
                                    $rootScope[rootScopeString] = unitsandgroups;
                                    console.log($rootScope[rootScopeString]);
                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                                }
                            }
                        }).
                        error(function() {
                            alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                        });
                index++;
                startSearchUnitsAndGroups(index);
            }

            /**
             * 25.03.2014 Stijn Ceunen
             * This function is used when the state of the server select box is
             * changed, if an item is selected. 
             * If the selected item is null, the other selects will be hidden 
             * since no server is specified. If a server is selected the select 
             * box to select a unit will be revealed and the units model will be 
             * set.
             * @returns {undefined}
             */
            $scope.loadUnit = function() {
                $scope.disableDepartments = true;
                $scope.unitFilter = '';
                $scope.depFilter = '';
                if ($scope.serverFilter === null) {
                    $scope.disableUnits = true;
                }
                else {
                    $scope.disableUnits = false;
                    $scope.units = $rootScope['allUnitsAndGroups' + $scope.serverFilter.id];
                    console.log($scope.serverFilter.id);
                    console.log($scope.units);
                }
            };

            /**
             * 25.03.2014 Stijn Ceunen
             * This function is used when the state of the unit select box is 
             * changed, if an item is selected.
             * If the selected item is null of is a group of doctors, not a single
             * one, the departments select box will be hidden. Else the select
             * box will be shown, if the department name is null, this means
             * the users wants so see the reservation of all the departments,
             * so we are changing the null from empty to "all". Departments model
             * will be filled.
             */
            $scope.loadDep = function() {
                $scope.depFilter = '';
                if ($scope.unitFilter === null || $scope.unitFilter.type === "group") {
                    $scope.disableDepartments = true;
                }
                else {
                    $scope.disableDepartments = false;
                    for (var i = 0; i < $scope.unitFilter.Detail.Dep.length; i++) {
                        if ($scope.unitFilter.Detail.Dep[i].dep_name === "") {
                            $scope.unitFilter.Detail.Dep.splice(i, 1);
                            break;
                        }
                    }
                    $scope.departments = $scope.unitFilter.Detail.Dep;
                }
            };

            /**
             * 26.03.2014 Stijn Ceunen
             * This block will initialise the scope of this page. It will check
             * each filter (server, unit and department) if a value has been set
             * before. The proper select boxes will be shown with the saved values.
             */
            if (angular.isUndefined($rootScope.serverFilter) || $rootScope.serverFilter === '' || $rootScope.serverFilter === null) {
                $rootScope.serverFilter = '';
                $scope.disableUnits = true;
                $scope.disableDepartments = true;
            } else {
                for (var i = 0; i < $scope.servers.length; i++)
                    if ($scope.servers[i].id === $rootScope.serverFilter.id)
                        $scope.serverFilter = $scope.servers[i];
                $scope.loadUnit();
                if (angular.isUndefined($rootScope.unitFilter) || $rootScope.unitFilter === '' || $rootScope.unitFilter === null) {
                    $rootScope.unitFilter = '';
                    $rootScope.depFilter = '';
                    $scope.disableDepartments = true;
                } else {
                    for (var i = 0; i < $scope.units.length; i++)
                        if ($scope.units[i].Header.name === $rootScope.unitFilter.Header.name)
                            $scope.unitFilter = $scope.units[i];
                    $scope.loadDep();
                    if (angular.isUndefined($rootScope.depFilter) || $rootScope.depFilter === '' || $rootScope.depFilter == null) {
                        $rootScope.depFilter = '';
                    } else {
                        for (var i = 0; i < $scope.departments.length; i++)
                            if ($scope.departments[i].dep_name === $rootScope.depFilter.dep_name)
                                $scope.depFilter = $scope.departments[i];
                    }
                }
            }



            /**
             * 26.03.2014 Stijn Ceunen
             * Sets the filter in the rootscope so it can be used throughout 
             * the application. Redirects to appointments screen.
             */
            $scope.applyFilter = function() {
                if (!$scope.unitFilter)
                    $rootScope.unitFilter = '';

                if (!$scope.depFilter)
                    $rootScope.depFilter = '';

                $rootScope.serverFilter = $scope.serverFilter;
                $rootScope.unitFilter = $scope.unitFilter;
                $rootScope.depFilter = $scope.depFilter;

                $rootScope.filterActive = true;

                if (!$scope.serverFilter) {
                    $scope.removeFilter();
                }
                console.log($rootScope.serverFilter.hosp_short_name);

                $rootScope.pageClass = "right-to-left";
                $location.path('/doctor/appointmentsView');
            };

            /**
             * 26.03.2014 Stijn Ceunen
             * Sets current filters empty, so all data will be shown.
             * Redirects to appointments screen.
             */
            $scope.removeFilter = function() {
                $rootScope.serverFilter = '';
                $rootScope.unitFilter = '';
                $rootScope.depFilter = '';

                $rootScope.filterActive = false;
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };
        }).
        controller('searchCtrl', function($scope, $rootScope, hospiviewFactory, dataFactory) {
            $scope.next = function() {
                var calDate = $("#doctorCalendar").fullCalendar('getDate');
                var months = getMonthNames($rootScope.languageID);
                if (calDate.getMonth() + 1 < 12)
                    $rootScope.displayMonthDate = months[calDate.getMonth() + 1] + " " + calDate.getFullYear();
                else
                    $rootScope.displayMonthDate = months[0] + " " + (calDate.getFullYear() + 1);


                if ($rootScope.isOffline) {
                    $('#doctorCalendar').fullCalendar('next');
                } else {
                    calendarView('next');
                }
            };
            $scope.prev = function() {
                var calDate = $("#doctorCalendar").fullCalendar('getDate');
                var months = getMonthNames($rootScope.languageID);
                //$rootScope.displayMonthDate = months[calDate.getMonth() - 1] + " " + calDate.getFullYear();
                console.log(calDate.getMonth());
                if (calDate.getMonth() - 1 > -1)
                    $rootScope.displayMonthDate = months[calDate.getMonth() - 1] + " " + calDate.getFullYear();
                else
                    $rootScope.displayMonthDate = months[11] + " " + (calDate.getFullYear() - 1);

                if ($rootScope.isOffline === true) {
                    $('#doctorCalendar').fullCalendar('prev');
                } else {
                    calendarView('prev');
                }
            };
            $scope.loadingMonth = false;

            function calendarView(calendarBrows) {
                console.log(calendarBrows);
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
                            searchEnd.setDate(searchEnd.getDate() + 1);
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
                        if ((searchStart.getMonth() > current.getMonth() + nextMonthCount || (searchStart.getMonth() >= current.getMonth() + nextMonthCount && searchStart.getDate() > 1)) && searchStart.getFullYear() == current.getFullYear()) {
                            $rootScope.endDate = formatDate(new Date(searchStart.setDate(searchStart.getDate() - 1)));
                            searchStart.setMonth(current.getMonth() + nextMonthCount);
                            searchStart.setDate(1);
                            $rootScope.startDate = formatDate(new Date(searchStart));
                            request2 = true;
                        }
                    }
                }
                if (request1 === true || request2 === true) {
                    search(calendarBrows);
                } else {
                    $('#doctorCalendar').fullCalendar(calendarBrows);
                }
            }

            function search(calendarBrows) {
                $scope.calendarBrows = calendarBrows;
                $scope.loadingMonth = true;
                console.log("searching through " + $rootScope.currentServers.length + " servers");
                $rootScope.searchString = $rootScope.user + 'Reservations';
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);

                getReservations(0);
            }

            /**
             * Gets the reservations from the server identified by a given index, when done it will call addReservations
             * @param {type} index
             * @returns {undefined}
             */
            function getReservations(index) {
                console.log("start " + index);
                var server = $rootScope.currentServers[index];
                $rootScope.searchUnits = [];
                hospiviewFactory.getUnitAndDepList(server.uuid, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    console.log("end " + index);
                    addReservations(reservations);
                });
            }


            var responseCount = 0;
            var allReservations = [];
            var firstCycle = true;

            /**
             * The reservations from every server get added into one array, 
             * when this function is executed for every server, the data will be handled by the setReservations function
             * @param {type} reservations
             */
            function addReservations(reservations) {
                if (firstCycle) {
                    responseCount = 0;
                    allReservations = [];
                }
                firstCycle = false;
                console.log(allReservations);
                console.log(responseCount + " " + reservations);
                if (reservations !== undefined)
                    for (var r = 0; r < reservations.length; r++) {
                        reservations[r].hosp_short_name = $rootScope.currentServers[responseCount].hosp_short_name;
                        allReservations.push(reservations[r]);
                    }
                if (responseCount + 1 === $rootScope.currentServers.length) {
                    setReservations(allReservations);
                } else {
                    responseCount++;
                    getReservations(responseCount);
                }
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

            function setReservations(reservations, calendarBrows) {
                firstCycle = true;
                calendarBrows = $scope.calendarBrows;
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
                    controller: $rootScope.ModalInstance
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
        }).
        controller('DoctorViewappointmentDetailCtrl', function($scope, $location, $rootScope) {
            $scope.reservation = $rootScope.reservationDetail;
            $scope.back = function() {
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };
        }).
        controller('DoctorViewAppointmentsCalendarCtrl', function($scope, $location, $rootScope, dataFactory) {

            var current = new Date($rootScope.currentdate);
            var showWeekends = false;
            $scope.back = function() {
                $rootScope.eventClick = true;
                $rootScope.pageClass = "left-to-right";
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
                    header: false,
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

            var months = getMonthNames($rootScope.languageID);
            $rootScope.displayMonthDate = months[current.getMonth()] + " " + current.getFullYear();

            var countEvent = dataFactory.loadCalendar();
            $scope.eventSources = [countEvent];

            $scope.today = function() {
                $('#doctorCalendar').fullCalendar('today');
            };

            $scope.weekend = function() {
                var month = $("#doctorCalendar").fullCalendar('getDate');
                $scope.uiConfig.calendar.month = month.getMonth();
                $scope.uiConfig.calendar.weekends = !$scope.uiConfig.calendar.weekends;
            };

            $rootScope.$on('setReservationsEvent', function(event, args) {
                if ($rootScope[$rootScope.searchString].length !== 0) {
                    countEvent = dataFactory.loadCalendar();
                    $scope.eventSources = [countEvent];
                }
            });
        }).
        controller('PatientViewAppointmentsCtrl', function($scope, $location, $rootScope) {
            $scope.backToMainMenu = function() {
                $rootScope.pageClass = "left-to-right";
                $location.path('/mainmenu');
            };
        }).
        controller('SettingsCtrl', function($scope, $location, $rootScope, $routeParams, $timeout) {
            loadSettings();

            function loadSettings() {
                $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                $scope.servers = $scope.selectedUser.servers;

                if ($scope.servers.length == 3) {
                    $scope.abbreviation3 = $scope.selectedUser.servers[2].hosp_short_name;
                    $scope.server3Img = "img/hospi-gray.png";
                    $scope.showServer3 = true;
                } else {
                    $scope.abbreviation3 = $rootScope.getLocalizedString('settingsAddServer');
                    $scope.showServer3 = false;
                    if ($scope.servers.length >= 2) {
                        $scope.abbreviation2 = $scope.selectedUser.servers[1].hosp_short_name;
                        $scope.server2Img = "img/hospi-gray.png";
                        $scope.showServer2 = true;
                    } else {
                        $scope.abbreviation2 = $rootScope.getLocalizedString('settingsAddServer');
                        $scope.showServer2 = false;
                    }
                }


                $scope.abbreviation1 = $scope.selectedUser.servers[0].hosp_short_name;
                $scope.server1Img = "img/hospi.png";
                $scope.serverRadio = $scope.servers[0];
                $scope.serverLogin = $scope.servers[0].user_login;
                $scope.serverPassword = $scope.servers[0].user_password;

                $scope.server1Select = function() {
                    $scope.server1Img = "img/hospi.png";
                    $scope.server2Img = "img/hospi-gray.png";
                    $scope.server3Img = "img/hospi-gray.png";
                    $scope.serverRadio = $scope.servers[0];
                    $scope.serverLogin = $scope.serverRadio.user_login;
                    $scope.serverPassword = $scope.serverRadio.user_password;
                };
                $scope.server2Select = function() {
                    if ($scope.showServer2 === false) {
                        $scope.addOrEditServer('add');
                    } else {
                        $scope.server1Img = "img/hospi-gray.png";
                        $scope.server2Img = "img/hospi.png";
                        $scope.server3Img = "img/hospi-gray.png";
                        $scope.serverRadio = $scope.servers[1];
                        $scope.serverLogin = $scope.serverRadio.user_login;
                        $scope.serverPassword = $scope.serverRadio.user_password;
                    }
                };
                $scope.server3Select = function() {
                    if ($scope.showServer3 === false) {
                        $scope.addOrEditServer('add');
                    } else {
                        $scope.server1Img = "img/hospi-gray.png";
                        $scope.server2Img = "img/hospi-gray.png";
                        $scope.server3Img = "img/hospi.png";
                        $scope.serverRadio = $scope.servers[2];
                        $scope.serverLogin = $scope.serverRadio.user_login;
                        $scope.serverPassword = $scope.serverRadio.user_password;
                    }
                };

                /*if ($scope.selectedUser.cellcontent.patient === true)
                 $('#patientCheckbox').prop('checked', true);
                 if ($scope.selectedUser.cellcontent.title === true)
                 $('#titleCheckbox').prop('checked', true);
                 if ($scope.selectedUser.cellcontent.department === true)
                 $('#departmentCheckbox').prop('checked', true);*/

                if ($scope.selectedUser.cellcontent.patient === true)
                    $scope.checkboxImgPatient = 1;
                else
                    $scope.checkboxImgPatient = 0;
                if ($scope.selectedUser.cellcontent.title === true)
                    $scope.checkboxImgTitle = 1;
                else
                    $scope.checkboxImgTitle = 0;
                if ($scope.selectedUser.cellcontent.department === true)
                    $scope.checkboxImgDepartment = 1;
                else
                    $scope.checkboxImgDepartment = 0;
            }

            $scope.checkboxImg = 0;
            $scope.changeCheckbox = function(setting) {
                var checkboxString = "checkboxImg" + setting;
                if ($scope[checkboxString] === 0) {
                    $scope[checkboxString] = 1;
                } else {
                    $scope[checkboxString] = 0;
                }
            };

            $scope.changeLanguage = function(id) {
                $rootScope.languageID = id;
                localStorage.setItem("language", id);
                $scope.abbreviation2 = $rootScope.getLocalizedString('settingsAddServer');
                $scope.abbreviation3 = $rootScope.getLocalizedString('settingsAddServer');
            };
            $scope.languageRadio = $rootScope.languageID;


            $scope.save = function() {
                if ($scope.checkboxImgPatient === 1)
                    $scope.selectedUser.cellcontent.patient = true;
                else
                    $scope.selectedUser.cellcontent.patient = false;
                if ($scope.checkboxImgTitle === 1)
                    $scope.selectedUser.cellcontent.title = true;
                else
                    $scope.selectedUser.cellcontent.title = false;
                if ($scope.checkboxImgDepartment === 1)
                    $scope.selectedUser.cellcontent.department = true;
                else
                    $scope.selectedUser.cellcontent.department = false;

                /*
                 $scope.selectedUser.cellcontent.patient = $('#patientCheckbox').prop('checked');
                 $scope.selectedUser.cellcontent.title = $('#titleCheckbox').prop('checked');
                 $scope.selectedUser.cellcontent.department = $('#departmentCheckbox').prop('checked');*/

                localStorage.setItem($rootScope.user, JSON.stringify($scope.selectedUser));
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };
            $scope.addOrEditServer = function(action, server) {
                if (action === "add" && $scope.selectedUser.servers.length === 3)
                    alert("Er kunnen maximaal 3 ziekenhuizen worden opgeslaan.");
                else {
                    if (action === "edit")
                        $rootScope.editServer = server;
                }
                $rootScope.pageClass = "right-to-left";
                $location.path('/selectserver/' + action);
            };
            /**
             * Prompts the user with a confirmation dialog,
             * Deletes the user currently logged in  and redirect to the login page
             * 
             * @returns {undefined}
             */
            $scope.deleteCurrentUser = function() {
                //Only works on mobile devices
//                window.confirm(
//                        $rootScope.getLocalizedString('settingsDeleteCurrentUserConfirm'),
//                        function(response){
//                            if(response==1){
//                                var users = JSON.parse(localStorage.getItem('users')),
//                                index = users.indexOf($rootScope.user);
//
//                                if (users.length == 1)
//                                    localStorage.removeItem('users');
//                                else{
//                                    users.splice(index, 1);
//                                    localStorage.setItem('users', JSON.stringify(users));
//                                }
//
//
//                                localStorage.removeItem($rootScope.user);
//                                localStorage.removeItem($rootScope.user + 'AbsentDays');
//                                localStorage.removeItem($rootScope.user + 'PublicHolidays');
//                                localStorage.removeItem($rootScope.user + 'Reservations');
//                                localStorage.removeItem($rootScope.user + 'SearchRangeStart');
//                                localStorage.removeItem($rootScope.user + 'SearchRangeEnd');
//                                $rootScope.pageClass = "left-to-right";
//                                $location.path('/login');
//                                $scope.$apply();
//                            }
//                        }
//                );

                //Works in browser
                var response = window.confirm($rootScope.getLocalizedString('settingsDeleteCurrentUserConfirm'));
                if (response) {
                    var users = JSON.parse(localStorage.getItem('users')),
                            index = users.indexOf($rootScope.user);

                    if (users.length == 1)
                        localStorage.removeItem('users');
                    else {
                        users.splice(index, 1);
                        localStorage.setItem('users', JSON.stringify(users));
                    }


                    localStorage.removeItem($rootScope.user);
                    localStorage.removeItem($rootScope.user + 'AbsentDays');
                    localStorage.removeItem($rootScope.user + 'PublicHolidays');
                    localStorage.removeItem($rootScope.user + 'Reservations');
                    localStorage.removeItem($rootScope.user + 'SearchRangeStart');
                    localStorage.removeItem($rootScope.user + 'SearchRangeEnd');
                    $rootScope.pageClass = "left-to-right";
                    $location.path('/login');
                }
            };

            /**
             * Prompts the user with a confirmation dialog,
             * Deletes the selected server
             * @returns {undefined}
             */
            $scope.deleteServer = function() {
                var lsObject = JSON.parse(localStorage.getItem($rootScope.user)),
                        servers = lsObject.servers;
                //Only works on mobile device
                if (servers.length > 1) {
                    window.confirm(
                            $rootScope.getLocalizedString('settingsDeleteServerConfirm'),
                            function(response) {
                                if (response == 1) {
                                    var id = $scope.serverRadio.id,
                                            user_login = $scope.serverRadio.user_login,
                                            user_password = $scope.serverRadio.user_password;

                                    for (var i = 0; i < servers.length; i++) {
                                        if (servers[i].id == id && servers[i].user_login == user_login && servers[i].user_password == user_password) {
                                            $rootScope.currentServers.splice(i, 1);
                                            servers.splice(i, 1);
                                            lsObject.servers = servers;
                                            localStorage.setItem($rootScope.user, JSON.stringify(lsObject));
                                            $rootScope.pageClass = "left-to-right";
                                            $location.path("/login");
                                            $scope.$apply();
                                        }
                                    }
                                }
                            }
                    );
                }
                //Works in browser
//                if(servers.length>1){
//                    var response = window.confirm("are you sure?");
//                    if(response){
//                        var id = $scope.serverRadio.id,
//                            user_login = $scope.serverRadio.user_login,
//                            user_password = $scope.serverRadio.user_password;
//
//                        for(var i=0;i<servers.length;i++){
//                            if(servers[i].id==id && servers[i].user_login==user_login && servers[i].user_password==user_password){
//                                $rootScope.currentServers.splice(i,1);
//                                servers.splice(i,1);
//                                lsObject.servers = servers;
//                                localStorage.setItem($rootScope.user, JSON.stringify(lsObject));
//                                window.location.href = "/HospiView/index.html#/login";
////                                loadSettings();
//                                break;
//                            }
//                        }
//                    }
//                }
            };

            $timeout(function() {
                if ($routeParams.action === "new")
                    alert($rootScope.getLocalizedString("settingsNew"));
            }, 1000);


        }).
        controller('SelectserverCtrl', function($scope, $location, $rootScope, $routeParams, hospiviewFactory, dataFactory, languageFactory, $q, $modal, kiosk_url, base_url) {

            /**
             * If it's the first time a user uses the application, the back button
             * has to be hidden so the user is foreced to select a server.
             */
            if ($routeParams.action === "new")
                $scope.newBoolean = true;
            else
                $("#selectServerButton").removeClass("invisible");

            $scope.back = function() {
                $rootScope.pageClass = "left-to-right";
                $location.path('/settings/default');
            };

            $scope.languageSelected = false;
            $scope.changeLanguage = function(id) {
                $rootScope.languageID = id;
                $scope.userFunctionList = [$rootScope.getLocalizedString('newFunctionPatient'),
                    $rootScope.getLocalizedString('newFunctionRepresentative'),
                    $rootScope.getLocalizedString('newFunctionHouseDoctor'),
                    $rootScope.getLocalizedString('newFunctionDoctor')];
                localStorage.setItem("language", id);
                $scope.languageSelected = true;
            };
            /**
             * Uses hospiviewFactory to do a request. On success the XML will be
             * parsed too JSON. The servers will be put in the $scope servers.
             * @param {type} data   returned data from the webservice
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
            $scope.checkForKiosk = function() {
                $scope.checkingForKiosk = true;
                hospiviewFactory.checkForKiosk($scope.server.hosp_url)
                        .then(function() {
                            $scope.checkingForKiosk = false;
                            $scope.hasKiosk = true;
                            $scope.server.hosp_url += kiosk_url;
                        }, function() {
                            $scope.checkingForKiosk = false;
                            $scope.hasKiosk = false;
                            $scope.server.hosp_url += base_url;
                        });
            };

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
            $scope.checkboxImgServer = 0;

            /**
             * Array of functions a user can have.
             */
            $scope.userFunctionList = [$rootScope.getLocalizedString('newFunctionPatient'),
                $rootScope.getLocalizedString('newFunctionRepresentative'),
                $rootScope.getLocalizedString('newFunctionHouseDoctor'),
                $rootScope.getLocalizedString('newFunctionDoctor')];
            $scope.userFunctionSelected = false;

            /**
             * Depending on the function the user selected the right div will
             * be shown.
             * @param {type} userFunction   the function the user selected
             * @returns {Boolean}           boolean setting 
             */
            $scope.needsNationalReg = function(userFunction) {
                return userFunction === $rootScope.getLocalizedString('newFunctionPatient') || userFunction === $rootScope.getLocalizedString('newFunctionRepresentative');
            };
            $scope.needsRiziv = function(userFunction) {
                return userFunction === $rootScope.getLocalizedString('newFunctionDoctor') || userFunction === $rootScope.getLocalizedString('newFunctionHouseDoctor');
            };

            //TEST DATA
            $scope.firstName = "Voornaam";
            $scope.lastName = "Achternaam";
            $scope.dateOfBirth = "18/05/1993";
            $scope.emailAddress = "Frank.Goyens@icasa-group.com";
            $scope.confirmEmailAddress = "Frank.Goyens@icasa-group.com";
            $scope.nationalRegister = "93051822361";


            /**
             * Webservice request to request an account. The div will will be hidden
             * and the login div will be shown.
             * 
             * TODO: implement webservice request
             */
            $scope.requestAccount = function() {
                if ($scope.userFunctionSelect === $rootScope.getLocalizedString('newFunctionPatient')) {
                    hospiviewFactory.getLogin($scope.firstName + " " + $scope.lastName, $scope.nationalRegister, $scope.emailAddress, '021545214', $rootScope.languageID, 0, $scope.server.hosp_url)
                            .then(function(response) {
                                var json = parseJson(response.data);
                                $scope.accountTrue = true;
                                $scope.accountFalse = false;
                                console.log(json);
                                postAuthentication(json.Authentication);
                            }, function(errorData) {
                                error(errorData);
                            });
                } else {
                    $scope.requestMessage = $rootScope.getLocalizedString('newUserRequestMessage');
                    $scope.accountRadio = $rootScope.getLocalizedString('yes');
                    $scope.accountTrue = true;
                    $scope.accountFalse = false;
                }
            };

            $scope.changeCheckbox = function() {
                if ($scope.checkboxImgServer === 0) {
                    $scope.checkboxImgServer = 1;
                    $scope.savePassword = true;
                } else {
                    $scope.checkboxImgServer = 0;
                    $scope.savePassword = false;
                }
                if ($scope.checkboxImgServer === 1)
                    alert($rootScope.getLocalizedString('loginPasswordCheckedMessage'));
            }

            /**
             * 
             * TODO: write documentation
             */
            $scope.login = function() {
                $scope.loggingIn = true;
                $scope.error = false;
                if (angular.isUndefined($scope.username) && angular.isUndefined($scope.password)) {
                    $scope.error = true;
                    $scope.errormessage = "Gelieve uw gegevens in te vullen";
                } else {
                    hospiviewFactory.getAuthentication($scope.username, $scope.password, $scope.server.hosp_url).
                            success(function(data) {
                                var json = parseJson(data);
                                console.log(json);
                                if (json.Authentication.Header.StatusCode == 1) {
                                    postAuthentication(json.Authentication);
                                } else {
                                    $scope.loggingIn = false;
                                    $scope.error = true;
                                    $scope.errormessage = $rootScope.getLocalizedString('loginError');
                                }
                            }).
                            error(function() {
                                $scope.loggingIn = false;
                                alert($rootScope.getLocalizedString('connectionError'));
                            });
                }
            };

            /**
             * Handles the data object returned by the server on a successful authentication
             * Whether or not the authentication is successful should be checked before this function is called 
             * 
             * @param {type} json
             * @returns {undefined}
             */
            function postAuthentication(json) {
                var localStorageName = json.Detail.user_name;
                if ($routeParams.action === "new" || $routeParams.action === "newLocalUser") {
                    if (localStorage.getItem(localStorageName) === null) {
                        $scope.error = false;
                        $rootScope.user = localStorageName;
                        $rootScope.currentServer = $scope.server;
                        $rootScope.currentServers = [$scope.server];
                        $rootScope.currentServers[0].uuid = json.Detail.uuid;
                        if ($routeParams.action === "new")
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
                                            "reg_no": json.Detail.reg_no,
                                            "unique_pid": json.Detail.unique_pid,
                                            "uuid": json.Detail.uuid,
                                            "isexternal": json.Detail.isexternal,
                                            "save_password": $scope.savePassword,
                                            "shortcut1": {"unit": "", "department": ""},
                                            "shortcut2": {"unit": "", "department": ""},
                                            "shortcut3": {"unit": "", "department": ""}}],
                                    "language_id": json.Detail.language_id,
                                    "cellcontent": {"patient": true,
                                        "title": true,
                                        "department": true},
                                    "refreshrate": 60});
                        /*
                         * 0: dokter (oude hospiview service)
                         * 1: dokter (nieuwe hospiview service)
                         * 2: patiënt
                         * 3: huisarts
                         * 4: kiosk
                         * 5: vertegenwoordiger
                         */
                        $rootScope.type = parseInt(json.Detail.isexternal);
                        console.log($rootScope.type);
                        switch ($rootScope.type) {
                            case 0:
                            case 1:
                                postLoginDoctor();
                                break;
                            case 2:
                                postLoginPatient();
                                break;
                        }
                    } else {
                        $scope.loggingIn = false;
                        $scope.error = true;
                        $scope.errormessage = "Account is reeds op dit toestel toegevoegd.";
                    }
                } else {
                    var selectedUser = JSON.parse(localStorage.getItem($rootScope.user)),
                        invalidUser = false;
                    if ($routeParams.action === "add") {
                        if(json.Detail.isexternal == selectedUser.servers[0].isexternal){
                            var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                            var addServer = {"id": $scope.server.id,
                                "hosp_short_name": $scope.server.hosp_short_name,
                                "hosp_full_name": $scope.server.hosp_full_name,
                                "hosp_url": $scope.server.hosp_url,
                                "user_password": $scope.password,
                                "user_login": $scope.username,
                                "reg_no": json.Detail.reg_no,
                                "unique_pid": json.Detail.unique_pid,
                                "uuid": json.Detail.uuid,
                                "isexternal": json.Detail.isexternal,
                                "save_password": $scope.savePassword,
                                "shortcut1": {"unit": "", "department": ""},
                                "shortcut2": {"unit": "", "department": ""},
                                "shortcut3": {"unit": "", "department": ""}};
                            selectedUser.servers.push(addServer);
                            localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                            $rootScope.serverAdded = true;
                        }else{
                            invalidUser = true;
                            $scope.loggingIn = false;
                            $scope.error = true;
                            $scope.errormessage = "Het opgegeven account is niet van hetzelfde type als de reeds toegevoegde account(s). Om dit account te gebruiken gelieve een nieuwe gebruiker toe te voegen op dit toestel.";
                        }
                    } else {
                        var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                        for (var i = 0; i < selectedUser.servers.length; i++) {
                            if (selectedUser.servers[i].id === $rootScope.editServer.id && selectedUser.servers[i].user_name === $rootScope.editServer.user_name) {
                                var editServer = {"id": $scope.server.id,
                                    "hosp_short_name": $scope.server.hosp_short_name,
                                    "hosp_full_name": $scope.server.hosp_full_name,
                                    "hosp_url": $scope.server.hosp_url,
                                    "user_password": $scope.password,
                                    "user_login": $scope.username,
                                    "reg_no": json.Detail.reg_no,
                                    "unique_pid": json.Detail.unique_pid,
                                    "uuid": json.Detail.uuid,
                                    "isexternal": json.Detail.isexternal,
                                    "save_password": $scope.savePassword,
                                    "shortcut1": {"unit": "", "department": ""},
                                    "shortcut2": {"unit": "", "department": ""},
                                    "shortcut3": {"unit": "", "department": ""}};
                                selectedUser.servers[i] = editServer;
                            }
                        }
                        localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                        $rootScope.serverChanged = true;
                    }
                    if(!invalidUser){
                        $rootScope.user = null;
                        $rootScope.type = null;
                        $rootScope.pageClass = "right-to-left";
                        $location.path('/login');
                    }
                }
            }

            function postLoginPatient() {
                $location.path("/patient/appointmentsPatient");
            }

            function postLoginDoctor() {
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
                UnitPromise = hospiviewFactory.getUnitAndDepList($scope.server.uuid, $scope.server.hosp_url);

                $q.all(holidayPromise).then(function(responses) {
                    dataFactory.setHolidays(responses);
                }, error);

                UnitPromise
                        .then(function(response) {
                            dataFactory.setSearchUnits(response, $scope.server);
                        }, error)
                        .then(function() {
                            return dataFactory.setAbsentDays(year, $scope.server);
                        }, error)
                        .then(function() {
                            return languageFactory.initRemoteLanguageStrings($scope.server.hosp_url);
                        })
                        .then(setDates, error);
            }

            /**
             * When a promise gets rejected during postLogin() this method is used to properly handle the error
             * 
             * @param {type} data
             */
            function error(data) {
                $scope.loggingIn = false;
                $scope.error = true;
                $scope.errormessage = "Geen afspraken gevonden";
//                $scope.errormessage = data;
            }

            /**
             * Sets the dates between which reservations will be searched
             * 
             */
            function setDates() {
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.currentdate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                setData();
            }

            function setData() {
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                if (angular.isUndefined($rootScope[$rootScope.searchString]) || $rootScope[$rootScope.searchString].length === 0) {
                    dataFactory.searchReservations($scope.server)
                            .then(function(reservations) {
                                setReservations(reservations);
                            }, error);
                }
                else {
                    if ($rootScope.startDate < $rootScope.searchRangeStart || $rootScope.endDate > $rootScope.searchRangeEnd) {
                        $scope.reservations = $rootScope[$rootScope.searchString];
                        dataFactory.searchReservations($scope.server)
                                .then(function(reservations) {
                                    setReservations(reservations);
                                }, error);
                    }
                    $rootScope.isOffline = true;
                    $rootScope.pageClass = "right-to-left";
                    $location.path('/settings/new');
                }
            }

            function setReservations(reservations) {
                for (var i = 0; i < reservations.length; i++) {
                    reservations[i].hosp_short_name = $scope.server.hosp_short_name;
                }
                $rootScope[$rootScope.searchString] = reservations;
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    $rootScope.isOffline = false;
                    $rootScope.pageClass = "right-to-left";
                    $location.path('/settings/new');
                }
            }

            /**
             * Calls a dialog box and asks if the user wants to continue searching.
             * If yes, appointments will be searched for the next 14 days.
             * 
             * @returns {undefined}
             */
            function callModal() {
                var modalInstance = $modal.open({
                    templateUrl: 'searchModal',
                    controller: $rootScope.ModalInstance
                });
                modalInstance.result.then(function(answer) {
                    if (answer) {
                        var newStartDate = new Date($rootScope.startDate);
                        newStartDate.setDate(newStartDate.getDate() + 14);
                        var newEndDate = new Date($rootScope.endDate);
                        newEndDate.setDate(newEndDate.getDate() + 14);
                        $rootScope.startDate = formatDate(newStartDate);
                        $rootScope.endDate = formatDate(newEndDate);
                        setData();
                    } else {
                        $location.path('/login');
                    }
                }, function() {
                    console.log("error");
                });
            }

            /**
             * Redirects to the settings page.
             */
            $scope.cancel = function() {
                $rootScope.pageClass = "right-to-left";
                $location.path('/settings/new');
            };

            /**
             * By clicking on the icon in the passwordfield, you can either
             * show or hide the password
             */
            $scope.showpassword = function() {
                $scope.showPasswordBoolean = !$scope.showPasswordBoolean;
            };
        }).
        controller('refreshCtrl', function($scope, $rootScope, $interval, dataFactory) {

            /**
             * Get saved refreshrate. $interval needs the intervaltime in 
             * milliseconds, while the refreshrate will be saved in seconds, so
             * we multiply by 100;
             */
            var user = JSON.parse(localStorage.getItem($rootScope.user));
            var refreshrate = user.refreshrate * 1000;


            var requestTimer = $interval(function() {
                if (!$rootScope.isOffline) {
                    $rootScope.refreshCounter = $rootScope.refreshCounter + 1000;
                    if (refreshrate <= $rootScope.refreshCounter && !$rootScope.searchInProgress) {
                        dataFactory.refresh();
                    }
                }
            }, 1000);

            /**
             * When the user navigates to a different page, certain things will
             * be destroyed like the $scope. This will stop the interval if 
             * the $destroy is called.
             */
            $scope.$on("$destroy", function(event) {
                $interval.cancel(requestTimer);
            });

            $rootScope.$on('setReservationsEvent', function(event, args) {
                $rootScope.refresh = false;
                $rootScope.searchInProgress = false;
                if ($rootScope[$rootScope.searchString].length === 0) {
                    $rootScope.isOffline = true;
                    alert($rootScope.getLocalizedString('uuidExpiredMessage'));
                    $rootScope.user = null;
                    $rootScope.type = null;
                }
            });
        });

