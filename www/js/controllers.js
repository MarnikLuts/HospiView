'use strict';
/* Controllers */

angular.module('myApp.controllers', []).
        controller('LoginCtrl', function($scope, $location, $route, $q, $rootScope, $modal, hospiviewFactory, dataFactory, languageFactory, $timeout) {
            /**
             * Set the counter for the refresh back to 0. The interval depends on
             * the user.
             */
            $rootScope.refreshCounter = 0;

            /**
             * Boolean to check if the localstorage for reservations is full.
             * LocalStorage can only up to 5mb.
             */
            $rootScope.localStorageFull = false;
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
             * showPasswordBoolean will be set to false. If true, the password
             * field will show text instead of dots.
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
             * user will be loaded. With this data, the servers model will be set,
             * username field will be filled and, depending on the usersettings,
             * the password field will be set.
             * Otherwise the servers model will be emptied.
             */
            $scope.getServersUser = function() {
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
                    //$scope.getLoginUser(0);
                } else {
                    $scope.servers[0] = undefined;
                    $scope.servers[1] = undefined;
                    $scope.servers[2] = undefined;
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
//                        $scope.getLoginUser();
                    }
                } else {
                    $scope.user = null;
                    $scope.serverRadio = false;
                }

            /**
             * This function will throw a warning if the user decides to save their password.
             * 
             * @param {integer} serverNr   determines which server
             */
            $scope.changeCheckbox = function(serverNr) {
                if (!$scope.selectedUser.servers[serverNr].save_password)
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
             * The login requests will be done in this function. loggingIn will
             * be set to true, this will display an animition to show the user
             * he is being logged in. For each server the user has configured,
             * the input fields will be checked. If every field of a server
             * has text, a login request for that server will happen. The
             * returned data will be pushed in the promises array and the
             * server will be pushed in the validServers array. $q.all will
             * make sure all requests are done before continuing with the function.
             * The received data will be checked on length and the statuscode in the
             * header of the returned data, to make sure the authentication
             * succeeded. The data will be parsed from XML to JSON. The needed
             * data (user, UUID of the servers, type of user) will be set in 
             * the rootScope for later use and saved in the localStorage. Depending
             * on the type of user, a postLogin method will be called. If
             * no requests could be done, the user will be asked if he wants
             * to continue offline.
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
                for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                    invalidFields[i] = angular.isUndefined($scope.selectedUser.servers[i].user_password) || $scope.selectedUser.servers[i].user_password === "";
                    if (!invalidFields[i]) {
                        promises.push(hospiviewFactory.getAuthentication($scope.selectedUser.servers[i].user_login, $scope.selectedUser.servers[i].user_password, $scope.selectedUser.servers[i].hosp_url));
                        validServers.push($scope.selectedUser.servers[i]);
                    } else
                        $scope.failedServers.push($scope.selectedUser.servers[i].hosp_short_name);
                }
                console.log(promises);
                $q.all(promises).then(function(responses) {
                    if (responses.length == 0)
                        authFailed = true;
                    for (var r = 0; r < responses.length; r++) {
                        var json = parseJson(responses[r]);
                        if (json.Authentication.Header.StatusCode != 1) {
                            $scope.failedServers.push(validServers[r].hosp_short_name);
                            if ($scope.failedServers.length === $scope.selectedUser.servers.length)
                                authFailed = true;
                        } else {
                            $scope.error = false;
                            $rootScope.user = $scope.user;
                            $rootScope.type = parseInt(json.Authentication.Detail.isexternal);

                            validServers[r].uuid = json.Authentication.Detail.uuid;
                            validServers[r].save_password = $scope.selectedUser.servers[r].save_password;
                            validServers[r].reg_no = json.Authentication.Detail.reg_no;
                            $rootScope.currentServers.push(validServers[r]);
                            var saveUserSettings = JSON.parse(localStorage.getItem($scope.user));
                            saveUserSettings.servers[r] = validServers[r];
                            localStorage.setItem($scope.user, JSON.stringify(saveUserSettings));
                        }
                    }
                    if (!authFailed) {
                        $rootScope.isOffline = false;
                        if ($scope.failedServers.length !== 0) {
                            var servers = "";
                            for (var i = 0; i < $scope.failedServers.length; i++) {
                                servers += "\n" + $scope.failedServers[i];
                            }
                            alert($rootScope.getLocalizedString('loginServerListFailed') + servers);
                        }
                        setDates();
                        switch ($rootScope.type) {
                            case 0:
                            case 1:
                                postLoginDoctor();
                                break;
                            case 2:
                                //Application for general practitioner is about the same as a patient, so the in general the same functions will be used.
                            case 3:
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
             * Loads all the necessary data from the server in case a patient logs in
             * 
             * @returns {undefined}
             */
            function postLoginPatient() {
                $rootScope.pageClass = 'right-to-left';
                if (localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null)
                    languageFactory.initRemoteLanguageStrings($rootScope.currentServers[0].hosp_url)
                            .then(function() {
                                $location.path("/patient/mainmenu");
                            }, error);
                else {
                    languageFactory.initLocalLanguageStrings();
                    $location.path("/patient/mainmenu");
                }

            }

            /**
             * loads all the necessary data from the server using the methods of hospiviewfactory and datafactory
             */
            function postLoginDoctor() {
                var year = new Date().getFullYear().toString(),
                        holidayPromise = [];

                //SearchUnits
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                //Absent days
                $rootScope.absentDays = [];

                //Load language strings from servers
                if (localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null)
                    languageFactory.initRemoteLanguageStrings($rootScope.currentServers[0].hosp_url);
                else
                    languageFactory.initLocalLanguageStrings();

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
             * @param {integer} index      determines the server
             */
            function getReservations(index) {
                var year = new Date().getFullYear().toString(),
                        server = $rootScope.currentServers[index];
                $rootScope.searchUnits = [];
                console.log(server.uuid + " " + server.hosp_url);

                hospiviewFactory.getUnitAndDepList(server.uuid, 1, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.setAbsentDays(year, server);
                }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    addReservations(reservations);
                }, error);
            }

            /**
             * Response count is used to track which server we are retrieving data 
             * from. Is being increased every loop.
             * AllReservations is an array where the new reservations are being
             * pushed to before saving them in the rootScope.
             * FirstCycle is used to reset above variables if a new search needs
             * to be done.
             */
            var responseCount = 0;
            var allReservations = [];
            var firstCycle = true;

            /**
             * The reservations from every server get added into one array, 
             * when this function is executed for every server, the data will be 
             * handled by the setReservations function
             * @param {object} reservations     reservations that need to be added to the array of all reservations
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
                callOfflineModal();
            }

            /**
             * Sets the dates between which reservations will be searched.
             */
            function setDates() {
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.currentdate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
            }

            /**
             * Sets the reservations in the rootScope. Alerts the user on which
             * servers the authentication failed. If no reservations are found,
             * a modal will be called to ask the user if he wants to continue 
             * searching for reservations. Else, the reservations will be saved
             * in localStorage so the reservations can be viewed in the offline
             * mode and the user is redirected to the appointmentsView.
             * 
             * @param {object} reservations
             */
            function setReservations(reservations) {
                firstCycle = true;
                $rootScope[$rootScope.searchString] = reservations;


                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    console.log(JSON.stringify($rootScope[$rootScope.searchString]).length);
                    if (JSON.stringify($rootScope[$rootScope.searchString]).length < 2000000) {
                        localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    } else {
                        $scope.localStorageFull = true;
                        alert($rootScope.getLocalizedString('tooManyReservations'));
                    }
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
                                //Application for general practitioner is about the same as a patient, so the in general the same functions will be used.
                            case 3:
                                postLoginPatient();
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
            };

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
                                hasAuthenticated = false;

                        $rootScope.type = servers[0].isexternal;

                        if ($rootScope.type == 0 || $rootScope.type == 1) {
                            var absentDays = JSON.parse(localStorage.getItem($scope.user + "AbsentDays")),
                                    reservations = JSON.parse(localStorage.getItem($scope.user + "Reservations")),
                                    resLength = reservations.length,
                                    absLength = absentDays.length;
                        }

                        $rootScope.currentServers = servers;
                        for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                            console.log(servers[i].user_password === $scope.selectedUser.servers[i].user_password);
                            if (servers[i].user_login === $scope.selectedUser.servers[i].user_login && servers[i].user_password === $scope.selectedUser.servers[i].user_password) {
                                hasAuthenticated = true;
                            } else {
                                if ($rootScope.type == 0 || $rootScope.type == 1) {
                                    var index = $rootScope.currentServers.indexOf(servers[i]);
                                    $rootScope.currentServers.splice(index, 1);
                                    while (resLength--) {
                                        if (reservations[resLength].hosp_short_name === servers[i].hosp_short_name) {
                                            reservations.splice(resLength, 1);
                                        }
                                    }
                                    while (absLength--) {
                                        if (absentDays[absLength].hosp_short_name === servers[i].hosp_short_name) {
                                            absentDays.splice(absLength, 1);
                                        }
                                    }
                                }
                            }
                        }

                        if ($rootScope.type == 0 || $rootScope.type == 1 && hasAuthenticated) {
                            hasAuthenticated = reservations.length != 0;
                        }

                        if (hasAuthenticated) {
                            $rootScope.user = $scope.user;
                            $rootScope.isOffline = true;
                            $rootScope.pageClass = "right-to-left";

                            switch ($rootScope.type) {
                                case '0':
                                case '1':
                                    $rootScope.searchString = $rootScope.user + 'Reservations';
                                    $rootScope[$rootScope.searchString] = reservations;
                                    $rootScope.searchRangeStart = localStorage.getItem($scope.user + "SearchRangeStart");
                                    $rootScope.searchRangeEnd = localStorage.getItem($scope.user + "SearchRangeEnd");
                                    $rootScope.absentDays = absentDays;
                                    $rootScope.publicHolidays = JSON.parse(localStorage.getItem($scope.user + "PublicHolidays"));
                                    $rootScope.currentdate = new Date();
                                    $location.path('/doctor/appointmentsView');
                                    break;
                                case '2':
                                    languageFactory.initLocalLanguageStrings();
                                    $location.path('/patient/mainmenu');
                                    break;
                                case '3':
                                    languageFactory.initLocalLanguageStrings();
                                    $location.path('/patient/mainmenu');
                                    break;
                            }
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

            /**
             * Check if the select box CSS needs to be changed.
             */
            changeSelect();
        }).
        controller('DoctorViewAppointmentsCtrl', function($scope, $rootScope, $location, $modal, hospiviewFactory, dataFactory) {

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
             * If this page was entered from an other screen than the login screen,
             * the last day the user was looking at reservations for will be used
             * as filter date.
             * Else, the first date with reservations will be searched and used.
             */
            if ($rootScope.eventClick) {
                $scope.date = formatDate(new Date($rootScope.currentdate));
                $scope.lastKnownDate = new Date($scope.date);
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

            /**
             * localStorage data will be loaded and used to set the user preferences.
             */
            console.log($rootScope.user);
            var user = JSON.parse(localStorage.getItem($rootScope.user));

            $scope.cellcontentPatient = user.cellcontent.patient;
            $scope.cellcontentTitle = user.cellcontent.title;
            $scope.cellcontentDepartment = user.cellcontent.department;

            /**
             * Used to determine if the shortname should be displayed or not.
             * Won't be displayed on true.
             */
            if ($rootScope.currentServers.length === 1)
                $scope.oneServer = true;

            /**
             * This function is set in the rootscope and will be triggered by
             * an $emit from the refresh function in services.js. Will empty
             * the reservations model and refill it with new data. Is put in the
             * variable removeEvent, this way the $rootScope can be unset by 
             * calling removeEvent(). 
             */
            var removeEvent = $rootScope.$on('setReservationsEvent', function() {
                console.log("setNewReservations");
                $scope.reservations = [];
                $scope.reservations = $rootScope[$rootScope.searchString];
            });

            /**
             * Gets the name of the icon that matches the current status of the given reservation
             * 
             * @param {object} reservation  reservation of which the icon needs to be determined
             * @returns {String}            image name needed to be used for the status
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

            /**
             * Redirects to the detail screen. The reservationDetail will be set 
             * with the data of the reservation the user wants to know the details of.
             * The refresh is stopped with removeEvent().
             * eventClick is set to true, when the user returns to this screen he will
             * see the last day he was looking at. The currentdate is set to the
             * day the user was looking at.
             * @param {object} reservation    reservation of which the user wants to see the details
             */
            $scope.details = function(reservation) {
                removeEvent();
                $rootScope.eventClick = true;
                $rootScope.reservationDetail = reservation;
                $rootScope.currentdate = reservation.the_date;
                $rootScope.pageClass = "right-to-left";
                $location.path('/doctor/appointmentDetail');
            };

            /**
             * Redirects to the settings screen. The refresh is stopped with removeEvent().
             * eventClick is set to true, when the user returns to this screen he will
             * see the last day he was looking at. The currentdate is set to the
             * day the user was looking at.
             */
            $scope.settings = function() {
                removeEvent();
                $rootScope.eventClick = true;
                $rootScope.currentdate = new Date($scope.date);
                $rootScope.pageClass = "right-to-left";
                $location.path('/settings/default');
            };

            $scope.createAppointment = function() {
                if ($rootScope.isOffline) {
                    alert($rootScope.getLocalizedString('notAvailableInOffline'));
                } else {
                    $rootScope.pageClass = "right-to-left";
                    $location.path('/patient/step1');
                }
            };

            /**
             * Redirects to the filter screen. The refresh is stopped with removeEvent().
             * eventClick is set to true, when the user returns to this screen he will
             * see the last day he was looking at. The currentdate is set to the
             * day the user was looking at.
             */
            $scope.filter = function() {
                removeEvent();
                $rootScope.eventClick = true;
                $rootScope.currentdate = $scope.date;
                $rootScope.pageClass = "right-to-left";
                $location.path('/appointmentsFilter');
            };

            /** Stijn Ceunen - 29.04.2014
             * Function to use the unit and department filter. If a unit filter
             * is defined, unit filter is checked on type. If it is a group,
             * the reservation's unit_name and dep_name will be compared with
             * each of the UnitsAndDep in the unitFilter. If not a group,
             * the reservation will be checked for 
             * 
             * @param {type} reservation    reservation needed to be checked
             * @returns {Boolean}           true will make the reservation visible
             */
            $scope.unitAndDepFilterFunction = function(reservation) {
                if ($rootScope.unitFilter === '') {
                    return true;
                } else {
                    if ($rootScope.unitFilter.type === "group") {
                        for (var i = 0; i < $rootScope.unitFilter.Detail.UnitAndDep.length; i++) {
                            if (reservation.unit_name.indexOf($rootScope.unitFilter.Detail.UnitAndDep[i].unit_name) != -1)
                                if (reservation.dep_name.indexOf($rootScope.unitFilter.Detail.UnitAndDep[i].dep_name) != -1)
                                    return true;
                        }
                        return false;
                    } else {
                        if (reservation.unit_name.indexOf($rootScope.unitFilter.Header.name) != -1) {
                            if (reservation.dep_name.indexOf($rootScope.depFilter.dep_name) != -1 || $rootScope.depFilter === '')
                                return true;
                        }
                        return false;
                    }
                }
            };

            /**
             * The reservations are set from the rootScope.
             */
            $scope.reservations = $rootScope[$rootScope.searchString];



            /**
             * Used to display an animation when loading reservations.
             */
            $scope.loadingNext = false;

            /**
             * daySearchLoopCount counts the days the application skips to get
             * to the next day with reservations. This is used in the offline mode
             * to prevent an infinite loop.
             */
            var daySearchLoopCount = 0;

            /**
             * count keeps track of the amount of reservations.
             * daySearchLoopCount is increased everytime the function is called.
             * searchType is used in other functions to determine what should happen.
             * 
             * If the date passes the search range and the user is not offline,
             * A start and enddate will be set to search new appointments and
             * the search() function will be called.
             * Otherwise, the already retrieved reservations will be searched for
             * reservations on the requested day. If this is the 182th time the
             * function is called after each other, the user will get a message
             * that no other reservations were found.
             * If no reservations were found, this is not the 182th time, the
             * function will be called again. If reservations were foun, the
             * filter will be set to that day.
             */
            $scope.nextDay = function() {
                var count = 0;
                if ($rootScope.isOffline)
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

                    if (daySearchLoopCount == 182) {
                        alert($rootScope.getLocalizedString('appointmentsViewEndOfDateRange'));
                        $scope.date = formatDate(new Date($scope.lastKnownDate));
                        $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                        $scope.loadingNext = false;
                        $rootScope.nextDayRequest = false;
                        daySearchLoopCount = 0;
                    } else {
                        if (count === 0) {
                            $scope.nextDay();
                        }
                        else {
                            $scope.lastKnownDate = new Date($scope.date);
                            console.log($scope.lastKnownDate);
                            $scope.loadingNext = false;
                        }
                    }

                }
                $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
            };

            /**
             * Uses the same logic as nextDay but searches backwards instead.
             */
            $scope.previousDay = function() {
                var count = 0;
                if ($rootScope.isOffline)
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
                    if (daySearchLoopCount == 182) {
                        alert($rootScope.getLocalizedString('appointmentsViewEndOfDateRange'));
                        $scope.date = formatDate(new Date($scope.lastKnownDate));
                        $scope.showDate = formatShowDate($scope.date, $rootScope.languageID);
                        $scope.loadingNext = false;
                        $rootScope.nextDayRequest = false;
                        daySearchLoopCount = 0;
                    } else {
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

            $scope.getNextDay = function() {
                if (!$scope.loadingNext)
                    $scope.nextDay();
            };

            $scope.getPreviousDay = function() {
                if (!$scope.loadingNext)
                    $scope.previousDay();
            };

            /**
             * Function for the calendar button. Redirects to the calendar view
             * and loads the remainder of the month's reservations. 
             * 
             * If the user is not offline, the searchranges will be compared to
             * the start and end date of the month. If the start and/or end date
             * pass the searchrange dates, the needed dates will be set to
             * retrieve the remainder of the reservations for that month. Each
             * case has a boolean, if both booleans are true, we retrieve the whole
             * month, if only one boolean is true, the needed part of the month,
             * if none is true, the user will be redirected to the calendarView.
             * 
             */
            $scope.calendarView = function() {
                removeEvent();
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
                    }
                    if (searchStart.getMonth() >= current.getMonth() && searchStart.getDate() > 1 && searchStart.getFullYear() == current.getFullYear()) {
                        searchStart.setDate(searchStart.getDate() - 1);
                        $rootScope.endDate = formatDate(new Date(searchStart));
                        searchStart.setMonth(current.getMonth());
                        searchStart.setDate(1);
                        $rootScope.startDate = formatDate(new Date(searchStart));
                        request2 = true;
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

            /**
             * Used to set the background color of reservations. First the amount
             * of markings are counted and saved in an array. Depending on the length,
             * the right CSS is created and returned.
             * @param {object} reservation reservation object, which includes the colors
             */
            $scope.style = function(reservation) {
                var colors = [];
                var color;
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
                    color = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 50%, #' + colors[1] + ' 50%, #' + colors[1] + ' 100%)';
                    return {"background": color};
                }
                if (colors.length === 3) {
                    color = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 33%, #' + colors[1] + ' 33%, #' + colors[1] + ' 66%, #' + colors[2] + ' 66%, #' + colors[2] + ' 100%)';
                    return {"background": color};
                }
                if (colors.length === 4) {
                    color = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 25%, #' + colors[1] + ' 25%, #' + colors[1] + ' 50%, #' + colors[2] + ' 50%, #' + colors[2] + ' 75%, #' + colors[3] + ' 75%, #' + colors[3] + ' 100%)';
                    return {"background": color};
                }
                if (colors.length === 5) {
                    color = '-webkit-linear-gradient(right, #' + colors[0] + ' 0%, #' + colors[0] + ' 20%, #' + colors[1] + ' 20%, #' + colors[1] + ' 40%, #' + colors[2] + ' 40%, #' + colors[2] + ' 60%, #' + colors[3] + ' 60%, #' + colors[3] + ' 80%, #' + colors[4] + ' 80%, #' + colors[4] + ' 100%)';
                    return {"background": color};
                }
            };

            /**
             * Function to log the user out. The refresh is unset and the user 
             * and type are removed from the rootScope.
             */
            $scope.logout = function() {
                removeEvent();
                $rootScope.user = null;
                $rootScope.type = null;
                $rootScope.pageClass = "left-to-right";
                $location.path('/login');
            };

            /**
             * Setting the string to save the reservations in the localStorage. 
             * Setting the new searchranges.
             */
            function search() {
                console.log("searching through " + $rootScope.currentServers.length + " servers");
                $rootScope.searchString = $rootScope.user + 'Reservations';
                dataFactory.setSearchDates($rootScope.startDate, $rootScope.endDate);
                getReservations(0);
            }

            /**
             * Gets the reservations from the server identified by a given index, when done it will call addReservations
             * @param {type} index      index of the server.
             */
            function getReservations(index) {
                console.log("start " + index);
                var server = $rootScope.currentServers[index];
                $rootScope.searchUnits = [];
                hospiviewFactory.getUnitAndDepList(server.uuid, 1, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    console.log("end " + index);
                    addReservations(reservations);
                });
            }

            /**
             * Response count is used to track which server we are retrieving data 
             * from. Is being increased every loop.
             * AllReservations is an array where the new reservations are being
             * pushed to before saving them in the rootScope.
             * FirstCycle is used to reset above variables if a new search needs
             * to be done.
             */
            var responseCount = 0;
            var allReservations = [];
            var firstCycle = true;

            /**
             * The reservations from every server get added into one array, 
             * when this function is executed for every server, the data will be
             * handled by the setReservations function
             * @param {object} reservations     retrieved reservations
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

            /**
             * Logging the error.
             * 
             * @param {type} data   the error
             */
            function error(data) {
                console.log(data);
            }

            /**
             * For setting the reservations in the rootScope. If no reservations
             * are to be added to the rootScope, the modal will be called to
             * ask the user to continue searching. Otherwise, depending on the
             * action of the user, he will be directed to the calendar or filtering
             * the reservations for the appointmentView screen.
             * 
             * @param {type} reservations
             * @returns {undefined}
             */
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
                    $rootScope.searchInProgress = false;
                    if ($scope.loadingCalendar) {
                        $rootScope.pageClass = "right-to-left";
                        $scope.loadingCalendar = false;
                        $location.path('/appointmentsCalendar');
                    }
                    else {
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
             * Calls a dialog box and asks if the user wants to continue searching.
             * If yes, appointments will be searched for the next or previous
             * 14 days.
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
                            var startSearch = new Date($rootScope.startDate);
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
        controller('FilterCtrl', function($scope, $rootScope, $location, $q, hospiviewFactory) {

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
            $scope.servers = $rootScope.currentServers;

            /**
             * 28.03.2014 Stijn Ceunen
             * This will do a request to get all the units, groups and departments
             * of all the saved servers of the user. It will only be executed if 
             * the user has added a server, changed a saved server or the page 
             * is not visited yet since the user started the application.
             */
            var startIndex = 0;
            for (var i = 0; i < $rootScope.currentServers.length; i++) {
                if (!$rootScope['allUnitsAndGroups' + $rootScope.currentServers[i].id]) {
                    var checkSavedServersUnitsAndGroups = true;
                }
            }
            if ($rootScope.serverAdded === true || $rootScope.serverChanged === true || checkSavedServersUnitsAndGroups) {
                checkSavedServersUnitsAndGroups = false;
                $rootScope.serverChanged = false;
                $rootScope.serverAdded = false;
                var unitsandgroups = [];
                startSearchUnitsAndGroups(startIndex);
            }

            function startSearchUnitsAndGroups(index) {
                if (!(index === $rootScope.currentServers.length)) {
                    unitsandgroups = [];
                    getUnits(index);
                } else {
                    startIndex = 0;
                }
            }

            /**
             * 28.04.2014 Stijn Ceunen
             * Gets the units of a server and puts them in the rootScope for later
             * use. Also, we add the type "doctor" to each unit, because we put
             * the units and groups in the same array.
             * 
             * @param {integer} index   defines the server
             */
            function getUnits(index) {
                var selectedServer = $rootScope.currentServers[index];

                hospiviewFactory.getUnitAndDepList(selectedServer.uuid, 1, selectedServer.hosp_url).
                        success(function(data) {
                            console.log("getunitanddep");
                            var json = parseJson(data);
                            if (json !== null) {
                                if (json.UnitsAndDeps.Header.StatusCode == 1) {
                                    var units = json.UnitsAndDeps.Detail.Unit;
                                    var rootScopeString = 'allUnitsAndGroups' + selectedServer.id;
                                    $rootScope[rootScopeString] = [];
                                    for (var i = 0; i < units.length; i++) {
                                        units[i].type = "doctor";
                                        units[i].Header.name = units[i].Header.unit_name;
                                        $rootScope[rootScopeString].push(units[i]);
                                    }
                                    getGroups(index);
                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = "Fout in de gegevens.";
                                }
                            }

                        }).
                        error(function() {
                            alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                        });
            }

            /** 
             * 28.04.2014 Stijn Ceunen
             * Gets the groups of a server and puts them in the rootScope for later
             * use. Also, we add the type "group" to each unit, because we put
             * the units and groups in the same array.
             * 
             * @param {integer} index   defines the server
             */
            function getGroups(index) {
                var selectedServer = $rootScope.currentServers[index];

                hospiviewFactory.getUnitDepGroups(selectedServer.uuid, selectedServer.hosp_url).
                        success(function(data) {
                            console.log("getunitdepgroups");
                            var json = parseJson(data);
                            if (json !== null) {
                                if (json.UnitDepGroups.Header.StatusCode == 1) {
                                    var groups = json.UnitDepGroups.Detail.Group;
                                    var rootScopeString = 'allUnitsAndGroups' + selectedServer.id;
                                    for (var i = 0; i < groups.length; i++) {
                                        groups[i].type = "group";
                                        groups[i].Header.name = groups[i].Header.group_name;
                                        $rootScope[rootScopeString].push(groups[i]);
                                    }
                                    index++;
                                    startSearchUnitsAndGroups(index);
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
                $scope.depFilter = '';
                if (!$scope.serverFilter) {
                    $scope.disableUnits = true;
                    $scope.unitFilter = '';
                }
                else {
                    $scope.disableUnits = false;
                    $scope.units = $rootScope['allUnitsAndGroups' + $scope.serverFilter.id];
                    var unitOfServer = false;
                    if (angular.isDefined($rootScope.unitFilter.Header))
                        for (var i = 0; i < $scope.units.length; i++) {
                            if ($rootScope.unitFilter.Header.name === $scope.units[i].Header.name) {
                                if ($scope.units[i].type === "group") {
                                    if ($rootScope.unitFilter.Header.group_id == $scope.units[i].Header.group_id) {
                                        unitOfServer = true;
                                        break;
                                    }
                                } else {
                                    if ($rootScope.unitFilter.Header.unit_id == $scope.units[i].Header.unit_id) {
                                        unitOfServer = true;
                                        break;
                                    }
                                }
                            }
                        }
                    if (!unitOfServer) {
                        $scope.unitFilter = '';
                        unitOfServer = false;
                    }
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
                console.log($rootScope.depFilter);
                if (!$scope.unitFilter || $scope.unitFilter.type === "group") {
                    $scope.disableDepartments = true;
                    $scope.depFilter = '';
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
                    var departmentOfUnit = false;

                    if (angular.isDefined($rootScope.depFilter))
                        for (var i = 0; i < $scope.departments.length; i++) {
                            if ($rootScope.depFilter.dep_name === $scope.departments[i].dep_name && $rootScope.depFilter.dep_id == $scope.departments[i].dep_id) {
                                departmentOfUnit = true;
                                break;
                            }
                        }
                    if (!departmentOfUnit) {
                        $scope.depFilter = '';
                        departmentOfUnit = false;
                    }
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
                if (!$rootScope.unitFilter) {
                    $rootScope.unitFilter = '';
                    $rootScope.depFilter = '';
                    $scope.disableDepartments = true;
                } else {
                    for (var i = 0; i < $scope.units.length; i++)
                        if ($scope.units[i].Header.name === $rootScope.unitFilter)
                            $scope.unitFilter = $scope.units[i];
                    $scope.loadDep();
                    if (!$rootScope.depFilter) {
                        $scope.depFilter = '';
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
                console.log($rootScope.unitFilter);

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

            /**
             * Check if the select box CSS needs to be changed.
             */
            changeSelect();
        }).
        controller('searchCtrl', function($scope, $rootScope, hospiviewFactory, dataFactory) {

            /**
             * Setting the animation for loading another month to false.
             */
            $scope.loadingMonth = false;

            /**
             * Calendar shows the next month. If the user is offline, new reservations
             * will be searched.
             */
            $scope.next = function() {
                if (!$scope.loadingMonth) {
                    var calDate = $("#doctorCalendar").fullCalendar('getDate');
                    var months = getMonthNames($rootScope.languageID);
                    if (calDate.getMonth() + 1 < 12)
                        $rootScope.displayMonthDate = months[calDate.getMonth() + 1] + " " + calDate.getFullYear();
                    else
                        $rootScope.displayMonthDate = months[0] + " " + (calDate.getFullYear() + 1);

                    $scope.calendarBrows = 'next';
                    if ($rootScope.isOffline) {
                        $('#doctorCalendar').fullCalendar('next');
                    } else {
                        calendarView();
                    }
                }
            };

            /**
             * Calendar shows the previous month. If the user is offline, new reservations
             * will be searched.
             */
            $scope.prev = function() {
                if (!$scope.loadingMonth) {
                    var calDate = $("#doctorCalendar").fullCalendar('getDate');
                    var months = getMonthNames($rootScope.languageID);
                    if (calDate.getMonth() - 1 > -1)
                        $rootScope.displayMonthDate = months[calDate.getMonth() - 1] + " " + calDate.getFullYear();
                    else
                        $rootScope.displayMonthDate = months[11] + " " + (calDate.getFullYear() - 1);
                    $scope.calendarBrows = 'prev';
                    if ($rootScope.isOffline) {
                        $('#doctorCalendar').fullCalendar('prev');
                    } else {
                        calendarView();
                    }
                }
            };

            /**
             * Used to determine if new reservations need to be requested when 
             * navigating through the calendar. Like in the calendarView function
             * of the DoctorViewAppointmentsCtrl controller, dates will be compared
             * to set new searchdates and the searchranges but in this function extra
             * checks are needed on years.
             */
            function calendarView() {
                var searchStart = new Date($rootScope.searchRangeStart);
                var searchEnd = new Date($rootScope.searchRangeEnd);
                var calendarDate = $("#doctorCalendar").fullCalendar('getDate');
                var current = new Date(calendarDate);
                var nextMonthCount = 0;
                if ($scope.calendarBrows === 'prev')
                    nextMonthCount--;
                else
                    nextMonthCount++;
                var request1 = false;
                var request2 = false;
                if ($scope.calendarBrows === 'next') {
                    if (current.getMonth() == 11 && searchEnd.getFullYear() == current.getFullYear()) {
                        $rootScope.endDate = formatDate(new Date(searchEnd.getFullYear() + 1, 0, 1));
                        searchStart.setMonth(current.getMonth() + nextMonthCount);
                        searchStart.setDate(1);
                        $rootScope.startDate = formatDate(new Date(searchStart));
                        request2 = true;
                    }
                    else {
                        if (searchEnd.getMonth() <= current.getMonth() + nextMonthCount && searchEnd.getFullYear() == current.getFullYear()) {
                            if ($scope.calendarBrows === 'prev')
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

                if ($scope.calendarBrows === 'prev') {
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
                    search();
                } else {
                    $('#doctorCalendar').fullCalendar($scope.calendarBrows);
                }
            }

            /**
             * Set new searchranges and starts the loop to retrieve reservations.
             */
            function search() {
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
                hospiviewFactory.getUnitAndDepList(server.uuid, 1, server.hosp_url)
                        .then(function(response) {
                            return dataFactory.setSearchUnits(response, server);
                        }, error).then(function(server) {
                    return dataFactory.searchReservations(server);
                }, error).then(function(reservations) {
                    console.log("end " + index);
                    addReservations(reservations);
                });
            }

            /**
             * Response count is used to track which server we are retrieving data 
             * from. Is being increased every loop.
             * AllReservations is an array where the new reservations are being
             * pushed to before saving them in the rootScope.
             * FirstCycle is used to reset above variables if a new search needs
             * to be done.
             */
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
                $scope.loadingMonth = false;
                console.log(data);
            }

            /**
             * Sets the new reservations in the rootScope and displays the new
             * reservations on the calendar.
             * @param {type} reservations
             */
            function setReservations(reservations) {
                firstCycle = true;
                for (var i = 0; i < reservations.length; i++) {
                    $rootScope[$rootScope.searchString].push(reservations[i]);
                }
                console.log("setReservations");
                if ($rootScope[$rootScope.searchString].length !== 0) {
                    var countEvent = dataFactory.loadCalendar();
                    if (JSON.stringify($rootScope[$rootScope.searchString]).length < 2000000) {
                        localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    } else {
                        if (!$scope.localStorage()) {
                            alert($rootScope.getLocalizedString('tooManyReservations'));
                            $scope.localStorageFull = true;
                        }
                    }

                    $('#doctorCalendar').fullCalendar('removeEvents');
                    $('#doctorCalendar').fullCalendar('addEventSource', countEvent);
                    $scope.loadingMonth = false;
                    $('#doctorCalendar').fullCalendar($scope.calendarBrows);
                }
            }
        }).
        controller('DoctorViewappointmentDetailCtrl', function($scope, $location, $rootScope) {
            $scope.reservation = $rootScope.reservationDetail;
            /**
             * Redirect the user back to the appointments screen.
             */
            $scope.back = function() {
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };
        }).
        controller('DoctorViewAppointmentsCalendarCtrl', function($scope, $location, $rootScope, dataFactory) {

            var current = new Date($rootScope.currentdate);

            /**
             * Determines if the calendar must show weekends or not. 
             * Default set to false, since most doctors wont have appointments
             * in the weekend.
             */
            var showWeekends = false;

            /**
             * Redirects the user back to the appointments screen.
             */
            $scope.back = function() {
                $rootScope.eventClick = true;
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };

            /**
             * Initial configuration of the calendar. 
             */
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
                        removeEvent();
                        var getClickedDay = calEvent.start;
                        $rootScope.currentdate = formatDate(new Date(getClickedDay.getFullYear(), getClickedDay.getMonth(), getClickedDay.getDate()));
                        $rootScope.eventClick = true;
                        $rootScope.pageClass = "left-to-right";
                        $rootScope.$apply();
                        $location.path('/doctor/appointmentsView');
                    }
                }
            };

            /**
             * Month and year are displayed on top of the page.
             */
            var months = getMonthNames($rootScope.languageID);
            $rootScope.displayMonthDate = months[current.getMonth()] + " " + current.getFullYear();

            /**
             * Load the events and set the events on the calendar
             */
            var countEvent = dataFactory.loadCalendar();
            $scope.eventSources = [countEvent];

            /**
             * Today button on the calendar changes the view to the month of 
             * todays date.
             */
            $scope.today = function() {
                $('#doctorCalendar').fullCalendar('today');
            };

            /**
             * Function to toggle the weekends on and off. 
             */
            $scope.weekend = function() {
                var month = $("#doctorCalendar").fullCalendar('getDate');
                $scope.uiConfig.calendar.month = month.getMonth();
                $scope.uiConfig.calendar.weekends = !$scope.uiConfig.calendar.weekends;
            };

            /**
             * This function is set in the rootscope and will be triggered by
             * an $emit from the refresh function in services.js. Removes the
             * events from the calendar and sets the updated events.
             */
            var removeEvent = $rootScope.$on('setReservationsEvent', function() {
                if ($rootScope[$rootScope.searchString].length !== 0) {
                    countEvent = dataFactory.loadCalendar();
                    $scope.eventSources = [countEvent];
                    var countEvent = dataFactory.loadCalendar();
                    if (JSON.stringify($rootScope[$rootScope.searchString]).length < 2000000) {
                        localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    } else {
                        if (!$scope.localStorage()) {
                            alert($rootScope.getLocalizedString('tooManyReservations'));
                            $scope.localStorageFull = true;
                        }
                    }

                    $('#doctorCalendar').fullCalendar('removeEvents');
                    $('#doctorCalendar').fullCalendar('addEventSource', countEvent);
                }
            });
        }).
        controller('SettingsCtrl', function($scope, $location, $rootScope, $routeParams, $timeout) {
            /*
             * Waits for one second, until the page loads, and displays an informative message
             */
            $timeout(function() {
                if ($routeParams.action === "new")
                    alert($rootScope.getLocalizedString('settingsNew'));
            }, 1000);
            $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));

            /**
             * Initial setup of the server buttons. Depending on how many servers
             * the user saved, either the servername and an image have to be
             * displayed or a text to indicate a user van add a server.
             */
            $scope.abbreviation1 = $scope.selectedUser.servers[0].hosp_short_name;
            $scope.server1Img = "img/hospi.png";
            $scope.serverRadio = $scope.selectedUser.servers[0];
            if ($scope.selectedUser.servers.length == 3) {
                $scope.abbreviation3 = $scope.selectedUser.servers[2].hosp_short_name;
                $scope.server3Img = "img/hospi-gray.png";
                $scope.showServer3 = true;
            } else {
                $scope.abbreviation3 = $rootScope.getLocalizedString('settingsAddServer');
                $scope.showServer3 = false;
                if ($scope.selectedUser.servers.length >= 2) {
                    $scope.abbreviation2 = $scope.selectedUser.servers[1].hosp_short_name;
                    $scope.server2Img = "img/hospi-gray.png";
                    $scope.showServer2 = true;
                } else {
                    $scope.abbreviation2 = $rootScope.getLocalizedString('settingsAddServer');
                    $scope.showServer2 = false;
                }
            }

            /**
             * Setting the correct images for the buttons. Also sets the
             * login and password in the input fields.
             */
            $scope.server1Select = function() {
                $scope.server1Img = "img/hospi.png";
                $scope.server2Img = "img/hospi-gray.png";
                $scope.server3Img = "img/hospi-gray.png";
                $scope.serverRadio = $scope.selectedUser.servers[0];
            };
            $scope.server2Select = function() {
                if ($scope.showServer2 === false) {
                    $scope.addOrEditServer('add');
                } else {
                    $scope.server1Img = "img/hospi-gray.png";
                    $scope.server2Img = "img/hospi.png";
                    $scope.server3Img = "img/hospi-gray.png";
                    $scope.serverRadio = $scope.selectedUser.servers[1];
                }
            };
            $scope.server3Select = function() {
                if ($scope.showServer3 === false) {
                    $scope.addOrEditServer('add');
                } else {
                    $scope.server1Img = "img/hospi-gray.png";
                    $scope.server2Img = "img/hospi-gray.png";
                    $scope.server3Img = "img/hospi.png";
                    $scope.serverRadio = $scope.selectedUser.servers[2];
                }
            };

            /**
             * Saves the language when the radio buttons change. Because the
             * text on the server buttons are set in the rootScope, we need
             * to change it manually.
             * 
             * @param {integer} id     language id
             */
            $scope.changeLanguage = function(id) {
                $rootScope.languageID = id;
                localStorage.setItem("language", id);
                $scope.abbreviation2 = $rootScope.getLocalizedString('settingsAddServer');
                $scope.abbreviation3 = $rootScope.getLocalizedString('settingsAddServer');
            };

            /**
             * Set which language button needs to be pressed.
             */
            $scope.languageRadio = $rootScope.languageID;

            /**
             * Function to save the settings to local storage. Also redirects
             * the user back to the appointments screen.
             */
            $scope.save = function() {
                localStorage.setItem($rootScope.user, JSON.stringify($scope.selectedUser));
                $rootScope.pageClass = "left-to-right";
                $location.path('/doctor/appointmentsView');
            };

            /**
             * First, there is a check to prevent the user from adding more than 3 servers.
             * Then redirects the user to the selectserver screen. The action will
             * be passed as a route parameter.
             * 
             * @param {type} action     the action needed to be taken (Edit or add)
             * @param {type} server     the server that needs to be edited
             */
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
                if (navigator.notification) {
                    //Only works on mobile devices
                    window.confirm(
                            $rootScope.getLocalizedString('settingsDeleteCurrentUserConfirm'),
                            function(response) {
                                if (response == 1) {
                                    var users = JSON.parse(localStorage.getItem('users')),
                                            index = -1;

                                    for (var i = 0; i < users.length; i++) {
                                        if (users[i].username === $rootScope.user) {
                                            index = i;
                                            break;
                                        }
                                    }

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
                                    $scope.$apply();
                                }
                            }
                    );
                } else {
                    //Works in browser
                    var response = window.confirm($rootScope.getLocalizedString('settingsDeleteCurrentUserConfirm'));
                    if (response) {
                        var users = JSON.parse(localStorage.getItem('users')),
                                index = -1;

                        for (var i = 0; i < users.length; i++) {
                            if (users[i].username === $rootScope.user) {
                                index = i;
                                break;
                            }
                        }

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
                }
            };

            $scope.changeCurrentUser = function() {
                $rootScope.pageClass = 'left-to-right';
                $location.path('/changeUser');
            };

            /**
             * Prompts the user with a confirmation dialog,
             * Deletes the selected server
             * @returns {undefined}
             */
            $scope.deleteServer = function() {
                var lsObject = JSON.parse(localStorage.getItem($rootScope.user)),
                        servers = lsObject.servers;
                if (navigator.notification) {
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
                                                break;
                                            }
                                        }
                                    }
                                }
                        );
                    }
                } else {
                    //Works in browser
                    if (servers.length > 1) {
                        var response = window.confirm($rootScope.getLocalizedString('settingsDeleteServerConfirm'));
                        if (response) {
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
                                    break;
                                }
                            }
                        }
                    }
                }
            };

            /**
             * Check if the select box CSS needs to be changed.
             */
            changeSelect();
        }).
        controller('SelectserverCtrl', function($scope, $location, $rootScope, $routeParams, hospiviewFactory, dataFactory, languageFactory, $q, $modal, kiosk_url, base_url, $timeout) {
            /**
             * If it's the first time a user uses the application, the back button
             * has to be hidden so the user is foreced to select a server.
             */
            if ($routeParams.action === "new")
                $scope.newBoolean = true;
            else
                $("#selectServerButton").removeClass("invisible");

            /**
             * Redirects the user back to the settings screen.
             */
            $scope.back = function() {
                $rootScope.pageClass = "left-to-right";
                history.back();
//                $location.path('/settings/default');
            };

            /**
             * Set the initial selected language to false so no language is 
             * selected. If a language is selected, the id is set in the rootScope
             * and saves it in the localStorage. Fills the userFunctionList in the
             * chosen language.
             */
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
             * parsed to JSON. The servers will be put in the $scope servers.
             */
            $scope.refreshServerList = function() {
                hospiviewFactory.getHospiViewServerList().
                        success(function(data) {
                            var json = parseJson(data);
                            $scope.servers = json.HospiviewServerList.Detail.Server;
                        }).
                        error(function() {
                            alert($rootScope.getLocalizedString('connectionErrorSelectServer'));
                        });
            };
            $scope.refreshServerList();

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

            /**
             * Webservice request to request an account. The div will will be hidden
             * and the login div will be shown.
             * 
             * TODO: implement webservice request
             */
            $scope.requestAccount = function() {
                if ($scope.userFunctionSelect === $rootScope.getLocalizedString('newFunctionPatient')) {
                    hospiviewFactory.getLogin($scope.firstName + " " + $scope.lastName, $scope.nationalRegister, $scope.emailAddress, $scope.phone, $rootScope.languageID, 0, $scope.server.hosp_url)
                            .then(function(response) {
                                var json = parseJson(response);
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

            /**
             * Change the checkbox image when the user clicks the save_password checkbox.
             * Also throws a warning if the user decides to save his password.
             */
            $scope.changeCheckbox = function() {
                if (!$scope.savePassword)
                    alert($rootScope.getLocalizedString('loginPasswordCheckedMessage'));
            };

            /**
             * Set loggingIn to true, so the loggin animation starts. If any login
             * information is missing, a errormessage will be shown, but this
             * shouldn't be the case since the login button is only pressable when
             * all information is entered.
             * If all information is present, getAuthentication service is called
             * to execute the login.
             * 
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
                                if (json !== null && json.Authentication.Header.StatusCode == 1) {
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
                        var server = {"servers": [{"id": $rootScope.currentServer.id,
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
                            "refreshrate": 60}
                        addToLocalStorage(localStorageName, server);
                        $rootScope.currentServers[0] = server.servers[0];
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
                            case 3:
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
                    if (json.Detail.isexternal == 0)
                        json.Detail.isexternal++;
                    if (selectedUser.servers[0].isexternal == 0)
                        selectedUser.servers[0].isexternal++;
                    if ($routeParams.action === "add") {
                        if (json.Detail.isexternal == selectedUser.servers[0].isexternal) {
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
                        } else {
                            invalidUser = true;
                            $scope.loggingIn = false;
                            $scope.error = true;
                            $scope.errormessage = "Het opgegeven account is niet van hetzelfde type als de reeds toegevoegde account(s). Om dit account te gebruiken gelieve een nieuwe gebruiker toe te voegen op dit toestel.";
                        }
                    } else {
                        var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                        console.log(selectedUser);
                        for (var i = 0; i < selectedUser.servers.length; i++) {
                            if (selectedUser.servers[i].id === $rootScope.editServer.id && selectedUser.servers[i].user_login === $rootScope.editServer.user_login) {
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
                        console.log(selectedUser);
                        localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                        $rootScope.serverChanged = true;
                    }
                    if (!invalidUser) {
                        $rootScope.user = null;
                        $rootScope.type = null;
                        $rootScope.pageClass = "right-to-left";
                        $location.path('/login');
                    }
                }
            }

            /**
             * Set needed language strings to the rootScope.
             */
            function postLoginPatient() {
                languageFactory.initRemoteLanguageStrings($rootScope.currentServers[0].hosp_url)
                        .then(function() {
                            console.log($rootScope.nlRemoteDict);
                            console.log($rootScope.enRemoteDict);
                            console.log($rootScope.frRemoteDict);
                            $rootScope.pageClass = 'right-to-left';
                            $location.path("/patient/mainmenu");
                        }, error);
            }

            /**
             * Does the needed requests to initiate and fill rootScope arrays with 
             * search units, holidays and absentdays.
             */
            function postLoginDoctor() {
                var year = new Date().getFullYear().toString(),
                        holidayPromise = [],
                        UnitPromise;
                //Holidays
                $rootScope.publicHolidays = [];
                //SearchUnits
                $rootScope.searchUnits = [];
                $rootScope.searchString = $rootScope.user + 'Reservations';
                //Absent days
                $rootScope.absentDays = [];

                //Load language strings from servers
                if (localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null || localStorage.getItem('nlRemoteDict') === null)
                    languageFactory.initRemoteLanguageStrings($rootScope.currentServers[0].hosp_url);
                else
                    languageFactory.initLocalLanguageStrings();

                for (var i = 1; i < 4; i++) {
                    holidayPromise.push(hospiviewFactory.getPublicHolidays(i, year, '00', $scope.server.hosp_url));
                }
                UnitPromise = hospiviewFactory.getUnitAndDepList($scope.server.uuid, 1, $scope.server.hosp_url);

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
             * Sets the dates between which reservations will be searched.
             * 
             */
            function setDates() {
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.currentdate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                setData();
            }

            /**
             * The set dates are used to get the reservations. 
             */
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

            /**
             * First, we add the hospital short name to the reservations, this
             * is used in the reservations screen. Then we add the reservations to 
             * the rootScope. Then redirects the user back to the settings screen.
             * @param {type} reservations   new reservations needed to be added to the rootScope
             */
            function setReservations(reservations) {
                for (var i = 0; i < reservations.length; i++) {
                    reservations[i].hosp_short_name = $scope.server.hosp_short_name;
                }
                $rootScope[$rootScope.searchString] = reservations;
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
                    if (JSON.stringify($rootScope[$rootScope.searchString]).length < 2000000) {
                        localStorage.setItem($rootScope.searchString, JSON.stringify($rootScope[$rootScope.searchString]));
                    } else {
                        $scope.localStorageFull = true;
                        alert($rootScope.getLocalizedString('tooManyReservations'));
                    }

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

            /**
             * Check if the select box CSS needs to be changed.
             */
            changeSelect();

            $timeout(function() {
                $(".hideDiv").removeClass('hideDiv');
            }, 3000);

        }).
        controller('refreshCtrl', function($scope, $rootScope, $interval, dataFactory) {

            /**
             * Get saved refreshrate. $interval needs the intervaltime in 
             * milliseconds, while the refreshrate will be saved in seconds, so
             * we multiply by 100;
             */
            var user = JSON.parse(localStorage.getItem($rootScope.user));
            var refreshrate = user.refreshrate * 1000;

            /**
             * The refresh will happen if the user is not offline or another
             * search being done.
             */
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
            $scope.$on("$destroy", function() {
                $interval.cancel(requestTimer);
            });

        }).
        controller("MainmenuCtrl", function($rootScope, $scope, $location) {
            /**
             * User gets logged out
             */
            $scope.logout = function() {
                $rootScope.pageClass = 'left-to-right';
                $location.path('/login');
            };

            /**
             * User gets redirected to a patient's settings page
             * 
             */
            $scope.settings = function() {
                $rootScope.pageClass = 'right-to-left';
                $location.path('/settingsPatient/default');
            };

            /**
             * User gets redirected to step 1 of creating a new appointment
             */
            $scope.createAppointment = function() {
                if ($rootScope.isOffline) {
                    alert($rootScope.getLocalizedString('notAvailableInOffline'));
                } else {
                    $rootScope.pageClass = 'right-to-left';
                    $location.path('patient/step1');
                }
            };

            /**
             * User gets redirected to their overview of appointments
             */
            $scope.viewAppointments = function() {
                $rootScope.pageClass = 'right-to-left';
                $location.path('patient/appointmentsView');
            };
        }).
        controller('PatientViewAppointmentsCtrl', function($scope, $location, $rootScope, hospiviewFactory, $q) {
            var searchStart = new Date(),
                    searchEnd = new Date();
            $scope.reservationPromises = [];
            $scope.loadingPatientReservations = true;
            searchEnd.setDate(searchStart.getDate() + 90);

            $scope.formatShowDate = function(date) {
                return formatShowDate(date, $rootScope.languageID);
            };

            $scope.formatShortDate = function(date) {
                date = new Date(date);
                return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            };



            /*var depLocations = [];
             for (var i = 0; i < $rootScope.currentServers.length; i++) {
             depLocations.push(hospiviewFactory.getUnitAndDepList($rootScope.currentServers[i].uuid, 1, $rootScope.currentServers[i].hosp_url));
             }
             
             var jsonServerLocations = [];
             $q.all(depLocations)
             .then(function(responses) {*/
            $scope.reservationPromises = [];
            /*for (var i in responses)
             jsonServerLocations.push(parseJson(responses[i]));*/

            $scope.reservationList = [];
            for (var s = 0; s < $rootScope.currentServers.length; s++) {
                var server = $rootScope.currentServers[s];
                console.log(server);
                console.log(server.reg_no);
                console.log(formatDate(searchStart));
                console.log(formatDate(searchEnd));
                console.log(server.hosp_url);
                $scope.reservationPromises.push(hospiviewFactory.getReservationsOnPatient(server.uuid, 2, server.reg_no, formatDate(searchStart), formatDate(searchEnd), server.hosp_url));
            }

            //var locationDepObject = {};
            $q.all($scope.reservationPromises)
                    .then(function(responses) {
                        console.log(responses);
                        for (var r = 0; r < responses.length; r++) {
                            console.log(responses);
                            var json = parseJson(responses[r]);
                            console.log(json);
                            if (json.ReservationsOnPatient.Header.StatusCode == 1 && json.ReservationsOnPatient.Detail) {

                                /*
                                 * Convert json.ReservationsOnPatient.Detail.Reservation to an array if there's only one record
                                 */
                                if (json.ReservationsOnPatient.Header.TotalRecords == 1)
                                    json.ReservationsOnPatient.Detail.Reservation = [json.ReservationsOnPatient.Detail.Reservation];

                                /*for (var k in jsonServerLocations[r].UnitsAndDeps.Detail.Unit)
                                 for (var m in jsonServerLocations[r].UnitsAndDeps.Detail.Unit[k].Detail.Dep) {
                                 locationDepObject[jsonServerLocations[r].UnitsAndDeps.Detail.Unit[k].Detail.Dep[m].dep_id]
                                 = jsonServerLocations[r].UnitsAndDeps.Detail.Unit[k].Detail.Dep[m].location_name;
                                 }*/

                                for (var i = 0; i < json.ReservationsOnPatient.Detail.Reservation.length; i++) {
                                    json.ReservationsOnPatient.Detail.Reservation[i].hosp_short_name = $rootScope.currentServers[r].hosp_short_name;
                                    console.log(json.ReservationsOnPatient.Detail.Reservation[i].unit_id);
                                    //json.ReservationsOnPatient.Detail.Reservation[i].location_name = locationDepObject[json.ReservationsOnPatient.Detail.Reservation[i].dep_id];
                                    $scope.reservationList.push(json.ReservationsOnPatient.Detail.Reservation[i]);
                                }
                                localStorage.setItem($rootScope.user + "PatientReservations", JSON.stringify($scope.reservationList));
                            }
                        }
                        $scope.loadingPatientReservations = false;
                    }, error);
            /*});*/






            function error(data) {
                if (!$rootScope.isOffline) {
                    alert($rootScope.getLocalizedString("appointmentsViewPatientNoConnection"));
                    $rootScope.isOffline = true;
                }
                $scope.reservationList = JSON.parse(localStorage.getItem($rootScope.user + "PatientReservations"));
                $scope.loadingPatientReservations = false;
                console.log(data);
            }

            /**
             * User gets logged out
             */
            $scope.back = function() {
                $rootScope.pageClass = 'left-to-right';
                $location.path('/mainmenu');
            };
        }).
        controller("SettingsPatientCtrl", function($rootScope, $scope, $location) {
            /**
             * The user is redirected back to the main menu
             */
            $scope.save = function() {
                $rootScope.pageClass = 'left-to-right';
                $location.path('/patient/mainmenu');
            };
        }).
        controller("ChangeUserCtrl", function($rootScope, $scope, $routeParams, $location, hospiviewFactory) {

            $scope.save = function() {
                for (var server in $rootScope.currentServers) {
                    hospiviewFactory.getLogin($scope.firstName, $rootScope.currentServers[server].reg_no, $scope.emailAddress, '021545214', $rootScope.languageID, 0, $scope.server.hosp_url)
                            .then(function(response) {
                                var json = parseJson(response);
                                $scope.accountTrue = true;
                                $scope.accountFalse = false;
                                console.log(json);
                                postAuthentication(json.Authentication);
                            }, function(errorData) {
                                error(errorData);
                            });
                }

                $rootScope.pageClass = 'left-to-right';
                $location.path('/patient/mainmenu');
            };
        }).
        controller("CreateAppointmentStep1Ctrl", function($rootScope, $scope, hospiviewFactory, $location, $q) {

            /**
             * The unit and department list is requested from the server
             * The variable $scope.unitList is filled with the data from the server and the select boxes are filled automatically
             * If there is only one option, that option is automatically selected
             */
            $scope.getUnitsAndGroups = function() {
                var index = $rootScope.currentServers.indexOf($scope.server);
                $scope.unitList = [];
                $scope.groupList = [];
                $scope.unit = null;
                $scope.group = null;
                if (angular.isDefined($scope.server)) {
                    $scope.dataLoading = true;
                    hospiviewFactory.getUnitAndDepList($rootScope.currentServers[index].uuid, 1, $rootScope.currentServers[index].hosp_url)
                            .then(function(response) {
                                var json = parseJson(response),
                                        defer = $q.defer();
                                console.log(json);
                                if (json.UnitsAndDeps.Header.StatusCode == 1 && json.UnitsAndDeps.Detail != null) {
                                    $scope.unitList = json.UnitsAndDeps.Detail.Unit;
                                    /**
                                     * Filter out departments for which there aren't enough permissions
                                     * if the unit has no more departments delete the unit
                                     */
                                    var unitAmount = $scope.unitList.length;
                                    while (unitAmount--) {
                                        filterDepartments($scope.unitList[unitAmount]);
                                        if ($scope.unitList[unitAmount].Detail.Dep.length == 0) {
                                            $scope.unitList.splice(unitAmount, 1);
//                                            console.log("unit deleted, no departments");
                                        }
                                    }

                                    if ($scope.unitList.length == 1)
                                        $scope.unit = $scope.unitList[0];
                                } else {
                                    error("statuscode not 1");
                                }
                                defer.resolve();
                                return defer.promise;
                            }, error).then(function() {
                        /**
                         * The group list (blue groups) is requested from the server
                         * if there are any units left after permission filtering
                         * 
                         * The variable $scope.unitList is filled with the data from the server and the select boxes are filled automatically
                         * If there is only one option, that option is automatically selected
                         */
                        if ($scope.unitList.length != 0) {
                            hospiviewFactory.getUnitDepGroups($rootScope.currentServers[index].uuid, $rootScope.currentServers[index].hosp_url)
                                    .then(function(response) {
                                        var json = parseJson(response);
                                        console.log(json);
                                        if (json.UnitDepGroups.Header.StatusCode == 1 && json.UnitDepGroups.Detail != null) {
                                            $scope.groupList = json.UnitDepGroups.Detail.Group;

                                            var groupAmount = $scope.groupList.length;
                                            while (groupAmount--) {
                                                var unitAndDepAmount = $scope.groupList[groupAmount].Detail.UnitAndDep.length;
                                                while (unitAndDepAmount--) {
                                                    var unit = getUnitByDepId($scope.groupList[groupAmount].Detail.UnitAndDep[unitAndDepAmount].unit_id, $scope.groupList[groupAmount].Detail.UnitAndDep[unitAndDepAmount].dep_id);
                                                    //It's possible the unit has already been deleted
                                                    if (unit) {
                                                        filterDepartments(unit);
                                                        if (unit.Detail.Dep.length == 0) {
                                                            $scope.groupList[groupAmount].Detail.UnitAndDep.splice(unitAndDepAmount, 1);
//                                                               console.log("unit deleted, no departments");
                                                        }
                                                    } else {
                                                        $scope.groupList[groupAmount].Detail.UnitAndDep.splice(unitAndDepAmount, 1);
//                                                           console.log("unit deleted, does not exist in filtered unit list");
                                                    }
                                                }
                                                if ($scope.groupList[groupAmount].Detail.UnitAndDep.length == 0) {
                                                    $scope.groupList.splice(groupAmount, 1);
//                                                       console.log("group deleted, no units");
                                                }
                                            }

                                            if ($scope.groupList.length == 1 && $scope.unitList.length != 1)
                                                $scope.group = $scope.groupList[0];
                                        } else {
                                            error("statuscode not 1");
                                        }
                                        $scope.dataLoading = false;
                                        //Not using ng-show/ng-hide because iOS does not cooperate
                                        $("#unitSelectRow").removeClass("hiddenBlock");
                                        $("#groupSelectRow").removeClass("hiddenBlock");
                                        $("#orRow").removeClass("hiddenBlock");
                                    }, error);
                        } else {
                            $scope.dataLoading = false;
                            $("#unitSelectRow").removeClass("hiddenBlock");
                            $("#groupSelectRow").removeClass("hiddenBlock");
                            $("#orRow").removeClass("hiddenBlock");
                        }
                    }, error);


                }
            };

            /**
             * Function that is called when the request to the server fails for error handling
             * 
             * @param {type} data
             * @returns {undefined}
             */
            function error(data) {
                if (!$rootScope.isOffline) {
                    alert($rootScope.getLocalizedString("appointmentsViewPatientNoConnectionCreateAppointment"));
                    $rootScope.isOffline = true;
                    switch ($rootScope.type) {
                        case 0:
                        case 1:
                            $location.path('/doctor/appointmentsView');
                            break;
                        case 2:
                        case 3:
                            $location.path('/patient/mainmenu');
                            break;
                    }
                }
                console.log(data);
                $scope.error = true;
            }

            if ($rootScope.currentServers.length === 1) {
                $scope.server = $rootScope.currentServers[0];
                $scope.getUnitsAndGroups();
            }

            /**
             * Used to convert a group format to unit format
             * 
             * '$scope.unitList' get looped through until the unit is found that has a derpartment with the given id
             * a unit with only the derpartment with the given id is returned
             * 
             * @param {type} unit_id
             * @param {type} dep_id
             * @returns {unit}
             */
            function getUnitByDepId(unit_id, dep_id) {
                for (var i = 0; i < $scope.unitList.length; i++) {
                    if ($scope.unitList[i].Header.unit_id == unit_id) {
                        for (var j = 0; j < $scope.unitList[i].Detail.Dep.length; j++) {
                            var dep = $scope.unitList[i].Detail.Dep[j];
                            if (dep.dep_id == dep_id) {
                                var unit = JSON.parse(JSON.stringify($scope.unitList[i])); //this need to be done to prevent editing the original unit
                                unit.Detail.Dep = [dep];
                                return unit;
                            }
                        }
                    }
                }
            }

            /**
             * Loops through every department from the given unit
             * 
             * if the perm value of the unit is 2 (no full control)
             * and the perm value of the department is 4 (read only)
             * it is not possible to make an appointment in that department so it is removed from the list
             * 
             * @param {type} unit
             * @returns {undefined}
             */
            function filterDepartments(unit) {
                if (unit.Header.perm === "2") {
                    var depAmount = unit.Detail.Dep.length;
                    while (depAmount--) {
                        var dep = unit.Detail.Dep[depAmount];
//                        console.log(unit.Header.perm + "-> " + dep.perm + " (" + dep.dep_id  + ")");
                        if (dep.perm === "4") {
                            unit.Detail.Dep.splice(depAmount, 1);
//                            console.log("Deleted, permission denied");
                        }
//                        console.log("-----------");
                    }
                }
            }


            /**
             * The properties 'server' and 'units' of the variable $rootScope.newAppointment are set 
             * the user is redirected to the next step
             * 
             * @returns {undefined}
             */
            $scope.next = function() {
                var units = [],
                        unitOrGroupName;
                //standardize data for next steps
                if ($scope.group !== null) {
                    unitOrGroupName = $scope.group.Header.group_name;
                    //every group gets converted to a unit and is put into the unit array
                    for (var g = 0; g < $scope.group.Detail.UnitAndDep.length; g++) {
                        units.push(getUnitByDepId($scope.group.Detail.UnitAndDep[g].unit_id, $scope.group.Detail.UnitAndDep[g].dep_id));
                    }
                } else {
                    unitOrGroupName = $scope.unit.Header.unit_name;
                    //the one unit that is selected gets put into the array
                    units = [$scope.unit];
                }
                $rootScope.pageClass = 'right-to-left';
                $rootScope.newAppointment = null;
                $rootScope.newAppointment = {
                    server: $rootScope.currentServers.indexOf($scope.server),
                    units: units,
                    unitOrGroupName: unitOrGroupName
                };
                $location.path('/patient/step2');
            };

            changeSelect();

        }).
        controller("CreateAppointmentStep2Ctrl", function($rootScope, $scope, $location, $q, hospiviewFactory) {

            $scope.typeList = [];
            $scope.type = null;
            $scope.step2Blocked = false;
            $scope.typesLoaded = false;
            $scope.displayError = false;
            $scope.loadingStep3 = false;

            //If the user came back to step 2 from step 3 the extra info field is remebered
            if ($rootScope.newAppointment.reservationInfo)
                $scope.reservationInfo = $rootScope.newAppointment.reservationInfo;

            /**
             * The locations from the unit or group from step 1 are put into a list
             * 
             * The types associated with this unit or group are requested from the server
             */

            $scope.locations = [];
            $scope.blank_locations = 0;
            for (var i = 0; i < $rootScope.newAppointment.units.length; i++) {
                var unit = $rootScope.newAppointment.units[i];
                for (var j = 0; j < unit.Detail.Dep.length; j++) {
                    var dep = unit.Detail.Dep[j],
                            duplicate = false;
                    for (var h = 0; h < $scope.locations.length; h++) {
                        if ($scope.locations[h].location_id == dep.location_id) {
                            duplicate = true;
                            break;
                        }

                    }
                    if (dep.location_name === "")
                        $scope.blank_locations++;
                    if (!duplicate || dep.location_name === "") {
                        $scope.locations.push({
                            checked: true,
                            disabled: false,
                            location_id: dep.location_id,
                            location_name: dep.location_name,
                            dep_id: dep.dep_id
                        });
                    }
                }
            }

            var unitTypesRequested = 0,
                    depTypeRequested = 0;

            /*
             * If the patient came back to step 2 from step 3 the type is remembered
             */
            $scope.rememberType = function() {
                if ($rootScope.newAppointment.type) {
//                    console.log($rootScope.newAppointment.type);
//                    $scope.type = $rootScope.newAppointment.type;
                    for (var i = 0; i < $scope.typeList.length; i++) {
                        if ($scope.typeList[i].type_title === $rootScope.newAppointment.type.type_title) {
                            $scope.type = $scope.typeList[i];
                            $scope.updateFormData();
                        }
                    }
                }
            };

            getTypes();
            /*
             * gets called by itself until every department of every unit in '$rootScope.newAppointment.units' has done a request
             * this is done in this manner to be able to add the unit_id and dep_id to the type variable to simplify further steps
             * if the amount of requests is lower than the number of departments another request is made until all types for every department are returned
             * 
             * @param {number} unit_id
             * @param {number} dep_id
             * @returns {undefined}
             */
            function getTypes() {
                var unit_id = $rootScope.newAppointment.units[unitTypesRequested].Header.unit_id,
                        dep_id = $rootScope.newAppointment.units[unitTypesRequested].Detail.Dep[depTypeRequested].dep_id,
                        duplicate = false;
                if ($rootScope.newAppointment.units[unitTypesRequested].Header.extern_step2 === "0") {
                    for (var d = 0; d < $rootScope.newAppointment.units[unitTypesRequested].Detail.Dep.length; d++) {
                        var dep_no_step2 = $rootScope.newAppointment.units[unitTypesRequested].Detail.Dep[d],
                                duplicate_stitle = false,
                                new_type = {
                                    type_title: dep_no_step2.stitle,
                                    unit_id: [unit_id],
                                    dep_id: [dep_no_step2.dep_id],
                                    type_id: ["0"],
                                    location_id: [dep_no_step2.location_id]
                                };

                        for (var t = 0; t < $scope.typeList.length; t++) {
                            if (dep_no_step2.stitle === $scope.typeList[t].type_title) {
                                duplicate_stitle = true;
                                console.log(combinationExists($scope.typeList, new_type));
                                if (!combinationExists($scope.typeList, new_type)) {
                                    $scope.typeList[t].unit_id.push(unit_id);
                                    $scope.typeList[t].dep_id.push(dep_no_step2.dep_id);
                                    $scope.typeList[t].type_id.push("0");
                                    $scope.typeList[t].location_id.push(dep_no_step2.location_id);
                                }
                                break;
                            }
                        }
                        if (!duplicate_stitle && dep_no_step2.stitle !== "") {
                            $scope.typeList.push(new_type);
                        }
                    }
                    depTypeRequested++;
                    if (depTypeRequested == $rootScope.newAppointment.units[unitTypesRequested].Detail.Dep.length) {
                        depTypeRequested = 0;
                        unitTypesRequested++;
                    }
                    if (unitTypesRequested != $rootScope.newAppointment.units.length) {
                        getTypes();
                    } else {
                        $scope.typesLoaded = true;
                        $scope.rememberType();
                        console.log($scope.typeList);
                    }
                } else {
                    hospiviewFactory.getTypes($rootScope.currentServers[$rootScope.newAppointment.server].uuid, unit_id, dep_id, $rootScope.newAppointment.units[unitTypesRequested].Header.globaltypes, $rootScope.newAppointment.units[unitTypesRequested].Header.the_online, $rootScope.languageID, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url)
                            .then(function(response) {
                                console.log(response);
                                var json = parseJson(response);
                                console.log(json);
                                if (json.TypesOnUnit.Header.StatusCode === "1") {

                                    //Status is OK
                                    if (json.TypesOnUnit.Detail) {
                                        //Response contains a Detail variable

                                        //if there's only one type convert it to an array with a single element
                                        if (json.TypesOnUnit.Header.TotalRecords === "1")
                                            json.TypesOnUnit.Detail.Type = [json.TypesOnUnit.Detail.Type];

                                        /*
                                         * populate $scope.typeList while omitting duplicate values
                                         * 
                                         * if there is a duplicate, it will not be added to the list, 
                                         * but the unit_id, type_id and dep_id are put into the 'Type' variable that's already been added
                                         * 
                                         * the unit_id, type_id and dep_id fields are arrays that hold more than one value if there was a duplicate
                                         * these fields must always have the same length for each type to successfully retrieve data in the next step
                                         * 
                                         * there should be a unique combination to form a request for a proposal when you combine the values of unit_id, type_id and dep_id for a given index
                                         * 
                                         */
                                        for (var t = 0; t < json.TypesOnUnit.Detail.Type.length; t++) {
                                            duplicate = false;
                                            json.TypesOnUnit.Detail.Type[t].dep_id = [dep_id];
                                            json.TypesOnUnit.Detail.Type[t].unit_id = [unit_id];
                                            json.TypesOnUnit.Detail.Type[t].type_id = [json.TypesOnUnit.Detail.Type[t].type_id];
                                            json.TypesOnUnit.Detail.Type[t].location_id = [$rootScope.newAppointment.units[unitTypesRequested].Detail.Dep[depTypeRequested].location_id];
                                            for (var u = 0; u < $scope.typeList.length; u++) {
                                                if (json.TypesOnUnit.Detail.Type[t].type_title === $scope.typeList[u].type_title) {
                                                    duplicate = true;
                                                    if (!combinationExists($scope.typeList, json.TypesOnUnit.Detail.Type[t])) {
                                                        $scope.typeList[u].dep_id.push(json.TypesOnUnit.Detail.Type[t].dep_id[0]);
                                                        $scope.typeList[u].unit_id.push(json.TypesOnUnit.Detail.Type[t].unit_id[0]);
                                                        $scope.typeList[u].type_id.push(json.TypesOnUnit.Detail.Type[t].type_id[0]);
                                                        $scope.typeList[u].location_id.push(json.TypesOnUnit.Detail.Type[t].location_id[0]);
                                                    }
                                                    break;
                                                }
                                            }
                                            if (!duplicate) {
                                                $scope.typeList.push(json.TypesOnUnit.Detail.Type[t]);
                                            }
                                        }
                                    }

                                    depTypeRequested++;
                                    if (depTypeRequested == $rootScope.newAppointment.units[unitTypesRequested].Detail.Dep.length) {
                                        depTypeRequested = 0;
                                        unitTypesRequested++;
                                    }
                                    if (unitTypesRequested != $rootScope.newAppointment.units.length) {
                                        getTypes();
                                    } else {
                                        $scope.typesLoaded = true;
                                        $scope.rememberType();
                                        console.log($scope.typeList);
                                    }
                                } else {
                                    error("statuscode not 1");
                                }
                            }, error);
                }
            }

            /*
             * If the patient came back to step 2 from step 3 the type is remembered
             */
            function rememberType() {
                if ($rootScope.newAppointment.type) {
//                    console.log($rootScope.newAppointment.type);
//                    $scope.type = $rootScope.newAppointment.type;
                    for (var i = 0; i < $scope.typeList.length; i++) {
                        if ($scope.typeList[i].type_title === $rootScope.newAppointment.type.type_title) {
                            $scope.type = $scope.typeList[i];
                            $scope.updateFormData();
                        }
                    }
                }
            }

            /**
             * Function used to help with form validation
             * Checks if there is at least one location selected
             * @returns {Boolean}
             */
            $scope.locationIsChecked = function() {
                for (var i = 0; i < $scope.locations.length; i++) {
                    if ($scope.locations[i].checked)
                        return true;
                }
                return false;
            };

            /**
             * checks if the combination of the new type's unit_id, dep_id and type_id already exists in the given type list
             * 
             * @param {type} typeList
             * @param {type} new_type
             * @returns {Boolean}
             */
            function combinationExists(typeList, new_type) {
                for (var i = 0; i < typeList.length; i++) {
                    for (var j = 0; j < typeList[i].unit_id.length; j++) {
                        if (typeList[i].unit_id[j] === new_type.unit_id[0] &&
                                typeList[i].dep_id[j] === new_type.dep_id[0] &&
                                typeList[i].type_id[j] === new_type.type_id[0] &&
                                typeList[i].location_id[j] === new_type.location_id[0]) {
                            return true;
                        }
                    }
                }
                return false;
            }

            /**
             * is called when a new type has been selected
             * 
             * disables and unchecks the locations that aren't linked to the selected type
             * and enables and checks the locations that are
             * 
             * if there is extra info on the department that the selected type is linked to it is displayed in the extra info field
             */
            $scope.updateFormData = function() {
                $("#extraInfo").empty();
                for (var i = 0; i < $scope.locations.length; i++) {
                    if ($scope.type && $scope.type.location_id.indexOf($scope.locations[i].location_id) == -1) {
//                        console.log($scope.type.location_id + " does not contain " + $scope.locations[i].location_id);
//                        console.log($scope.locations[i].location_name + " is disabled");
                        $scope.locations[i].disabled = true;
                        $scope.locations[i].checked = false;
                    } else {
//                        console.log($scope.type.location_id + " contains " + $scope.locations[i].location_id);
//                        console.log($scope.locations[i].location_name + " is selected");
                        $scope.locations[i].disabled = false;
                        $scope.locations[i].checked = true;
                    }
                }

                if ($scope.type) {
                    for (var j = 0; j < $scope.newAppointment.units.length; j++) {
                        for (var h = 0; h < $scope.newAppointment.units[j].Detail.Dep.length; h++) {
                            var dep = $scope.newAppointment.units[j].Detail.Dep[h];
                            for (var k = 0; k < $scope.type.dep_id.length; k++) {
                                if (dep.dep_id == $scope.type.dep_id[k] && dep.msg_extern_step2) {
                                    $("#extraInfo").append("<a style=\"color: red;\"><b>" + dep.location_name + ":</b></a> " + dep.msg_extern_step2 + "<br>");
                                }
                            }
                        }
                    }
                }

                if ($scope.type.public_msg)
                    $("#extraInfo").append("<a style=\"color: red;\"><b>" + $scope.type.type_title + ":</b></a> " + $scope.type.public_msg);
            };

            /**
             * Function that is called when the request to the server fails for error handling
             * 
             * @param {type} data
             * @returns {undefined}
             */
            function error(data) {
                if (!$rootScope.isOffline) {
                    alert($rootScope.getLocalizedString("appointmentsViewPatientNoConnectionCreateAppointment"));
                    $rootScope.isOffline = true;
                    switch ($rootScope.type) {
                        case 0:
                        case 1:
                            $location.path('/doctor/appointmentsView');
                            break;
                        case 2:
                        case 3:
                            $location.path('/patient/mainmenu');
                            break;
                    }
                }
                console.log(data);
                $scope.error = true;
            }

            /**
             * The properties 'type', 'locations' and 'reservationInfo' of the variable $rootScope.newAppointment are set
             * the user is redirected to the next step
             * 
             * a request to get the questions from is also set in 'questionPromise' and will be handled in step 5
             * 
             * @returns {undefined}
             */
            $scope.next = function(formValid) {
                $("#loadingStep3Spinner").removeClass("hiddenBlock");
                $scope.loadingStep3 = true;
                if (formValid && $scope.locationIsChecked()) {
                    $rootScope.newAppointment.type = $scope.type;
                    $rootScope.newAppointment.locations = [];
                    for (var i = 0; i < $scope.locations.length; i++) {
                        if ($scope.locations[i].checked)
                            $rootScope.newAppointment.locations.push($scope.locations[i]);
                    }
                    $rootScope.newAppointment.reservationInfo = $scope.reservationInfo;
                    $rootScope.pageClass = 'right-to-left';
                    $location.path('/patient/step3');
                } else {
                    $scope.loadingStep3 = false;
                    $("#loadingStep3Spinner").addClass("hiddenBlock");
                    $scope.displayError = true;
                }
            };

            changeSelect();
        }).
        controller("CreateAppointmentStep3Ctrl", function($rootScope, $scope, $q, $location, hospiviewFactory) {

            console.log($rootScope.currentServers[$rootScope.newAppointment.server]);
            console.log($rootScope.newAppointment);

            /**
             * Initiation of variables.
             */
            var globalTypes;
            $scope.startProposalDate = new Date();
            $scope.today = new Date();
            $scope.unitList = [];
            $scope.loadingStep4 = false;

            console.log($rootScope.newAppointment.units);
            for (var i = 0; i < $rootScope.newAppointment.units.length; i++) {
                for (var j = 0; j < $rootScope.newAppointment.units[i].Detail.Dep.length; j++) {
                    var duplicate = false;
                    if ($rootScope.newAppointment.type.dep_id.indexOf($rootScope.newAppointment.units[i].Detail.Dep[j].dep_id) != -1) {
                        for (var k = 0; k < $scope.unitList.length; k++) {
                            if ($scope.unitList[k].Header.unit_id === $rootScope.newAppointment.units[i].Header.unit_id)
                                duplicate = true;
                        }
                        if (!duplicate) {
                            var unit = {
                                Header: {unit_name: $rootScope.newAppointment.units[i].Header.unit_name,
                                    unit_id: $rootScope.newAppointment.units[i].Header.unit_id},
                                checked: true
                            };
                            $scope.unitList.push(unit);
                        }
                        break;
                    }
                }
            }

            /**
             * listens for changes in the startProposalDate model. It is changed
             * if the user selects another start date on the calendar.
             */
            $scope.$watch('startProposalDate',
                    function() {
                        $("#step3LoadingSpinner").removeClass("hiddenBlock");
                        releaseProposals();
                        $scope.proposals = [];
                        $scope.proposalInfo = '';
                        $scope.showCalendar = false;
                        $scope.getProposals();
                    }, true);

            /**
             * Function to request proposals. First checks if a startDate is passed.
             * If not, today's date is used. For each type, meaning each unit doing 
             * this excepting this kind of reservation, we retrieve the proposals.
             * If all proposals are retrieved, the scope is set.
             * 
             * @param {date} startDate      start date from which proposal need to be searched
             */
            $scope.getProposals = function(startDate) {
                var searchDate;
                var retrievedRequests = [];
                var retrievedProposals = [];
                if (startDate) {
                    searchDate = formatDate(startDate);
                } else {
                    searchDate = formatDate($scope.startProposalDate);
                }
                for (var i = 0; i < $rootScope.newAppointment.type.unit_id.length; i++) {
                    for (var j = 0; j < $rootScope.newAppointment.units.length; j++) {
                        if ($rootScope.newAppointment.type.unit_id[i] == $rootScope.newAppointment.units[j].Header.unit_id) {
                            globalTypes = $rootScope.newAppointment.units[j].Header.globaltypes;
                        }
                    }
                    console.log("request");
                    console.log($rootScope.newAppointment.type.unit_id[i] + " "
                            + $rootScope.newAppointment.type.dep_id[i] + " "
                            + $rootScope.newAppointment.type.type_id[i]);

                    if (!$rootScope.newAppointment.reservationInfo)
                        $rootScope.newAppointment.reservationInfo = '';

                    retrievedRequests.push(hospiviewFactory.getProposals(
                            $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url,
                            $rootScope.currentServers[$rootScope.newAppointment.server].uuid,
                            $rootScope.newAppointment.type.unit_id[i],
                            $rootScope.newAppointment.type.dep_id[i],
                            $rootScope.newAppointment.type.type_id[i],
                            $rootScope.newAppointment.type.type_title,
                            $rootScope.newAppointment.reservationInfo,
                            globalTypes,
                            searchDate,
                            "00:00",
                            "1,2,3,4,5,6,7",
                            0,
                            $rootScope.languageID));
                     console.log(retrievedRequests);
                }

                $q.all(retrievedRequests).then(function(requests) {
                    for (var requestCount in requests) {
                        var json = parseJson(requests[requestCount]);
                        console.log(json);
                        if (json.Proposals.Header.StatusCode != 1) {
                            error("statuscode not 1");
                        }
                        for (var proposalCount in json.Proposals.Detail.Proposal) {
                            json.Proposals.Detail.Proposal[proposalCount].type_id = $rootScope.newAppointment.type.type_id[requestCount];
                            retrievedProposals.push(json.Proposals.Detail.Proposal[proposalCount]);
                        }
                    }
                    console.log(retrievedProposals);
                    editProposalInfo(retrievedProposals);
                    $("#step3LoadingSpinner").addClass("hiddenBlock");
                }, error);
            };

            function error(data) {
                if (!$rootScope.isOffline) {
                    alert($rootScope.getLocalizedString("appointmentsViewPatientNoConnectionCreateAppointment"));
                    $rootScope.isOffline = true;
                    switch ($rootScope.type) {
                        case 0:
                        case 1:
                            $location.path('/doctor/appointmentsView');
                            break;
                        case 2:
                        case 3:
                            $location.path('/patient/mainmenu');
                            break;
                    }
                }
                console.log(data);
                $scope.error = true;
            }

            /**
             * Initiation of variables needed.
             */
            var setDayNumber;
            var setRespectiveDayNumber;
            $scope.proposals = [];

            /**
             * For each proposal we retrieved, we add following information:
             * 
             * We add the day of the proposal (as integer). We use this to set an
             * integer that represents the order of the days. This we do by comparing
             * it to the baseDayNumber.
             * We add if boolean afternoon so the user can use the afternoon/morning filter.
             * We add the unit name of the proposal.
             * We add the location name of the proposal.
             * 
             * We push the edited proposal into the scope. We also check the day of the proposal,
             * so we can activate the filter on that day.
             * 
             * @param proposals
             */
            function editProposalInfo(proposals) {
                $scope.filters = {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, morning: true, afternoon: true, unitList: $scope.unitList, locations: $rootScope.newAppointment.locations};

                /**
                 * Sorts the retrieved proposals by date.
                 */
                proposals.sort(function(a, b) {
                    return new Date(a.the_date) - new Date(b.the_date);
                });

                /**
                 * Sets a reference to the day of the first proposal. This is used
                 * to group the proposals by day. (e.g. all fridays are put together etc.)
                 */
                var baseDayNumber = new Date(proposals[0].the_date).getDay();

                for (var proposal in proposals) {
                    setDayNumber = new Date(proposals[proposal].the_date).getDay();
                    proposals[proposal].setDayNumber = setDayNumber;

                    if (setDayNumber >= baseDayNumber)
                        setRespectiveDayNumber = setDayNumber - baseDayNumber;
                    else
                        setRespectiveDayNumber = setDayNumber + baseDayNumber - 1;
                    proposals[proposal].setRespectiveDayNumber = setRespectiveDayNumber;

                    if (parseInt(proposals[proposal].time_from.substring(0, 2)) < 12)
                        proposals[proposal].afternoon = false;
                    else
                        proposals[proposal].afternoon = true;
                    proposals[proposal].morning = !proposals[proposal].afternoon;

                    for (var p = 0; p < $rootScope.newAppointment.units.length; p++) {
                        if ($rootScope.newAppointment.units[p].Header.unit_id === proposals[proposal].unit_id) {
                            proposals[proposal].unit_name = $rootScope.newAppointment.units[p].Header.unit_name;
                            /*for (var d = 0; d < $rootScope.newAppointment.units[p].Detail.Dep.length; d++) {
                             if (proposals[proposal].depid === $rootScope.newAppointment.units[p].Detail.Dep[d].dep_id) {
                             proposals[proposal].location = $rootScope.newAppointment.units[p].Detail.Dep[d].location_name;
                             }
                             }*/
                        }
                    }

                    $scope.proposals.push(proposals[proposal]);
                    $scope.filters[new Date(proposals[proposal].the_date).getDay()] = true;
                }
            }
            /**
             * Triggered for every proposal in the list. Gets the day of the proposal.
             * 
             * @param {object} proposal proposal
             * @returns {string}        day of the proposal
             */
            $scope.getDay = function(proposal) {
                var date = new Date(proposal.the_date);
                return $scope.days[date.getDay()];
            };

            /**
             * 
             * @param {type} proposal   proposal
             * @returns {string}        
             *
             $scope.getTime = function(proposal) {
             if (parseInt(proposal.time_from.substring(0, 2)) < 12)
             return $rootScope.getLocalizedString('createAppointmentStep3Morning');
             else
             return $rootScope.getLocalizedString('createAppointmentStep3Afternoon');
             };*/

            /**
             * Triggered for every proposal in the list. Creates a string to display
             * the date.
             * 
             * @param {object} proposal     proposal
             * @returns {string}            the date as string
             */
            $scope.getDate = function(proposal) {
                var date = new Date(proposal.the_date);
                var year = date.getFullYear() + "";
                return date.getDate() + "/" + (date.getMonth() + 1) + "/" + year.substring(2, 4);
            };

            /**
             * Triggered when the user selects a proposal. Uses the information
             * of the proposal to create a string to show the user the proposal
             * he/she choose.
             * 
             * @param {object} proposal   the proposal the user selected
             */
            $scope.selectProposal = function(proposal) {
                console.log(proposal);
                $scope.selectedProposal = proposal;
                var date = new Date(proposal.the_date);
                var months = getMonthNames($rootScope.languageID);
                $scope.proposalInfo = $scope.days[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + ", " + proposal.time_from + "\n" + proposal.unit_name;
            };

            /**
             * Detects the screen size and adjust the day names. If the screen
             * is smaller than 768 px, the short names will be used.
             */
            var width = window.innerWidth;

            width = window.innerWidth;
            if (width <= 400) {
                $scope.days = getDayNamesShort($rootScope.languageID);
                $rootScope.shortName = 'Short';
            }
            else {
                $scope.days = getDayNames($rootScope.languageID);
                $rootScope.shortName = '';
            }

            /**
             * Saves the proposal the user selected in this step to the rootScope.
             * Redirects the user to the next step.
             * 
             * @param {type} proposal   selected proposal
             */
            $scope.next = function() {
                $scope.loadingStep4 = true;
                $rootScope.newAppointment.proposal = $scope.selectedProposal;
                $rootScope.pageClass = 'right-to-left';

                console.log($rootScope.newAppointment.type);
                releaseProposals($scope.selectedProposal.depid);
                //Release all proposals for testing
                //               releaseProposals();

                $location.path('/patient/step4');
                /** 
                 * 15.05.2014 11:07  
                 * $rootScope.newAppointment.proposal.type_id is not set yet at this point in time.
                 * Should be set in step 2.
                 * */
//                var questions = [];
//
//                console.log($rootScope.currentServers);
//                console.log($rootScope.currentServers[$rootScope.newAppointment.server]);
//                questions.push(hospiviewFactory.getActiveFieldsOnUnit($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));
//                questions.push(hospiviewFactory.getQuestionsOnUnit($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $rootScope.newAppointment.proposal.type_id, $rootScope.languageID, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));
//                console.log($rootScope.type);
//                if ($rootScope.type == 2)
//                    questions.push(hospiviewFactory.getPatientLookup($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $rootScope.currentServers[$rootScope.newAppointment.server].reg_no, $rootScope.languageID, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));
//
//                $q.all(questions).then(function(responses) {
//                    $rootScope.questions = responses;
//                    $location.path('/patient/step4');
//                }, error);
            };

            /**
             * releases all the proposals that have been requested so that other users can request them
             * if a department id is given all the proposals from that department are still locked
             * 
             * @param {type} dep_id
             */
            function releaseProposals(dep_id) {
                for (var i = 0; i < $rootScope.newAppointment.type.type_id.length; i++) {
                    if (dep_id) {
                        console.log($scope.selectedProposal.depid);
                        if ($scope.selectedProposal.depid == $rootScope.newAppointment.type.dep_id[i]) {
                            continue;
                        }
                    }

                    console.log("remove: " + $rootScope.newAppointment.type.dep_id[i]);
                    hospiviewFactory.getProposalsRemoved(
                            $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url,
                            $rootScope.currentServers[$rootScope.newAppointment.server].uuid,
                            $rootScope.newAppointment.type.unit_id[i],
                            $rootScope.newAppointment.type.dep_id[i]);

                }
            }

            $scope.back = function() {
                releaseProposals();
                $rootScope.pageClass = "left-to-right";
                history.back();
            };
        }).
        controller("CreateAppointmentStep4Ctrl", function($rootScope, $scope, $location, hospiviewFactory, $q, $compile) {

            console.log($rootScope.newAppointment);

            $scope.showInvalidFields = false;

            $scope.setRadioButtonScope = function(model, value, extra) {
                if (!extra)
                    $scope.newAppointment.patientInfo[model] = value;
                if (extra)
                    $scope.PostAnswers.PostAnswers.Detail.Answers.Answer[model].answer_value = value;
            };
            
            $rootScope.newAppointment.patientInfo = {};

            $rootScope.newAppointment.patientInfo.lastname = '';
            $rootScope.newAppointment.patientInfo.firstname = '';
            $rootScope.newAppointment.patientInfo.dateOfBirth = '';
            $rootScope.newAppointment.patientInfo.gender = '0';
            $rootScope.newAppointment.patientInfo.phone = '';
            $rootScope.newAppointment.patientInfo.phone2 = '';
            $rootScope.newAppointment.patientInfo.streetAndNumber = '';
            $rootScope.newAppointment.patientInfo.postalCode = '';
            $rootScope.newAppointment.patientInfo.town = '';
            $rootScope.newAppointment.patientInfo.country = '';
            if ($rootScope.type == 2)
                $scope.nationalRegister = $rootScope.currentServers[0].reg_no;
            $rootScope.newAppointment.patientInfo.email = '';
            $rootScope.newAppointment.patientInfo.extraInformation = '';
            $rootScope.newAppointment.patientInfo.unique_pid = '-1';
            $rootScope.newAppointment.patientInfo.doctor = '';
            $rootScope.newAppointment.patientInfo.unique_gpid = '-1';
            $rootScope.newAppointment.patientInfo.referringDoctor = '';
            $rootScope.newAppointment.patientInfo.referringDoctor_gpid = '';

            $scope.doPatientLookup = function(){
                hospiviewFactory.getPatientLookup($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $scope.nationalRegister, $rootScope.languageID, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url)
                        .then(function(response){
                            var answersJson = parseJson(response.data);
                            console.log(answersJson);
                                if (answersJson.PatientLookup.Header.StatusCode == 1) {
                                    if (answersJson.PatientLookup.Detail) {
                                        alert('setting fields');
                                        $rootScope.newAppointment.patientInfo.lastname = answersJson.PatientLookup.Detail.pName;
                                        $rootScope.newAppointment.patientInfo.firstname = answersJson.PatientLookup.Detail.pFirstName;
                                        $scope.dateOfBirth = answersJson.PatientLookup.Detail.pBDate;
                                        $rootScope.newAppointment.patientInfo.gender = answersJson.PatientLookup.Detail.pGender;
                                        $rootScope.newAppointment.patientInfo.phone = answersJson.PatientLookup.Detail.pTel1;
                                        $rootScope.newAppointment.patientInfo.phone2 = answersJson.PatientLookup.Detail.pTel2;
                                        var address = answersJson.PatientLookup.Detail.pAddress.split("^");
                                        $rootScope.newAppointment.patientInfo.streetAndNumber = address[0];
                                        $rootScope.newAppointment.patientInfo.postalCode = address[4];
                                        $rootScope.newAppointment.patientInfo.town = address[2];
                                        $rootScope.newAppointment.patientInfo.country = address[5];
                                        $scope.nationalRegister = answersJson.PatientLookup.Detail.pReg_No;
                                        $rootScope.newAppointment.patientInfo.email = answersJson.PatientLookup.Detail.pEmail;
                                        $rootScope.newAppointment.patientInfo.extraInformation = answersJson.PatientLookup.Detail.pMemo;
                                        $rootScope.newAppointment.patientInfo.unique_pid = answersJson.PatientLookup.Detail.pUnique_pid;
                                        $rootScope.newAppointment.patientInfo.doctor = answersJson.PatientLookup.Detail.pDoctor;
                                        $rootScope.newAppointment.patientInfo.unique_gpid = answersJson.PatientLookup.Detail.pUnique_GPID;
                                        $rootScope.newAppointment.patientInfo.referringDoctor = '';
                                        $rootScope.newAppointment.patientInfo.referringDoctor_gpid = '';
                                        }
                                    } else {
                                        error("statuscode not 1");
                                    }
                }, error);
            };
            
//            var standardQuestionsJson = parseJson($rootScope.questions[0].data);
//            var extraQuestionsJson = parseJson($rootScope.questions[1].data);
//            if ($rootScope.type == 2)
//                var answersJson = parseJson($rootScope.questions[2].data);

            
//            if (!standardQuestionsJson.ActiveFieldsOnUnit.Detail && !extraQuestionsJson.QuestionsOnUnit.Detail)
//                $scope.next(true);



//            console.log(standardQuestionsJson.ActiveFieldsOnUnit);
//            console.log(extraQuestionsJson.QuestionsOnUnit);
            var standardQuestionsJson,
                extraQuestionsJson;
            var radioButtonValueCheck = [];
            function setQuestions() {
                var questions = [];
                questions.push(hospiviewFactory.getActiveFieldsOnUnit($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));
                questions.push(hospiviewFactory.getQuestionsOnUnit($rootScope.currentServers[$rootScope.newAppointment.server].uuid, $rootScope.newAppointment.proposal.unit_id, $rootScope.newAppointment.proposal.type_id, $rootScope.languageID, $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));
                
                $q.all(questions).then(function(responses){
                    standardQuestionsJson = parseJson(responses[0].data);
                    extraQuestionsJson = parseJson(responses[1].data);
                    
                    console.log(standardQuestionsJson);
                    
                    var appendString = '<table ng-form="subform" class="appointmentFormTable" id="questionTable">';

                    if (standardQuestionsJson.ActiveFieldsOnUnit.Header.StatusCode == 1 && standardQuestionsJson.ActiveFieldsOnUnit.Detail) {
                        var activeFieldsArray = standardQuestionsJson.ActiveFieldsOnUnit.Detail.ActiveFields.split(",");
                        console.log(activeFieldsArray);
                        var mustField;

                        if (activeFieldsArray.indexOf("26") !== -1) {
                            mustField = checkMustField("26");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('reg_no') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="reg_no" class="form-control" ng-model="nationalRegister" ' + mustField[1] + ' ' + disableRegno + ' checknational/>';
                            
                            appendString += lookupButton;
                            
                            if (mustField[1] === 'required')
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.reg_no.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';

                            appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.reg_no.$error.checknational">'
                                    + $rootScope.getLocalizedString('newUserNatRegIncorrect') + '</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("1") !== -1) {
                            mustField = checkMustField("1");
                            appendString = appendString
                                    + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4FirstName') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="firstname" class="form-control" ng-model="newAppointment.patientInfo.firstname" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required')
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.firstname.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';

                            appendString = appendString
                                    + '</td></tr><tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4LastName') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="lastname" class="form-control" ng-model="newAppointment.patientInfo.lastname" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required')
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.lastname.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("3") !== -1) {
                            mustField = checkMustField("3");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('newUserDateOfBirth') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="dateOfBirth" class="form-control" ng-model="dateOfBirth" placeholder="dd-mm-yyyy" ng-pattern=' + "'/^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[012])-(19[0-9]{2})|(20[0-9]{2})$/'" + ' ' + mustField[1]
                                    + '/>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.dateOfBirth.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '<div class="alert alert-danger" ng-show="subform.dateOfBirth.$dirty && subform.dateOfBirth.$error.pattern">'
                                    + $rootScope.getLocalizedString('newUserDateIncorrect') + ' dd-mm-yyyy</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("2") !== -1) {
                            mustField = checkMustField("2");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Phone') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="phone" class="form-control" ng-model="newAppointment.patientInfo.phone" ng-pattern=' + "'/^[0-9]*$/'" + ' ' + mustField[1] + '/>';
                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.phone.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '<div class="alert alert-danger" ng-show="subform.phone.$dirty && subform.phone.$error.pattern">'
                                    + $rootScope.getLocalizedString('mustBeNumber') + '</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("9") !== -1) {
                            mustField = checkMustField("9");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Phone2') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="phone2" class="form-control" ng-model="newAppointment.patientInfo.phone2" ng-pattern=' + "'/^[0-9]*$/'" + ' ' + mustField[1] + '/>';
                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.phone2.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '<div class="alert alert-danger" ng-show="subform.phone2.$dirty && subform.phone2.$error.pattern">'
                                    + $rootScope.getLocalizedString('mustBeNumber') + '</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("14") !== -1) {
                            mustField = checkMustField("14");

                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('newUserEmail') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="email" name="email" class="form-control" ng-model="newAppointment.patientInfo.email" ' + mustField[1] + '/>';
                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.email.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '<div class="alert alert-danger" ng-show="subform.email.$dirty && subform.email.$error.email">'
                                    + $rootScope.getLocalizedString('newUserEmailIncorrect') + '</div>';

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("8") !== -1) {
                            mustField = checkMustField("8");
                            if ($rootScope.shortName === 'Short') {
                                var genderTextM = "M";
                                var genderTextF = "F";
                                var genderTextU = $rootScope.getLocalizedString("createAppointmentStep4GenderNotDetermined");
                            } else {
                                var genderTextM = $rootScope.getLocalizedString("createAppointmentStep4Male");
                                var genderTextF = $rootScope.getLocalizedString("createAppointmentStep4Female");
                                var genderTextU = $rootScope.getLocalizedString("createAppointmentNotDetermined");
                            }
                            var activeClassM = '';
                            var activeClassF = '';
                            var activeClassU = '';
                            if ($rootScope.newAppointment.patientInfo.gender === "1")
                                activeClassM = 'active';
                            else
                            if ($rootScope.newAppointment.patientInfo.gender === "2")
                                activeClassF = 'active';
                            else
                                activeClassU = 'active';

                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Gendre') + mustField[0] + '</b></p>'
                                    + '</td><td><div class="btn-group showCompleteFloat widthPercent" data-toggle="buttons">'
                                    + '<label class="btn btn-default width30Percent ' + activeClassM + '" ng-click="setRadioButtonScope(' + "'gender','male',false" + ')" ><input type="radio" name="gender" ng-model="newAppointment.patientInfo.gender" value="' + $rootScope.getLocalizedString('createAppointmentStep4Male') + '"/>' + genderTextM + '</label>'
                                    + '<label class="btn btn-default width30Percent ' + activeClassF + '" ng-click="setRadioButtonScope(' + "'gender','female',false" + ')" ><input type="radio" name="gender" ng-model="newAppointment.patientInfo.gender" value="' + $rootScope.getLocalizedString('createAppointmentStep4Female') + '"/>' + genderTextF + '</label>'
                                    + '<label class="btn btn-default width30Percent ' + activeClassU + '" ng-click="setRadioButtonScope(' + "'gender','undefined',false" + ')" ><input type="radio" name="gender" ng-model="newAppointment.patientInfo.gender" value="' + $rootScope.getLocalizedString('createAppointmentNotDetermined') + '"/>' + genderTextU + '</label>'
                                    + '</div>';

                            if (mustField[1] === "required")
                                radioButtonValueCheck.push("gender");

                            appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && (!newAppointment.patientInfo.gender || newAppointment.patientInfo.gender == ' + "''" + ')">'
                                    + $rootScope.getLocalizedString('isRequired') + '</div></td></tr>';
                        }
                        if (activeFieldsArray.indexOf("11") !== -1) {
                            mustField = checkMustField("11");

                            appendString = appendString
                                    + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Street') + ' & ' + $rootScope.getLocalizedString('createAppointmentStep4HouseNumber') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="streetAndNumber" class="form-control" ng-model="newAppointment.patientInfo.streetAndNumber" ' + mustField[1] + '/>';
                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.streetAndNumber.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }

                            appendString = appendString + '</td></tr>'
                                    + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4PostalCode') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="postalCode" class="form-control" ng-model="newAppointment.patientInfo.postalCode" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.postalCode.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '</td></tr>'
                                    + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Town') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="town" class="form-control" ng-model="newAppointment.patientInfo.town" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.town.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '</td></tr>'
                                    + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Country') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="country" class="form-control" ng-model="newAppointment.patientInfo.country" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.country.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("25") !== -1) {
                            mustField = checkMustField("25");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4Referring') + mustField[0] + '</b></p>'
                                    + '</td><td><input type="text" name="referringDoctor" class="form-control" ng-model="newAppointment.patientInfo.referringDoctor" ' + mustField[1] + '/>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.referringDoctor.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }

                            appendString = appendString + '</td></tr>';
                        }
                        if (activeFieldsArray.indexOf("10") !== -1) {
                            mustField = checkMustField("10");
                            appendString = appendString + '<tr><td><p class="formLabel"><b>' + $rootScope.getLocalizedString('createAppointmentStep4ExtraInformation') + mustField[0] + '</b></p>'
                                    + '</td><td><textarea style="resize: none;" name="extraInformation" class="form-control" rows="3" ng-model="newAppointment.patientInfo.extraInformation" ' + mustField[1] + '></textarea>';

                            if (mustField[1] === 'required') {
                                appendString = appendString + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.extraInformation.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }

                            appendString = appendString + '</td></tr>';
                        }
                    } else {
                        error("statuscode not 1");
                    }

                    if (extraQuestionsJson.QuestionsOnUnit.Header.StatusCode == 1 && extraQuestionsJson.QuestionsOnUnit.Detail) {

                        var inputType;
                        var extraQuestionsModelArray = [];
                        var extraQuestionType;
                        $scope.PostAnswers = {PostAnswers: {Header: {Reservation_Id: "", Unit_Id: ""}, Detail: {Answers: {Answer: []}}}};
                        for (var question in extraQuestionsJson.QuestionsOnUnit.Detail.Question) {
                            $scope.PostAnswers.PostAnswers.Detail.Answers.Answer.push({question_id: "", answer_value: ""});
                            console.log($scope.PostAnswers);
                            if (extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_type == 1) {
                                extraQuestionType = 'select' + question;
                                inputType = '<select name="' + extraQuestionType + '" class="form-control" ng-model="PostAnswers.PostAnswers.Detail.Answers.Answer[' + question + '].answer_value" required>' +
                                        '<option value=""> - ' + $rootScope.getLocalizedString('createAppointmentStep4MakeYourChoice') + ' - </option>';
                                for (var choice in extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue)
                                    inputType = inputType + '<option value="' + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value_id + '">' + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value + '</option>';
                                inputType = inputType + '</select>';

                                inputType = inputType + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.' + extraQuestionType + '.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            if (extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_type == 2) {

                                extraQuestionType = 'radio' + question;
                                if (angular.isDefined(extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].default_value))
                                    $scope.PostAnswers.PostAnswers.Detail.Answers.Answer[question].answer_value = extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].default_value;

                                inputType = '<div class="btn-group showCompleteFloat widthPercent" data-toggle="buttons">';
                                for (var choice in extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue) {
                                    var buttonId = "" + extraQuestionType + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value_id;
                                    var activeClass;
                                    if (angular.isDefined(extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].default_value))
                                        if (extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].default_value === extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value_id)
                                            activeClass = 'active';
                                        else
                                            activeClass = '';
                                    inputType = inputType + '<label class="btn btn-default width50Percent ' + activeClass + '" id="' + buttonId
                                            + '" ng-click="setRadioButtonScope(' + "'" + question + "','" + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value_id + "',true" + ')"><input name="'
                                            + extraQuestionType + '"type="radio" ng-model="PostAnswers.PostAnswers.Detail.Answers.Answer['
                                            + question + '].answer_value" name="' + extraQuestionType
                                            + '" value="'
                                            + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value_id
                                            + '">'
                                            + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].PossibleValues.PossibleValue[choice].answer_value
                                            + '</label>';
                                }
                                radioButtonValueCheck.push(question);
                                inputType = inputType + '</div>';

                                inputType = inputType + '<div class="alert alert-danger" ng-show="showInvalidFields && (!PostAnswers.PostAnswers.Detail.Answers.Answer[' + question + '].answer_value || PostAnswers.PostAnswers.Detail.Answers.Answer[' + question + '].answer_value == -1)">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }
                            if (extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_type == 3) {
                                extraQuestionType = 'input' + question;
                                inputType = '<input name="' + extraQuestionType + '" type="text" class="form-control" ng-model="PostAnswers.PostAnswers.Detail.Answers.Answer[' + question + '].answer_value" required/>';

                                inputType = inputType + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.' + extraQuestionType + '.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }

                            if (extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_type == 4) {
                                extraQuestionType = 'textarea' + question;
                                inputType = '<textarea name="' + extraQuestionType + '" style="resize: none;" class="form-control" rows="3" ng-model="PostAnswers.PostAnswers.Detail.Answers.Answer[' + question + '].answer_value" required></textarea>';

                                inputType = inputType + '<div class="alert alert-danger" ng-show="showInvalidFields && subform.' + extraQuestionType + '.$error.required">'
                                        + $rootScope.getLocalizedString('isRequired') + '</div>';
                            }

                            extraQuestionsModelArray.push(extraQuestionType);

                            appendString = appendString + '<tr><td><p class="formLabel"><b>'
                                    + extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_title
                                    + '*</b></p></td><td>' + inputType + '</td></tr>';

                            $scope.PostAnswers.PostAnswers.Detail.Answers.Answer[question].question_id = extraQuestionsJson.QuestionsOnUnit.Detail.Question[question].question_id;

                        }

                    }

                    appendString = appendString + '</table><p class="formLabel">' + $rootScope.getLocalizedString('createAppointmentStep4FieldsRequired') + '</p>'
                            + '<div class="text-center">'
                            + '<button type="submit" class="btn btn-xl" ng-click="next(subform.$valid)" ' + '">'
                            + $rootScope.getLocalizedString('createAppointmentNext') + '</button></div>';

                    var compiledHtml = $(appendString).appendTo("#step4Form");
                    $compile(compiledHtml)($scope);
                }, error);
            }
            
            var disableRegno = "disabled",
                lookupButton = "";
            if ($rootScope.type === 3 || $rootScope.type === 0 || $rootScope.type === 1){
                disableRegno = "";
                lookupButton = "<button class=\"btn btn-default\" ng-click=\"doPatientLookup()\"><span class=\"glyphicon glyphicon-search\"></span></button>";
            }else if($rootScope.type === 2){
                $scope.doPatientLookup();
            }
                
            setQuestions();
            

            function checkMustField(number) {
//                var standardQuestionsJson = parseJson($rootScope.questions[0].data);
                var mustFieldsArray = standardQuestionsJson.ActiveFieldsOnUnit.Detail.MustFields.split(",");

                if (mustFieldsArray.indexOf(number) !== -1)
                    return ["*", 'required'];
                else
                    return ["", ""];
            }

            /**
             * The properties 'firstname', 'lastname', 'phone', 'email' and 'dateOfBirth' are set
             * the user is redirected to the next step
             * @param   {boolean}   formValid   to make sure this function will only execute 
             *                                  when the form is valid.
             * @returns {undefined}
             */
            $scope.next = function(formValid) {
                var radioButtonBooleanChecks = true;
                for (var i in radioButtonValueCheck) {
                    if (radioButtonValueCheck[i] === "gender") {
                        if ($scope.newAppointment.patientInfo["gender"] == -1 || $scope.newAppointment.patientInfo["gender"] == "" || !$scope.newAppointment.patientInfo["gender"])
                            radioButtonBooleanChecks = false;
                    } else {

                        if ($scope.PostAnswers.PostAnswers.Detail.Answers.Answer[radioButtonValueCheck[i]].answer_value == -1 || $scope.PostAnswers.PostAnswers.Detail.Answers.Answer[radioButtonValueCheck[i]].answer_value == "" || !$scope.PostAnswers.PostAnswers.Detail.Answers.Answer[radioButtonValueCheck[i]].answer_value)
                            radioButtonBooleanChecks = false;
                    }
                }


                if (formValid && radioButtonBooleanChecks) {
                    var confirmed = [];
                    $rootScope.newAppointment.patientInfo.reg_no = $scope.nationalRegister;
                    $rootScope.newAppointment.patientInfo.dateOfBirth = $scope.dateOfBirth;
                    confirmed.push(hospiviewFactory.getAppointmentConfirmed(
                            $rootScope.currentServers[$rootScope.newAppointment.server].uuid,
                            $rootScope.newAppointment.proposal.proposal_id,
                            $rootScope.newAppointment.patientInfo.lastname,
                            $rootScope.newAppointment.patientInfo.firstname,
                            $rootScope.newAppointment.patientInfo.dateOfBirth,
                            $rootScope.newAppointment.patientInfo.gender,
                            $rootScope.newAppointment.patientInfo.phone,
                            $rootScope.newAppointment.patientInfo.phone2,
                            $rootScope.newAppointment.patientInfo.streetAndNumber
                            + ' ' + $rootScope.newAppointment.patientInfo.town
                            + ' ' + $rootScope.newAppointment.patientInfo.postalCode
                            + ' ' + $rootScope.newAppointment.patientInfo.country,
                            $rootScope.newAppointment.patientInfo.reg_no,
                            $rootScope.newAppointment.patientInfo.email,
                            $rootScope.newAppointment.patientInfo.extraInformation,
                            $rootScope.newAppointment.patientInfo.unique_pid,
                            $rootScope.newAppointment.patientInfo.doctor,
                            $rootScope.newAppointment.patientInfo.unique_gpid,
                            $rootScope.newAppointment.patientInfo.referringDoctor,
                            $rootScope.newAppointment.patientInfo.referringDoctor_gpid,
                            $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url));

                    $q.all(confirmed).then(function(response) {
                        var json = parseJson(response[0]);
                        console.log(json);
                        $scope.PostAnswers.PostAnswers.Header.Reservation_Id = json.AppointmentConfirmed.Detail.id;
                        $scope.PostAnswers.PostAnswers.Header.Unit_Id = json.AppointmentConfirmed.Detail.unit_id;
                        console.log($scope.PostAnswers);
                        var xml = parseXml($scope.PostAnswers);
                        console.log(xml);
                        for (var i = 0; i < $rootScope.newAppointment.type.type_id.length; i++) {
                            hospiviewFactory.getProposalsRemoved(
                                    $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url,
                                    $rootScope.currentServers[$rootScope.newAppointment.server].uuid,
                                    $rootScope.newAppointment.type.unit_id[i],
                                    $rootScope.newAppointment.type.dep_id[i]);
                        }
                        hospiviewFactory.postAnswers(
                                $rootScope.currentServers[$rootScope.newAppointment.server].uuid,
                                json.AppointmentConfirmed.Detail.id,
                                json.AppointmentConfirmed.Detail.unit_id,
                                xml,
                                $rootScope.currentServers[$rootScope.newAppointment.server].hosp_url);

                    }, error);
                    $rootScope.pageClass = 'right-to-left';
                    $location.path('patient/step5');
                } else {
                    console.log($scope.PostAnswers);
                    $scope.showInvalidFields = true;
                    $scope.displayError = true;
                }
            };

            function error(data) {
                if (!$rootScope.isOffline) {
                    alert($rootScope.getLocalizedString("appointmentsViewPatientNoConnectionCreateAppointment"));
                    $rootScope.isOffline = true;
                    switch ($rootScope.type) {
                        case 0:
                        case 1:
                            $location.path('/doctor/appointmentsView');
                            break;
                        case 2:
                        case 3:
                            $location.path('/patient/mainmenu');
                            break;
                    }
                }
                console.log(data);
                $scope.error = true;
            }

            changeSelect();
        }).
        controller("CreateAppointmentStep5Ctrl", function($rootScope, $scope, $location) {

            $scope.displayDate = formatShowDate($rootScope.newAppointment.proposal.the_date, $rootScope.languageID);

            /**
             * The patient returns to the main menu
             * @returns {undefined}
             */
            $scope.end = function() {
                $rootScope.pageClass = 'left-to-right';

                switch ($rootScope.type) {
                    case 0:
                    case 1:
                        $location.path('/doctor/appointmentsView');
                        break;
                    case 2:
                    case 3:
                        $location.path('/patient/mainmenu');
                        break;
                }

            };
        }).
        controller("BackButtonCtrl", function($rootScope, $scope) {
            /**
             * This controller is used for every page that uses a back button that can go back to any page
             * @returns {undefined}
             */
            $scope.back = function() {
                $rootScope.pageClass = 'left-to-right';
                history.back();
            };
        });
