'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'ngTouch',
    'ngAnimate',
    'ngResource',
    'ui.bootstrap',
    'ui.calendar'
]).
        config(['$routeProvider', function($routeProvider) {
                $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
                $routeProvider.when('/mainmenu', {templateUrl: 'partials/mainmenu.html', controller: 'MainmenuCtrl'});
                $routeProvider.when('/doctor/appointmentsSearch', {templateUrl: 'partials/doctor/appointmentsSearch.html', controller: 'DoctorSearchAppointmentsCtrl'});
                $routeProvider.when('/doctor/appointmentsView', {templateUrl: 'partials/doctor/appointmentsView.html', controller: 'DoctorViewAppointmentsCtrl'});
                $routeProvider.when('/doctor/appointmentDetail', {templateUrl: 'partials/doctor/appointmentDetail.html', controller: 'DoctorViewappointmentDetailCtrl'});
                $routeProvider.when('/patient/appointmentsPatient', {templateUrl: 'partials/patient/appointmentsPatient.html', controller: 'PatientViewAppointmentsCtrl'});
                $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'});
                $routeProvider.when('/selectserver/:action', {templateUrl: 'partials/selectserver.html', controller: 'SelectserverCtrl'});
                $routeProvider.when('/appointmentsCalendar', {templateUrl: 'partials/doctor/appointmentsCalendar.html', controller: 'DoctorViewAppointmentsCalendarCtrl'});
                
                $routeProvider.otherwise({redirectTo: '/login'});
            }]).
        run(function($rootScope) {
            FastClick.attach(document.body);
            
            //default languageID
            $rootScope.languageID = 3;
            /**
            * Gets a language string from one of the loaded language files
            * 
            * languageID:
            * 1 for Dutch
            * 2 for French
            * 3 for English
            * 
            * @param {type} languageID
            * @param {type} key
            * @returns {_L164.enDict|enDict|_L164.frDict|frDict|_L164.nlDict|nlDict}
            */
           $rootScope.getLocalizedString=function(key){
               switch($rootScope.languageID){
                   case 1:
                        if(key in getDutchLanguageStrings())
                            return getDutchLanguageStrings()[key];
                        else
                            return $rootScope.nlRemoteDict[key];
                   case 2:
                       if(key in getFrenchLanguageStrings())
                            return getFrenchLanguageStrings()[key];
                        else
                            return $rootScope.frRemoteDict[key];
                   case 3:
                       if(key in getEnglishLanguageStrings())
                            return getEnglishLanguageStrings()[key];
                        else
                            return $rootScope.enRemoteDict[key];
               }
           };
        });
//angular.module('myModule',['ui.bootstrap']);
