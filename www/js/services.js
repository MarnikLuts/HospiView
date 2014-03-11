'use strict';

/* Services */

angular.module('myApp.services', []).
        
        /**
         * Variable containing the base url.
         */
        constant('base_url', 'cfcs/webservices/reservations_service.cfc?').
                
        /**
         * Factory containing methods for the different requests.
         * 
         * @param {type} $http
         * @param {type} base_url
         * @returns {_L13.Anonym$1}.
         */
        factory('hospiviewFactory', function($http, base_url) {
            return{
                getHospiViewServerList: function() {
                    return $http.post("http://agendaviewtest.agendaview.be/cfcs/webservices/agendaview/hospiview_servers.cfc?method=GetHospiviewServerList"); /*http://agenda.agendaview.be/cfcs/webservices/agendaview/hospiview_servers.cfc?method=GetHospiviewServerList*/
                },
                getAuthentication: function(username, password, server_url) {
                    return $http.post(server_url + base_url + "method=GetAuthentication&user_login=" + username + "&user_password=" + password);
                },
                getUnitAndDepList: function(uuid, server_url) {
                    return $http.post(server_url + base_url + "method=GetUnitAndDepList&UUID=" + uuid);
                },
                getUnitDepGroups: function(uuid, server_url) {
                    return $http.post(server_url + base_url + "method=getUnitDepGroups&UUID=" + uuid);
                },
                getReservationsOnUnit: function(uuid, unit_id, dep_id, start_date, end_date, server_url) {
                    return $http.post(server_url + base_url + "method=GetReservationsOnUnit&UUID=" + uuid + "&unit_id=" + unit_id + "&dep_id=" + dep_id + "&start_date=" + start_date + "&end_date=" + end_date);
                },
                getReservationsOnPatient: function(uuid, pid_or_regno, patsearchvar, start_date, end_date, server_url) {
                    return $http.post(server_url + base_url + "method=GetReservationsOnPatient&UUID=" + uuid + "&pid_or_regno=" + pid_or_regno + "&patsearchvar=" + patsearchvar + "&start_date=" + start_date + "&end_date=" + end_date);
                }
                
            };
        });