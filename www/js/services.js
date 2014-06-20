'use strict';

/* Services */

angular.module('myApp.services', []).
        /**
         * Variable containing the base url.
         */
        constant('base_url', 'cfcs/webservices/reservations_service.cfc?').
        constant('kiosk_url', 'cfcs/webservices/kiosk_service.cfc?').
        /** 
         * Factory containing methods for the different requests. For every request,
         * we increase the requestCounter and add this as a paramter to each request.
         * We do this because there is a bug in iOS6 which caches all requests it does.
         * So by changing the request each time, it will see it as a different request
         * resulting in it executing. 
         * The other way, the right way, to fix this problem is to send an extra header
         * with the request.
         *      Cache-Control: no-cache
         * If possible, try to change the webservice to pass this header.
         * 
         * In each method, the function doQuery is declared. This function will
         * execute the request again in the request is not fulfilled. The request
         * will be done maximum 5 times. The function is declared in each method
         * because otherwise, the variable queryResults is overriden if multiple
         * requests are done after each other. This would result in unresolved promises
         * and the application waiting forever for these promises to be resolved.
         */
        factory('hospiviewFactory', function($http, $rootScope, $q, $timeout, kiosk_url) {
            var count = 0;

            return{
                /**
                 * Gets All the HospiView servers
                 * @returns {unresolved}
                 */
                getHospiViewServerList: function() {
                    $rootScope.requestCounter++;
                    var requestString = "http://agenda.agendaview.be/cfcs/webservices/agendaview/hospiview_servers.cfc?method=GetHospiviewServerList";
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets a UUID from the server if the given username and password are valid
                 * This UUID is required to use other webservices
                 * 
                 * @param {type} username
                 * @param {type} password
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getAuthentication: function(username, password, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetAuthentication&user_login=" + username + "&user_password=" + password + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Checks if the given Hospiview server has a kiosk webservice
                 * 
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                checkForKiosk: function(server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + kiosk_url + "method=GetAuthentication&user_login=user&user_password=pass&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all units and departments for which the requesting user has permissions
                 * 
                 * @param {type} uuid
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getUnitAndDepList: function(uuid, The_Online, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetUnitAndDepList&UUID=" + uuid + "&The_Online=" + The_Online + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all unit groups for which the requesting user has permissions
                 * 
                 * @param {type} uuid
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getUnitDepGroups: function(uuid, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=getUnitDepGroups&UUID=" + uuid + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all the reservation from a given unit and department between the start date and end date
                 * 
                 * @param {type} uuid
                 * @param {type} unit_id
                 * @param {type} dep_id
                 * @param {type} start_date
                 * @param {type} end_date
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getReservationsOnUnit: function(uuid, unit_id, dep_id, start_date, end_date, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetReservationsOnUnit&UUID=" + uuid + "&unit_id=" + unit_id + "&dep_id=" + dep_id + "&start_date=" + start_date + "&end_date=" + end_date + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets the reservations for a particular patient
                 * either with the patient's PID or RegNo
                 * 
                 * PID_OR_RegNo should be:
                 * 1 for PID
                 * 2 for RegNo
                 * 
                 * @param {type} uuid
                 * @param {type} pid_or_regno
                 * @param {type} patsearchvar
                 * @param {type} start_date
                 * @param {type} end_date
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getReservationsOnPatient: function(uuid, pid_or_regno, patsearchvar, start_date, end_date, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetReservationsOnPatient&UUID=" + uuid + "&pid_or_regno=" + pid_or_regno + "&patsearchvar=" + patsearchvar + "&start_date=" + start_date + "&end_date=" + end_date + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets the dates for public holidays
                 * 
                 * @param {type} Language_Id
                 * @param {type} year
                 * @param {type} month
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getPublicHolidays: function(Language_Id, year, month, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetPublicHolidays&Language_Id=" + Language_Id + "&Year=" + year + "&Month=" + month + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all the dates where doctors are reported as absent
                 * 
                 * month should be 0 if you need the dates for the entire year
                 * 
                 * @param {type} uuid
                 * @param {type} year
                 * @param {type} month
                 * @param {type} unit_id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getUnitAbsentDays: function(uuid, year, month, unit_id, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetUnitAbsentDays&UUID=" + uuid + "&Year=" + year + "&Month=" + month + "&Unit_Id=" + unit_id + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all the localized strings that are stored remotely
                 * 
                 * 1 for Dutch
                 * 2 for French
                 * 3 for English
                 * 
                 * listOsPidsSids format should be:
                 * 201,4,5,8,7;202,2,5,4,8
                 * 
                 * @param {type} language_Id
                 * @param {type} listOfPidsSids
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getLanguageStrings: function(language_Id, listOfPidsSids, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetLanguageStrings&Language_Id=" + language_Id + "&ListOfPidsSids=" + listOfPidsSids + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Registers a new patient using the kiosk service
                 * The user will recieve an email with an automatically generated password
                 * 
                 * This method also returns a UUID 
                 * 
                 * @param {type} USER_NAME
                 * @param {type} USER_REGNO
                 * @param {type} USER_EMAIL
                 * @param {type} USER_MOB
                 * @param {type} LanguageId
                 * @param {type} Update_NameEmailTel
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getLogin: function(USER_NAME, USER_REGNO, USER_EMAIL, USER_MOB, LanguageId, Update_NameEmailTel, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetLogin&USER_NAME=" + USER_NAME + "&USER_REGNO=" + USER_REGNO + "&USER_EMAIL=" + USER_EMAIL + "&USER_MOB=" + USER_MOB + "&LANGUAGE_ID=" + LanguageId + "&Update_NameEmailTel=" + Update_NameEmailTel + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Gets all the possible reservation types of the given unit and department
                 * 
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} Dep_Id
                 * @param {type} GlobalTypes
                 * @param {type} The_Online
                 * @param {type} Language_Id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getTypes: function(UUID, Unit_Id, Dep_Id, GlobalTypes, The_Online, Language_Id, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetTypesOnUnit&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&Dep_Id=" + Dep_Id + "&GlobalTypes=" + GlobalTypes + "&The_Online=" + The_Online + "&Language_Id=" + Language_Id + "&count=" + $rootScope.requestCounter;
                    console.log(requestString);
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Get proposals for placing a reservation.
                 * 
                 * @param {type} server_url
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} Dep_Id
                 * @param {type} UnitType_Id
                 * @param {type} STitle
                 * @param {type} Additional_Info
                 * @param {type} GlobalTypes
                 * @param {type} Start_Date
                 * @param {type} Start_Time
                 * @param {type} Active_Days
                 * @param {type} Include_Today
                 * @param {type} Language_id
                 * @returns {unresolved}
                 */
                getProposals: function(server_url, UUID, Unit_Id, Dep_Id, UnitType_Id, STitle, Additional_Info, GlobalTypes, Start_Date, Start_Time, Active_Days, Include_Today, Language_id) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetProposals&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&Dep_Id=" + Dep_Id + "&UnitType_Id=" + UnitType_Id + "&STitle=" + STitle + "&Additional_Info=" + Additional_Info + "&GlobalTypes=" + GlobalTypes + "&Start_Date=" + Start_Date + "&Start_Time=" + Start_Time + "&Active_Days=" + Active_Days + "&Include_Today=" + Include_Today + "&Language_id=" + Language_id + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Deleted preserved proposals so the slots are free again.
                 * 
                 * @param {type} server_url
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} Dep_Id
                 * @returns {unresolved}
                 */
                getProposalsRemoved: function(server_url, UUID, Unit_Id, Dep_Id) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetProposalsRemoved&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&Dep_Id=" + Dep_Id + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Get the basic questions for the user to create an appointment.
                 * Also receives the required fields.
                 * 
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getActiveFieldsOnUnit: function(UUID, Unit_Id, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetActiveFieldsOnUnit&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Get the information about the patient to fill out the fields
                 * received by getActiveFieldsOnUnit.
                 * 
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} Reg_No
                 * @param {type} Language_Id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getPatientLookup: function(UUID, Unit_Id, Reg_No, Language_Id, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetPatientLookup&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&Reg_No=" + Reg_No + "&Language_Id=" + Language_Id;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Get the extra questions the doctor has configured for the patient
                 * to create an appointment.
                 * 
                 * @param {type} UUID
                 * @param {type} Unit_Id
                 * @param {type} UnitType_Id
                 * @param {type} Language_Id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getQuestionsOnUnit: function(UUID, Unit_Id, UnitType_Id, Language_Id, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetQuestionsOnUnit&UUID=" + UUID + "&Unit_Id=" + Unit_Id + "&UnitType_Id=" + UnitType_Id + "&Language_Id=" + Language_Id + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Confirm the choosen proposal resulting in creating an appointment.
                 * 
                 * @param {type} UUID
                 * @param {type} Proposal_Id
                 * @param {type} pName
                 * @param {type} pFirstName
                 * @param {type} pBDate
                 * @param {type} pGender
                 * @param {type} pTel1
                 * @param {type} pTel2
                 * @param {type} pAddress
                 * @param {type} Reg_No
                 * @param {type} pEmail
                 * @param {type} pMemo
                 * @param {type} pUnique_PID
                 * @param {type} pDoctor
                 * @param {type} pUnique_GPID
                 * @param {type} pReferring_doctor
                 * @param {type} pReferring_GPID
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                getAppointmentConfirmed: function(UUID, Proposal_Id, pName, pFirstName, pBDate, pGender, pTel1, pTel2, pAddress, Reg_No, pEmail, pMemo, pUnique_PID, pDoctor, pUnique_GPID, pReferring_doctor, pReferring_GPID, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=GetAppointmentConfirmed&UUID=" + UUID + "&Proposal_Id=" + Proposal_Id + "&pName=" + pName + "&pFirstName=" + pFirstName + "&pBDate=" + pBDate + "&pGender=" + pGender + "&pTel1=" + pTel1 + "&pTel2=" + pTel2 + "&pAddress=" + pAddress + "&pReg_No=" + Reg_No + "&pEmail=" + pEmail + "&pMemo=" + pMemo + "&pUnique_PID=" + pUnique_PID + "&pDoctor=" + pDoctor + "&pUnique_GPID=" + pUnique_GPID + "&pReferring_doctor=" + pReferring_doctor + "&pReferring_GPID=" + pReferring_GPID + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                },
                /**
                 * Confirm the answers of the extra questions of the proposal.
                 * 
                 * @param {type} UUID
                 * @param {type} Reservation_Id
                 * @param {type} Unit_Id
                 * @param {type} server_url
                 * @returns {unresolved}
                 */
                postAnswers: function(UUID, Reservation_Id, Unit_Id, AnswersXML, server_url) {
                    $rootScope.requestCounter++;
                    var requestString = server_url + "method=PostAnswers&UUID=" + UUID + "&Reservation_id=" + Reservation_Id + "&Unit_id=" + Unit_Id + "&AnswersXML=" + AnswersXML + "&count=" + $rootScope.requestCounter;
                    var queryResults = $q.defer();
                    function doQuery() {
                        console.log("doQuery")
                        $http({method: 'GET', url: requestString})
                                .success(function(body) {
                                    queryResults.resolve(body);
                                })
                                .error(function() {
                                    if (count !== 4) {
                                        $timeout(function() {
                                            doQuery(requestString);
                                        }, 1000);
                                        count++;
                                    } else {
                                        count = 0;
                                        queryResults.reject('Can not connect to server');
                                    }
                                });
                    }
                    doQuery();
                    return queryResults.promise;
                }
            };
        }).
        factory('dataFactory', function($rootScope, $q, hospiviewFactory) {
            /**
             * Check if the given unit uses a 3 step or 4 step system for their reservations
             * 
             * @param {type} unit_id
             * @returns {unresolved}
             */
            function getSteps(unit_id) {
                for (var i = 0; i < $rootScope.searchUnits.length; i++) {
                    if (unit_id == $rootScope.searchUnits[i].Header.unit_id) {
                        return $rootScope.searchUnits[i].Header.step_buttons;
                    }
                }
            }

            function error() {
                $rootScope.$emit('stopLoadingEvent', {});
            }

            return{
                /**
                 * Function that handles the resolved promise from hospiviewFactory.getPublicHolidays
                 * 
                 * @param {type} responses
                 * @returns {unresolved}
                 */
                setHolidays: function(responses) {
                    var defer = $q.defer();
                    console.log(responses);
                    for (var i = 0; i < responses.length; i++) {
                        var json = parseJson(responses[i]);
                        if (json.PublicHolidays.Header.StatusCode == 1) {
                            if (!angular.isUndefined(json.PublicHolidays.Detail)) {
                                $rootScope.publicHolidays.push(json.PublicHolidays.Detail.PublicHoliday);
                            }
                        } else {
                            defer.reject($rootScope.getLocalizedString('internalError'));
                            error();
                        }
                    }
                    defer.resolve();
                    localStorage.setItem($rootScope.user + "PublicHolidays", JSON.stringify($rootScope.publicHolidays));
                    return defer.promise;
                },
                /**
                 * Function that handles the resolved promise from hospiviewFactory.getUnitAndDepList
                 * 
                 * @param {type} response
                 * @returns {unresolved}
                 */
                setSearchUnits: function(response, server) {
                    var defer = $q.defer();
                    var json = parseJson(response);
                    if (json.UnitsAndDeps.Header.StatusCode == 1) {
                        if(json.UnitsAndDeps.Detail.Unit.length)
                            for (var i = 0; i < json.UnitsAndDeps.Detail.Unit.length; i++)
                                $rootScope.searchUnits.push(json.UnitsAndDeps.Detail.Unit[i]);
                            
                        else
                            $rootScope.searchUnits.push(json.UnitsAndDeps.Detail.Unit);
                        defer.resolve(server);
                    } else {
                        defer.reject($rootScope.getLocalizedString('internalError'));
                        error();
                    }
                    return defer.promise;
                },
                /**
                 * Requests every day where someone is absent and sets the data in the rootscope
                 * 
                 * @param {type} year
                 * @returns {unresolved}
                 */
                setAbsentDays: function(year, server) {
                    var defer = $q.defer(),
                            promises = [];

                    for (var i = 0; i < $rootScope.searchUnits.length; i++) {
                        if ($rootScope.searchUnits[i].Header)
                            promises.push(hospiviewFactory.getUnitAbsentDays(server.uuid, year, '00', $rootScope.searchUnits[i].Header.unit_id, server.hosp_url));
                    }

                    $q.all(promises).then(function(responses) {
                        for (var j = 0; j < responses.length; j++) {
                            var json = parseJson(responses[j]);
                            if (json.UnitAbsentdays.Header.StatusCode == 1) {
                                if (!angular.isUndefined(json.UnitAbsentdays.Detail)) {
                                    for (var a = 0; a < json.UnitAbsentdays.Detail.AbsentDay.length; a++) {
                                        var absentDay = json.UnitAbsentdays.Detail.AbsentDay[a];
                                        absentDay.unit_name = $rootScope.searchUnits[j].Header.unit_name;
                                        absentDay.hosp_short_name = server.hosp_short_name;
                                        $rootScope.absentDays.push(absentDay);
                                    }
//                                    $rootScope.absentDays.push(json.UnitAbsentdays.Detail.AbsentDay);
                                }
                            } else {
                                defer.reject($rootScope.getLocalizedString('internalError'));
                                error();
                            }
                        }
                        localStorage.setItem($rootScope.user + "AbsentDays", JSON.stringify($rootScope.absentDays));
                        defer.resolve(server);
                    }, function(error) {
                        defer.reject($rootScope.getLocalizedString('connectionError'));
                        error();
                    });
                    return defer.promise;
                },
                /**
                 * Gets every reservation from the server and returns the data through 'var reservations'
                 * 
                 * @returns {unresolved}
                 */
                searchReservations: function(server) {
                    console.log("get reservations");
                    var defer = $q.defer(),
                            reservations = [],
                            promises = [];
                    console.log($rootScope.searchUnits.length);
                    for (var i = 0; i < $rootScope.searchUnits.length; i++) {
                        console.log($rootScope.searchUnits[i]);
                        if ($rootScope.searchUnits[i].Header) {
                            console.log($rootScope.searchUnits.length);
                            var depIds = [];
                            var unitId = $rootScope.searchUnits[i].Header.unit_id;

                            if ($rootScope.searchUnits[i].Header.perm === "1") {
                                depIds.push($rootScope.searchUnits[i].Detail.Dep[0].dep_id);
                            } else {
                                for (var j = 0; j < $rootScope.searchUnits[i].Detail.Dep.length; j++) {
                                    depIds.push($rootScope.searchUnits[i].Detail.Dep[j].dep_id);
                                }
                            }
                            console.log(depIds.length);
                            for (var k = 0; k < depIds.length; k++) {
                                promises.push(hospiviewFactory.getReservationsOnUnit(server.uuid, unitId, depIds[k], $rootScope.startDate, $rootScope.endDate, server.hosp_url));
                            }
                        }
                    }
                    $q.all(promises).then(function(responses) {
                        console.log(responses);
                        for (var l = 0; l < responses.length; l++) {
                            console.log(responses[l]);
                            var json = parseJson(responses[l]);
                            var reservation;
                            console.log(json);
                            if (json) {
                                if (angular.isDefined(json.ReservationsOnUnit.Detail)) {
                                    if (json.ReservationsOnUnit.Header.StatusCode === "1") {
                                        /**
                                         * We needed to add a check for the length of the amount of reservations.
                                         * This is because, if only one reservation is returned by the webservice, the
                                         * parser won't put it in an array, but just pass it as object. This results
                                         * in not being able to use the .length method of an array, since it's not an array,
                                         * which would return undefined and cause the application to not show the reservation.
                                         */
                                        if (json.ReservationsOnUnit.Header.TotalRecords === "1") {
                                            reservation = json.ReservationsOnUnit.Detail.Reservation;
                                            reservation.step_buttons = getSteps(reservation.unit_id);
                                            reservations.push(reservation);
                                        } else {
                                            if (json.ReservationsOnUnit.Header.TotalRecords !== "0")
                                                for (var s = 0; s < json.ReservationsOnUnit.Detail.Reservation.length; s++) {
                                                    reservation = json.ReservationsOnUnit.Detail.Reservation[s];
                                                    reservation.step_buttons = getSteps(reservation.unit_id);
                                                    reservations.push(reservation);
                                                }
                                        }
                                    } else {
                                        defer.reject($rootScope.getLocalizedString('internalError'));
                                        error();
                                    }
                                }
                            }
                        }
                        console.log(reservations);
                        console.log("end get reservations");
                        defer.resolve(reservations);
                    }, function(error) {
                        defer.reject($rootScope.getLocalizedString('connectionError'));
                        error();
                    });
                    return defer.promise;
                },
                /**
                 * Sets the start date and end date to limit the amount of reservations that will be requested remotely
                 * 
                 * @param {type} startDate
                 * @param {type} endDate
                 * @returns {undefined}
                 */
                setSearchDates: function(startDate, endDate) {
                    startDate = new Date(startDate);
                    endDate = new Date(endDate);
                    if (angular.isUndefined($rootScope.searchRangeStart)) {
                        $rootScope.searchRangeStart = startDate;
                        localStorage.setItem($rootScope.user + "SearchRangeStart", startDate);
                    }
                    else {
                        if (new Date(startDate).getTime() < new Date($rootScope.searchRangeStart).getTime()) {
                            $rootScope.searchRangeStart = startDate;
                            localStorage.setItem($rootScope.user + "SearchRangeStart", startDate);
                        }
                    }
                    if (angular.isUndefined($rootScope.searchRangeEnd)) {
                        $rootScope.searchRangeEnd = endDate;
                        localStorage.setItem($rootScope.user + "SearchRangeEnd", endDate);
                    }
                    else {
                        if (new Date(endDate).getTime() > new Date($rootScope.searchRangeEnd).getTime()) {
                            $rootScope.searchRangeEnd = endDate;
                            localStorage.setItem($rootScope.user + "SearchRangeEnd", endDate);
                        }
                    }
                },
                /**
                 * Fills the calendar with the data set in the root scope
                 * 
                 */
                loadCalendar: function() {
                    var start = new Date($rootScope.searchRangeStart);
                    var end = new Date($rootScope.searchRangeEnd);
                    start.setHours(0, 0, 0);
                    end.setHours(0, 0, 0);

                    var events = $rootScope[$rootScope.searchString];
                    var j = 0;
                    var count = 0;
                    var countEvent = [];
                    var eventsEdit = [];
                    while (start.getTime() !== end.getTime()) {
                        for (var i = 0; i < events.length; i++) {
                            eventsEdit.push(new Date(events[i].the_date));
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

                    var holidays = $rootScope.publicHolidays[$rootScope.languageID - 1];
                    if (!angular.isUndefined(holidays.length))
                        for (var i = 0; i < holidays.length; i++) {
                            var holiday_date = new Date(holidays[i].the_date);
                            var holiday_date_end = new Date(holiday_date.getFullYear(), holiday_date.getMonth(), holiday_date.getDate(), holiday_date.getHours() + 1);
                            countEvent.push({title: holidays[i].memo, start: holiday_date.toUTCString(), end: holiday_date_end, allDay: true, className: "calendarHoliday", color: "#E83131"});
                        }

                    var absentDays = $rootScope.absentDays;
                    if (!angular.isUndefined(absentDays.length))
                        for (var i = 0; i < absentDays.length; i++) {
                            if (!isHoliday(absentDays[i].the_date)) {
                                var absent_date = new Date(absentDays[i].the_date),
                                        absent_date_end = new Date(absent_date.getFullYear(), absent_date.getMonth(), absent_date.getDate(), absent_date.getHours() + 1),
                                        absent_title = absentDays[i].unit_name;
                                if ($rootScope.currentServers.length > 1)
                                    absent_title = absentDays[i].hosp_short_name + " / " + absentDays[i].unit_name;
                                countEvent.push({title: absent_title, start: absent_date.toUTCString(), end: absent_date_end, allDay: true, className: "calendarAbsent", color: "#5F615D"});
                            }
                        }
                    console.log(absentDays);

                    function isHoliday(date) {
                        if (!angular.isUndefined(holidays.length))
                            for (var i = 0; i < holidays.length; i++) {
                                if (date === holidays[i].the_date)
                                    return true;
                            }
                        return false;
                    }
                    return countEvent;
                },
                /**
                 * Refreshes all the reservations between the start date and end date
                 * 
                 * @returns {undefined}
                 */
                refresh: function() {
                    console.log("refresh");
                    $rootScope.refresh = true;
                    $rootScope.refreshCounter = 0;
                    $rootScope.searchType = '';
                    $rootScope.startDate = new Date($rootScope.searchRangeStart);
                    $rootScope.endDate = new Date($rootScope.searchRangeEnd);


                    $rootScope.searchString = $rootScope.user + 'Reservations';

                    //var index = 0;
                    var allReservations = [];
                    var index = 0;

                    var self = this;
                    var firstCycle = true;

                    getReservations(index);

                    function getReservations(index) {
                        var server = $rootScope.currentServers[index];
                        $rootScope.searchUnits = [];
                        hospiviewFactory.getUnitAndDepList(server.uuid, 1, server.hosp_url)
                                .then(function(response) {
                                    return self.setSearchUnits(response, server);
                                }, error).then(function(server) {
                            return self.searchReservations(server);
                        }, error).then(function(reservations) {
                            addReservations(reservations);
                        }, error);
                    }

                    function addReservations(reservations) {
                        console.log("adding");
                        if (reservations !== undefined) {
                            for (var r = 0; r < reservations.length; r++) {
                                reservations[r].hosp_short_name = $rootScope.currentServers[index].hosp_short_name;
                                allReservations.push(reservations[r]);
                            }
                        }
                        if (index + 1 === $rootScope.currentServers.length) {
                            setReservations(allReservations);
                        } else {
                            index++;
                            getReservations(index);
                        }
                    }

                    function setReservations() {
                        console.log(allReservations);

                        if (allReservations.length !== 0) {
                            $rootScope[$rootScope.searchString] = [];
                            for (var i = 0; i < allReservations.length; i++)
                                $rootScope[$rootScope.searchString].push(allReservations[i]);
                            $rootScope.$emit('setReservationsEvent', {});

                            $rootScope.refresh = false;
                            $rootScope.searchInProgress = false;
                        }

                        if (allReservations.length === 0) {
                            $rootScope.isOffline = true;
                            alert($rootScope.getLocalizedString('uuidExpiredMessage'));
                        }
                    }
                }
            };
        }).factory('languageFactory', function(hospiviewFactory, $q, $rootScope) {
    /**
     * Gets a language string from a given array using its PID in combination with its SID
     * 
     * @param {type} langArray
     * @param {type} pid
     * @param {type} sid
     * @returns {Array|_L164.getStringByPidSid.langString}
     */
    function getStringByPidAndSid(langArray, pid, sid) {
        for (var i = 0; i < langArray.length; i++) {
            if (langArray[i].pid == pid && langArray[i].sid == sid)
                return langArray[i].string;
        }
    }
    return{
        /**
         * Loads the language strings from remote data
         * 
         * @param {type} hosp_url
         * @returns {unresolved}
         */
        initRemoteLanguageStrings: function(hosp_url) {
            var listOfPidsSids = "-99,44,48;91,56;92,7,75,90,96;93,43,55,56,57,60;94,10;112,13;204,1,2,3,4,5;205,1,2,4,5;206,1;207,1;208,1,2,7,8,9,15,16;209,1,3,4,5,6;211,1;214,1,2,3,5,6,7",
                    promises = [],
                    defer = $q.defer();

            for (var i = 1; i < 4; i++) {
                promises.push(hospiviewFactory.getLanguageStrings(i, listOfPidsSids, hosp_url));
            }

            $q.all(promises).then(function(responses) {
                for (var j = 0; j < responses.length; j++) {
                    var json = parseJson(responses[j]),
                            languageString = json.LanguageStrings.Detail.LanguageString;

                    if (json.LanguageStrings.Header.StatusCode === "1") {
                        var remoteDict = {
                            reg_no: getStringByPidAndSid(languageString, -99, 44),
                            doctor: getStringByPidAndSid(languageString, -99, 48),
                            patientAppointmentsViewDate: getStringByPidAndSid(languageString, 92, 7),
                            createAppointmentStep2Error: getStringByPidAndSid(languageString, 92, 75),
                            department: getStringByPidAndSid(languageString, 92, 90),
                            createAppointmentStep4Referring: getStringByPidAndSid(languageString, 92, 96),
                            createAppointmentNotDetermined: getStringByPidAndSid(languageString, 93, 43),
                            createAppointmentSection: getStringByPidAndSid(languageString, 93, 55),
//                            createAppointmentCampus: getStringByPidAndSid(languageString, 93, 56), //This string is made local
                            createAppointmentDoctor: getStringByPidAndSid(languageString, 93, 57).split('/')[0],
                            createAppointmentStep2ReservationInfo: getStringByPidAndSid(languageString, 93, 60),
                            createAppointmentType: getStringByPidAndSid(languageString, 94, 10),
                            patientAppointmentsViewTijdstip: getStringByPidAndSid(languageString, 112, 13),
                            createAppointmentGreeting: getStringByPidAndSid(languageString, 204, 1),
                            createAppointmentInfo: getStringByPidAndSid(languageString, 204, 2),
                            createAppointmentMakeChoice: getStringByPidAndSid(languageString, 204, 3),
                            createAppointmentRequest: getStringByPidAndSid(languageString, 204, 4),
                            createAppointmentView: getStringByPidAndSid(languageString, 204, 5),
                            createAppointmentStep1: getStringByPidAndSid(languageString, 205, 1),
                            createAppointmentStep1Info: getStringByPidAndSid(languageString, 205, 2),
                            createAppointmentNext: getStringByPidAndSid(languageString, 205, 4),
                            createAppointmentStep1Error: getStringByPidAndSid(languageString, 205, 5),
                            createAppointmentStep4: getStringByPidAndSid(languageString, 207, 1),
                            createAppointmentStep4Info: getStringByPidAndSid(languageString, 208, 2),
                            createAppointmentStep4Gendre: getStringByPidAndSid(languageString, 208, 7),
                            createAppointmentStep4Male: getStringByPidAndSid(languageString, 208, 8),
                            createAppointmentStep4Female: getStringByPidAndSid(languageString, 208, 9),
//                            createAppointmentStep4Phone: getStringByPidAndSid(languageString, 208, 15), this string is made localy 4 some reason it does not work
                            createAppointmentStep4ExtraInformation: getStringByPidAndSid(languageString, 91, 56),
                            createAppointmentStep4Error: getStringByPidAndSid(languageString, 208, 16),
                            createAppointmentStep5: getStringByPidAndSid(languageString, 208, 1),
                            createAppointmentStep5With: getStringByPidAndSid(languageString, 209, 3),
                            createAppointmentStep5On: getStringByPidAndSid(languageString, 209, 4),
                            createAppointmentStep5At: getStringByPidAndSid(languageString, 209, 5),
                            createAppointmentStep5For: getStringByPidAndSid(languageString, 209, 6),
                            createAppointmentStep5EndCreate: getStringByPidAndSid(languageString, 211, 1),
                            createAppointmentStep2: getStringByPidAndSid(languageString, 214, 1),
                            createAppointmentStep2Info1: getStringByPidAndSid(languageString, 214, 2),
                            createAppointmentStep2Info2: getStringByPidAndSid(languageString, 214, 3),
                            createAppointmentStep2ExtraInfo: getStringByPidAndSid(languageString, 214, 5),
                            createAppointmentPrevious: getStringByPidAndSid(languageString, 214, 6),
                            createAppointmentStep3: getStringByPidAndSid(languageString, 206, 1)
                        };

                        switch (j) {
                            case 0:
                                $rootScope.nlRemoteDict = remoteDict;
                                localStorage.setItem('nlRemoteDict', JSON.stringify(remoteDict));
                                break;
                            case 1:
                                $rootScope.frRemoteDict = remoteDict;
                                localStorage.setItem('frRemoteDict', JSON.stringify(remoteDict));
                                break;
                            case 2:
                                $rootScope.enRemoteDict = remoteDict;
                                localStorage.setItem('enRemoteDict', JSON.stringify(remoteDict));
                                break;
                        }
                        defer.resolve();
                    } else {
                        defer.reject($rootScope.getLocalizedString('internalError'));
                        break;
                    }
                }
            });
            return defer.promise;
        },
        initLocalLanguageStrings: function() {
            var deferred = $q.defer();
            deferred.resolve();
            $rootScope.nlRemoteDict = JSON.parse(localStorage.getItem('nlRemoteDict'));
            $rootScope.frRemoteDict = JSON.parse(localStorage.getItem('frRemoteDict'));
            $rootScope.enRemoteDict = JSON.parse(localStorage.getItem('enRemoteDict'));
            return deferred.promise;
        }

    };
});
