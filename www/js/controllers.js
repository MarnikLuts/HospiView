'use strict';
/* Controllers */

angular.module('myApp.controllers', []).
        controller('LoginCtrl', function($scope, $location, $rootScope, $modal, hospiviewFactory) {

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
             * Call getHospiViewServerList() method of the factory
             * hospiviewFactory. On a successful call, the response data (XML)
             * will be parsed to JSON with the xml2json library 
             * (/js/xml2json.min.js). Not all of the response data is needed, so
             * only the array of servers which we put in the allServers model.
             * 
             * If the call fails, an error will be shown.
             * 
             * @param {Object} data
             */
            hospiviewFactory.getHospiViewServerList().
                    success(function(data) {
                        var json = parseJson(data);
                        $scope.allServers = json.HospiviewServerList.Detail.Server;
                    }).
                    error(function() {
                        alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                    });

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
                console.log($scope.selectedUser);
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
                    alert("Opgelet! Door uw wachtwoord automatisch te laten invullen kan elke gebruiker van dit toestel inloggen met uw account.");
            };

            /**
             * Toggle showPasswordBoolean. Password field will either show dots 
             * (false) or text (true). Toggled by pressing the icon in front
             * of the password field.
             */
            $scope.showpassword = function() {
                if ($scope.showPasswordBoolean === true) {
                    $scope.showPasswordBoolean = false;
                } else {
                    $scope.showPasswordBoolean = true;
                }
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
                hospiviewFactory.getAuthentication($scope.username, $scope.password, $scope.server.hosp_url).
                        success(function(data) {
                            var json = parseJson(data);
                            if (json.Authentication.Header.StatusCode == 1) {
                                $scope.error = false;
                                $scope.selectedUser.save_password = $scope.savePassword;
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
                                /*$location.path('/mainmenu');*/
                                console.log("search");
                                search();
                            } else {
                                $scope.error = true;
                                $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                            }
                            ;
                        }).
                        error(function() {
                            alert("Data kon niet worden opgehaald, probeer later opnieuw.");
                        });
            };

            function search() {
                $rootScope.searchUnits = [];
                $rootScope.searchString = 'all';

                
                hospiviewFactory.getUnitAndDepList($rootScope.currentServer.uuid, $rootScope.currentServer.hosp_url).
                        success(function(data) {
                            var json = parseJson(data);
                            if (json.UnitsAndDeps.Header.StatusCode == 1) {
                                var units = json.UnitsAndDeps.Detail.Unit;
                                for (var i = 0; i < units.length; i++) {
                                    $rootScope.searchUnits.push(units[i]);
                                }
                                console.log($rootScope.searchUnits);
                                setData();
                            } else {
                                $scope.error = true;
                                $scope.errormessage = "Fout in de gegevens.";
                            }
                        }).
                        error(function() {
                            alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                        });
            };
            
            function setData(){
                var today = new Date();
                $rootScope.startDate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                $rootScope.currentdate = formatDate(today);

                console.log($rootScope.searchUnits);
                if (angular.isUndefined($rootScope[$rootScope.searchString]) || $rootScope[$rootScope.searchString] === 0) {
                    searchReservations();
                }
                else {
                    $scope.reservations = $rootScope[$rootScope.searchString];
                    $location.path('/doctor/appointmentsView');
                }
            }

            var reservations = [];
            function searchReservations() {
                console.log("before");
                console.log($rootScope.searchUnits);
                for (var i = 0; i < $rootScope.searchUnits.length; i++) {
                    console.log("in for");
                    var depIds = [];
                    var unitId = $rootScope.searchUnits[i].Header.unit_id;
                    console.log(unitId);
                    if ($rootScope.searchUnits[i].Header.perm === "1") {
                        depIds.push($rootScope.searchUnits[i].Detail.Dep[0].dep_id);
                    } else {
                        for (var j = 0; j < $rootScope.searchUnits[i].Detail.Dep.length; j++) {
                            depIds.push($rootScope.searchUnits[i].Detail.Dep[j].dep_id);
                        }
                    }
                    for (var k = 0; k < depIds.length; k++) {
                        hospiviewFactory.getReservationsOnUnit($rootScope.currentServer.uuid, unitId, depIds[k], $rootScope.startDate, $rootScope.endDate, $rootScope.currentServer.hosp_url).
                                success(function(data) {
                                    var json = parseJson(data);
                                    console.log(json);
                                    if (!(angular.isUndefined(json.ReservationsOnUnit.Detail))) {
                                        if (json.ReservationsOnUnit.Header.StatusCode === "1") {
                                            if (json.ReservationsOnUnit.Header.TotalRecords === "1") {
                                                reservations.push(json.ReservationsOnUnit.Detail.Reservation);
                                            } else {
                                                for (var j = 0; j < json.ReservationsOnUnit.Detail.Reservation.length; j++) {
                                                    reservations.push(json.ReservationsOnUnit.Detail.Reservation[j]);
                                                }
                                            }
                                        } else {
                                            $scope.error = true;
                                            $scope.errormessage = "Fout in de ingegeven gegevens.";
                                        }

                                    }
                                }).
                                error(function() {
                                    alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                                });
                    }
                }
                $rootScope[$rootScope.searchString] = reservations;
                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
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
                        searchReservations();
                    }
                }, function() {
                    console.log("error")
                });
            }
        }).
        controller('MainmenuCtrl', function($scope, $location, $rootScope) {

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
        controller('DoctorSearchAppointmentsCtrl', function($scope, $location, $rootScope, $modal, $parse, hospiviewFactory) {

            /*!!!*/
//            $rootScope.user = "Stijn";
            /*!!!*/

            $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));

            /*!!!*/
            $rootScope.currentServer = $scope.selectedUser.servers[0];
            /*!!!*/

            $scope.servers = $scope.selectedUser.servers;
            $scope.server = $rootScope.currentServer;

            if ($scope.server.shortcut1.unit === "") {
                $scope.shortcut1Saved = false;
            } else {
                $scope.shortcut1Saved = true;
            }
            if ($scope.server.shortcut2.unit === "") {
                $scope.shortcut2Saved = false;
            } else {
                $scope.shortcut2Saved = true;
            }
            if ($scope.server.shortcut3.unit === "") {
                $scope.shortcut3Saved = false;
            } else {
                $scope.shortcut3Saved = true;
            }
            var unitsandgroups = [];
            hospiviewFactory.getUnitAndDepList($scope.server.uuid, $scope.server.hosp_url).
                    success(function(data) {
                        var json = parseJson(data);
                        if (json.UnitsAndDeps.Header.StatusCode == 1) {
                            var units = json.UnitsAndDeps.Detail.Unit;
                            for (var i = 0; i < units.length; i++) {
                                units[i].type = "dokters";
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
            hospiviewFactory.getUnitDepGroups($scope.server.uuid, $scope.server.hosp_url).
                    success(function(data) {
                        var json = parseJson(data);
                        if (json.UnitDepGroups.Header.StatusCode == 1) {
                            var groups = json.UnitDepGroups.Detail.Group;
                            for (var i = 0; i < groups.length; i++) {
                                groups[i].type = "groepen";
                                groups[i].Header.name = groups[i].Header.group_name;
                                unitsandgroups.push(groups[i]);
                            }
                            $scope.unitsandgroups = unitsandgroups;
                        } else {
                            $scope.error = true;
                            $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                        }
                        ;
                    }).
                    error(function() {
                        alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                    });

            $scope.disable = true;

            $scope.loadDep = function() {
                if (!(angular.isUndefined($scope.manual.unit))) {
                    if ($scope.manual.unit == null || $scope.manual.unit.type == "groepen")
                        $scope.disable = true;
                    else {
                        $scope.disable = false;
                        for (var i = 0; i < $scope.manual.unit.Detail.Dep.length; i++) {
                            if ($scope.manual.unit.Detail.Dep[i].dep_name === "") {
                                $scope.manual.unit.Detail.Dep[i].dep_name = "Allemaal";
                                break;
                            }
                        }
                        $scope.departments = $scope.manual.unit.Detail;
                    }
                }
            };

            $scope.backToMainMenu = function() {
                $location.path('/mainmenu');
            };

            $scope.search = function(type) {
                var searchUnitIds = [];
                var searchDepIds = [];
                var searchString = '';

                $scope.searchStrings = {
                    shortcut1: $scope.server.shortcut1,
                    shortcut2: $scope.server.shortcut2,
                    shortcut3: $scope.server.shortcut3,
                    manual: $scope.manual
                }

                if ($scope.searchStrings[type].unit.type == "groepen") {
                    for (var i = 0; i < $scope.searchStrings[type].unit.Detail.UnitAndDep.length; i++) {
                        searchUnitIds.push($scope.searchStrings[type].unit.Detail.UnitAndDep[i].unit_id);
                        searchString = searchString + $scope.searchStrings[type].unit.Detail.UnitAndDep[i].unit_id;
                        searchDepIds.push($scope.searchStrings[type].unit.Detail.UnitAndDep[i].dep_id);
                        searchString = searchString + $scope.searchStrings[type].unit.Detail.UnitAndDep[i].dep_id;
                    }
                } else {
                    searchUnitIds.push($scope.searchStrings[type].unit.Header.unit_id);
                    searchString = searchString + $scope.searchStrings[type].unit.Header.unit_id;
                    searchDepIds.push($scope.searchStrings[type].department.dep_id);
                    searchString = searchString + $scope.searchStrings[type].department.dep_id;
                }

                $rootScope.searchUnit = searchUnitIds;
                $rootScope.searchDepartment = searchDepIds;

                var today = new Date(2013, 12, 1);
                $rootScope.startDate = formatDate(today);
                $rootScope.endDate = formatDate(new Date(today.setDate(today.getDate() + 14)));
                $rootScope.currentdate = formatDate(today);

                if (angular.isUndefined($rootScope[searchString]) || $rootScope[searchString] === 0) {
                    $rootScope.searchString = searchString;
                    searchReservations();
                }
                else {
                    $scope.reservations = $rootScope[searchString];
                    $location.path('/doctor/appointmentsView');
                }
            }
            var reservations = [];
            function searchReservations() {
                for (var i = 0; i < $rootScope.searchUnit.length; i++) {
                    var unit = $rootScope.searchUnit[i];
                    var dep = $rootScope.searchDepartment[i];
                    hospiviewFactory.getReservationsOnUnit($rootScope.currentServer.uuid, unit, dep, $rootScope.startDate, $rootScope.endDate, $rootScope.currentServer.hosp_url).
                            success(function(data) {
                                var json = parseJson(data);
                                if (!(angular.isUndefined(json.ReservationsOnUnit.Detail))) {
                                    if (json.ReservationsOnUnit.Header.StatusCode == 1) {
                                        if (json.ReservationsOnUnit.Header.TotalRecords === "1") {
                                            reservations.push(json.ReservationsOnUnit.Detail.Reservation);
                                        } else {
                                            for (var j = 0; j < json.ReservationsOnUnit.Detail.Reservation.length; j++) {
                                                reservations.push(json.ReservationsOnUnit.Detail.Reservation[j]);
                                            }
                                        }
                                    } else {
                                        $scope.error = true;
                                        $scope.errormessage = "Fout in de ingegeven gegevens.";
                                    }

                                }
                            }).
                            error(function() {
                                alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                            });
                }
                $rootScope[$rootScope.searchString] = reservations;

                if ($rootScope[$rootScope.searchString].length === 0) {
                    callModal();
                } else {
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
                        searchReservations();
                    }
                }, function() {
                    console.log("error")
                });
            };
            
            function ModalInstance($scope, $modalInstance) {
                //Don't use $scope.continue, 'continue' is a reserved keyword
                $scope.ok = function() {
                    $scope.continuee = true;
                    $modalInstance.close($scope.continuee);
                };

                $scope.cancel = function() {
                    $scope.continuee = false;
                    $modalInstance.close($scope.continuee);
                };
            };

        }).
        controller('DoctorViewAppointmentsCtrl', function($scope, $rootScope, $location) {

            var lowestDate = new Date(2500, 1, 1);
            console.log($rootScope[$rootScope.searchString]);
            for (var i = 0; i < $rootScope[$rootScope.searchString].length; i++) {
                var compareDate = new Date($rootScope[$rootScope.searchString][i].the_date);
                if (compareDate < lowestDate) {
                    lowestDate = compareDate;
                }
            }

            $scope.reservations = $rootScope[$rootScope.searchString];
            $scope.date = formatDate(lowestDate);
            $scope.showDate = formatShowDate($scope.date);
            var cell = JSON.parse(localStorage.getItem($rootScope.user));
            $scope.cellcontent = cell.cellcontent;

            $scope.nextDay = function() {
                var newDate = new Date($scope.date);
                newDate.setDate(newDate.getDate() + 1);
                $scope.date = formatDate(newDate);
                $scope.showDate = formatShowDate($scope.date);
            };
            $scope.previousDay = function() {
                var newDate = new Date($scope.date);
                newDate.setDate(newDate.getDate() - 1);
                $scope.date = formatDate(newDate);
                $scope.showDate = formatShowDate($scope.date);
            };
            $scope.back = function() {
                $location.path('/doctor/appointmentsSearch');
            };
            $scope.details = function(reservation) {
                $rootScope.reservationDetail = reservation;
                $rootScope.currentdate = reservation.the_date;
                $location.path('/doctor/appointmentDetail');
            };
            $scope.calendarView = function() {
                $location.path('/appointmentsCalendar');
            };
            $scope.style = function(value) {
                var color = '#' + value;
                return {"background-color": color};
            };
            $scope.logout = function() {
                $rootScope.user = null;
                $rootScope.type = null;
                $location.path('/login');
            };
        }).
        controller('DoctorViewappointmentDetailCtrl', function($scope, $location, $rootScope) {
            $scope.reservation = $rootScope.reservationDetail;

            $scope.back = function() {
                $location.path('/doctor/appointmentsView');
            };
        }).
        controller('DoctorViewAppointmentsCalendarCtrl', function($scope, $location, $rootScope) {
            var start = new Date($rootScope.startDate);
            var end = new Date($rootScope.endDate);
            var current = new Date($rootScope.currentdate)
            start.setHours(0, 0, 0);
            end.setHours(0, 0, 0);
            var gotoDate = new Date($rootScope.currentdate);
            /*gotoDate.setMonth(gotoDate.getMonth() - 1);*/
            gotoDate = gotoDate.toUTCString();

            $scope.back = function() {
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
                    resources: $scope.appointmentsCalendar,
                    weekNumbers: true,
                    monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
                    monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sept', 'okt', 'nov', 'dec'],
                    dayNames: ['zondag', 'maandag', 'disndag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
                    dayNamesShort: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
                    header: {
                        left: '',
                        center: '',
                        right: 'title'
                    },
                    buttonText: {
                        today: 'vandaag',
                    },
                    titleFormat: {
                        day: 'd/m'
                    },
                    eventClick: function(calEvent, jsEvent, view) {
                        var getClickedDay = calEvent.start;
                        $rootScope.currentdate = formatDate(new Date(getClickedDay.getFullYear(), getClickedDay.getMonth(), getClickedDay.getDate()));
                        window.location.href = 'index.html#/doctor/appointmentsView';
                    }
                }
            };
            var eventss = $rootScope.currentReservations;
            var j = 0;
            var count = 0;
            var countEvent = [];
            var eventsEdit = [];
            while (start.getTime() !== end.getTime()) {
                for (var i = 0; i < eventss.length; i++) {
                    eventsEdit.push(new Date(eventss[i].the_date));
                    eventsEdit[j].setHours(0, 0, 0);
                    if (start.getTime() === eventsEdit[j].getTime()) {
                        count = count + 1;
                    }
                    j = j + 1;

                }
                if (count != 0) {
                    count = count + "";
                    var endTest = new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours() + 1);
                    countEvent.push({title: count, start: start.toUTCString(), end: endTest.toUTCString(), allDay: true});
                    count = 0;
                }
                start.setDate(start.getDate() + 1);
            }
            $scope.eventSources = [countEvent];

            $scope.next = function() {
                $('#doctorCalendar').fullCalendar('next');
            }
            $scope.prev = function() {
                $('#doctorCalendar').fullCalendar('prev');
            }
            $scope.today = function() {
                $('#doctorCalendar').fullCalendar('today');
            }

            /*
             $scope.holidays = [
             {start: new Date("February 27, 2014"),
             end: new Date("February 27, 2014"),
             cls: 'open',
             color: '#777777',
             background: '#eeeeff'}];*/


            /*Change CSS of the buttons
             * http://stackoverflow.com/questions/11279394/fullcalendar-with-twitter-bootstrap 
             
             var $fcButtons = $('[class*="fc-button"]').addClass('btn')
             , $oldTable = $('.fc-header-right > table');
             
             $('<div>')
             .addClass('btn-group')
             .appendTo('.fc-header-right')
             .append($fcButtons);
             
             $oldTable.remove();*/
        }).
        controller('PatientViewAppointmentsCtrl', function($scope, $location) {
            $scope.backToMainMenu = function() {
                $location.path('/mainmenu');
            };
        }).
        controller('SettingsCtrl', function($scope, $location, $rootScope, hospiviewFactory) {

            $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));

            $scope.servers = $scope.selectedUser.servers;
            $scope.server = $rootScope.currentServer;
            console.log($scope.server);

            var unitsandgroups = [];
            hospiviewFactory.getUnitAndDepList($scope.server.uuid, $scope.server.hosp_url).
                    success(function(data) {
                        var json = parseJson(data);
                        if (json.UnitsAndDeps.Header.StatusCode == 1) {
                            var units = json.UnitsAndDeps.Detail.Unit;
                            for (var i = 0; i < units.length; i++) {
                                units[i].type = "dokters";
                                units[i].Header.name = units[i].Header.unit_name;
                                unitsandgroups.push(units[i]);

                                if ($scope.server.shortcut1.unit.type === "dokters") {
                                    if (units[i].Header.unit_id === $scope.server.shortcut1.unit.Header.unit_id) {
                                        $scope.server.shortcut1.unit = units[i];
                                        $scope.loadDep(1);
                                        for (var j = 0; j < $scope.server.shortcut1.unit.Detail.Dep.length; j++) {
                                            if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut1.department.dep_id)
                                                $scope.server.shortcut1.department = units[i].Detail.Dep[j];
                                        }
                                    }
                                }

                                if ($scope.server.shortcut2.unit.type === "dokters") {
                                    if (units[i].Header.unit_id === $scope.server.shortcut2.unit.Header.unit_id) {
                                        $scope.server.shortcut2.unit = units[i];
                                        $scope.loadDep(2);
                                        for (var j = 0; j < $scope.server.shortcut2.unit.Detail.Dep.length; j++) {
                                            if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut2.department.dep_id)
                                                $scope.server.shortcut2.department = units[i].Detail.Dep[j];
                                        }
                                    }
                                }

                                if ($scope.server.shortcut3.unit.type === "dokters") {
                                    if (units[i].Header.unit_id === $scope.server.shortcut3.unit.Header.unit_id) {
                                        $scope.server.shortcut3.unit = units[i];
                                        $scope.loadDep(3);
                                        for (var j = 0; j < $scope.server.shortcut3.unit.Detail.Dep.length; j++) {
                                            if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut3.department.dep_id)
                                                $scope.server.shortcut3.department = units[i].Detail.Dep[j];
                                        }
                                    }
                                }
                            }
                        } else {

                            $scope.error = true;
                            $scope.errormessage = "Fout in de gegevens.";
                        }
                    }).
                    error(function() {
                        alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                    });
            hospiviewFactory.getUnitDepGroups($scope.server.uuid, $scope.server.hosp_url).
                    success(function(data) {
                        var json = parseJson(data);
                        if (json.UnitDepGroups.Header.StatusCode == 1) {
                            var groups = json.UnitDepGroups.Detail.Group;
                            for (var i = 0; i < groups.length; i++) {
                                groups[i].type = "groepen";
                                groups[i].Header.name = groups[i].Header.group_name;
                                unitsandgroups.push(groups[i]);


                                if ($scope.server.shortcut1.unit.type === "groepen") {
                                    if (groups[i].Header.group_id === $scope.server.shortcut1.unit.Header.group_id) {
                                        $scope.server.shortcut1.unit = groups[i];
                                    }
                                }

                                if ($scope.server.shortcut2.unit.type === "groepen") {
                                    if (groups[i].Header.group_id === $scope.server.shortcut2.unit.Header.group_id) {
                                        $scope.server.shortcut2.unit = groups[i];
                                    }
                                }

                                if ($scope.server.shortcut3.unit.type === "groepen") {
                                    if (groups[i].Header.group_id === $scope.server.shortcut3.unit.Header.group_id) {
                                        $scope.server.shortcut3.unit = groups[i];
                                    }
                                }


                            }
                            $scope.unitsandgroups = unitsandgroups;
                        } else {
                            $scope.error = true;
                            $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                        }
                        ;
                    }).
                    error(function() {
                        alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                    });

            $scope.disableS1 = true;
            $scope.disableS2 = true;
            $scope.disableS3 = true;

            $scope.loadDep = function(shortcut) {
                switch (shortcut)
                {
                    case 1:
                        if (!(angular.isUndefined($scope.server.shortcut1.unit))) {
                            if ($scope.server.shortcut1.unit == null || $scope.server.shortcut1.unit.type == "groepen")
                                $scope.disableS1 = true;
                            else {
                                $scope.disableS1 = false;
                                for (var i = 0; i < $scope.server.shortcut1.unit.Detail.Dep.length; i++) {
                                    if ($scope.server.shortcut1.unit.Detail.Dep[i].dep_name === "") {
                                        $scope.server.shortcut1.unit.Detail.Dep[i].dep_name = "Allemaal";
                                        break;
                                    }
                                }
                                $scope.departments1 = $scope.server.shortcut1.unit.Detail;
                            }
                        }
                        break;
                    case 2:
                        if (!(angular.isUndefined($scope.server.shortcut2.unit))) {
                            if ($scope.server.shortcut2.unit == null || $scope.server.shortcut2.unit.type == "groepen")
                                $scope.disableS2 = true;
                            else {
                                $scope.disableS2 = false;
                                for (var i = 0; i < $scope.server.shortcut2.unit.Detail.Dep.length; i++) {
                                    if ($scope.server.shortcut2.unit.Detail.Dep[i].dep_name === "") {
                                        $scope.server.shortcut2.unit.Detail.Dep[i].dep_name = "Allemaal";
                                        break;
                                    }
                                }
                                $scope.departments2 = $scope.server.shortcut2.unit.Detail;
                            }
                        }
                        break;
                    case 3:
                        if (!(angular.isUndefined($scope.server.shortcut3.unit))) {
                            if ($scope.server.shortcut3.unit == null || $scope.server.shortcut3.unit.type == "groepen")
                                $scope.disableS3 = true;
                            else {
                                $scope.disableS3 = false;
                                for (var i = 0; i < $scope.server.shortcut3.unit.Detail.Dep.length; i++) {
                                    if ($scope.server.shortcut3.unit.Detail.Dep[i].dep_name === "") {
                                        $scope.server.shortcut3.unit.Detail.Dep[i].dep_name = "Allemaal";
                                        break;
                                    }
                                }
                                $scope.departments3 = $scope.server.shortcut3.unit.Detail;
                            }
                        }
                        break;
                }
            };

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
                $location.path('/mainmenu');
            };
            $scope.addOrEditServer = function(action, server) {
                if (action === "add" && $scope.selectedUser.servers.length === 3)
                    alert("Er kunnen maximaal 3 ziekenhuizen worden opgeslaan.");
                else {
                    if (action === "edit")
                        $rootScope.editServer = server;
                }
                $location.path('/selectserver/' + action);
            };
        }).
        controller('SelectserverCtrl', function($scope, $location, $rootScope, $routeParams, hospiviewFactory) {

            if ($routeParams.action == "new")
                $scope.newBoolean = true;
            else
                $scope.newBoolean = false;

            hospiviewFactory.getHospiViewServerList().
                    success(function(data) {
                        var json = parseJson(data);
                        $scope.serversWithHeader = json;
                        $scope.servers = $scope.serversWithHeader.HospiviewServerList.Detail.Server;
                    }).
                    error(function() {
                        alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                    });

            $scope.serverSelected = false;
            $scope.accountRadio = null;
            $scope.accountTrue = false;
            $scope.accountFalse = false;
            $scope.showPasswordBoolean = false;
            $scope.savePassword = false;
            $scope.requestMessage;
            $scope.datenr = {nr: $scope.nationalRegister, date: $scope.dateOfBirth};

            $scope.userFunctionList = ["Patiënt", "Vertegenwoordiger", "Huisarts", "Arts"];
            $scope.userFunctionSelected = false;
            $scope.needsNationalReg = function(userFunction) {
                return userFunction === 'Patiënt' || userFunction === 'Vertegenwoordiger';
            };
            $scope.needsRiziv = function(userFunction) {
                return userFunction === 'Arts' || userFunction === 'Huisarts';
            };

            $scope.requestAccount = function() {
                $scope.requestMessage = "U ontvangt dadelijk een email met uw logingegevens. ";
                $scope.accountRadio = "ja";
                $scope.accountTrue = true;
                $scope.accountFalse = false;
            };
            $scope.savePasswordWarning = function() {
                if ($scope.savePassword == false)
                    alert("Opgelet! Door uw wachtwoord automatisch te laten invullen kan elke gebruiker van dit toestel inloggen met uw account.");
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
                                    if ($routeParams.action == "new") {
                                        if (localStorage.getItem(localStorageName) === null) {
                                            $scope.error = false;
                                            $rootScope.user = localStorageName;
                                            $rootScope.currentServer = $scope.server;
                                            addToLocalStorage("users", [{"username": localStorageName}]);
                                            addToLocalStorage(localStorageName,
                                                    {"servers": [{"id": $rootScope.currentServer.id,
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
                                            $location.path('/mainmenu');
                                        } else {
                                            $scope.error = true;
                                            $scope.errormessage = "Account is reeds op dit toestel toegevoegd.";
                                        }
                                    } else {
                                        if ($routeParams.action == "add") {
                                            var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                                            var addServer = {"id": connectServer[0].id,
                                                "hosp_full_name": connectServer[0].hosp_full_name,
                                                "hosp_url": connectServer[0].hosp_url,
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
                                        } else {
                                            var selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
                                            for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
                                                if (selectedUser.servers[i].id == $rootScope.editServer.id) {
                                                    var editServer = {"id": connectServer[0].id,
                                                        "hosp_full_name": connectServer[0].hosp_full_name,
                                                        "hosp_url": connectServer[0].hosp_url,
                                                        "user_password": $scope.password,
                                                        "user_login": $scope.username,
                                                        "reg_no": json.Authentication.Detail.reg_no,
                                                        "unique_pid": json.Authentication.Detail.unique_pid,
                                                        "uuid": json.Authentication.Detail.uuid,
                                                        "isexternal": json.Authentication.Detail.isexternal,
                                                        "shortcut1": {"unit": "", "department": ""},
                                                        "shortcut2": {"unit": "", "department": ""},
                                                        "shortcut3": {"unit": "", "department": ""}};
                                                    $scope.selectedUser.servers[i] = editServer;
                                                }
                                            }
                                            localStorage.setItem($rootScope.user, JSON.stringify(selectedUser));
                                        }
                                    }

                                } else {
                                    $scope.error = true;
                                    $scope.errormessage = "Fout in de ingevoerde login gegevens.";
                                }
                            }).
                            error(function() {
                                alert("Data kon niet worden opgehaald, probeer later opnieuw.");
                            });
                }
            };
            $scope.cancel = function() {
                $location.path('/settings');
            };
            $scope.refresh = function() {
                hospiviewFactory.getHospiViewServerList().
                        success(function(data) {
                            var json = parseJson(data);
                            $scope.serversWithHeader = json;
                            $scope.servers = $scope.serversWithHeader.HospiviewServerList.Detail.Server;
                        }).
                        error(function() {
                            alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
                        });
            };
            $scope.showpassword = function() {
                if ($scope.showPasswordBoolean === true) {
                    $scope.showPasswordBoolean = false;
                } else {
                    $scope.showPasswordBoolean = true;
                }
            };
        });


