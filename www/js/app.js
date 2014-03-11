'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'ngTouch',
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
        run(function() {
            FastClick.attach(document.body);
        });
//angular.module('myModule',['ui.bootstrap']);