function addToLocalStorage(lsKey, data) {
    if (localStorage.getItem(lsKey) !== null) {
        var lsText = localStorage.getItem(lsKey);
        var lsJson = JSON.parse(lsText);
        lsJson.push(data);
        localStorage.setItem(lsKey, JSON.stringify(lsJson));
    }
    else {
        var lsText = JSON.stringify(data);
        var lsJson = JSON.parse(lsText);
        localStorage.setItem(lsKey, JSON.stringify(lsJson));
    }
}
;

/**
 * Parses the incoming XML to a JSON object using the xml2sjon library.
 * (/js/xml2json.min.js).
 * 
 * @param {type} xml    
 * @returns             json object
 */
function parseJson(xml) {
    var x2js = new X2JS();
    var json = x2js.xml_str2json(xml);
    return json;
}
;

/**
 * Changes the format of a date to yyyy-mm-dd. This format is needed to pass 
 * the date to the webservice. To get the month, we need to add 1 to 
 * date.getMonth() because January is 0;
 * If the day or month has only 1 digit, a zero
 * is added to get a two digit day or month.
 * 
 * @param {type} date       The date as date object.
 * @returns {String}        The date as string in the right format.
 */
function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    date = yyyy + '-' + mm + '-' + dd;
    return date;
}
;

function formatShowDate(date) {
    var newDate = new Date(date);
    var dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    var day = dayNames[newDate.getDay()];
    var date = newDate.getDate();
    var month = monthNames[newDate.getMonth()];

    newDate = day + " " + date + " " + month;
    return newDate;
}
