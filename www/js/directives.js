'use strict';

/* Directives */


angular.module('myApp.directives', []).
        directive('checknational', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    scope.$watch('dateOfBirth', validate);
                    scope.$watch('nationalRegister', validate);
                    function validate(value) {
                        if (typeof scope.dateOfBirth !== "undefined") {
                            var nationalRegisterNumber = scope.nationalRegister;
                            var dateOfBirth = scope.dateOfBirth;
                            var nrYear = dateOfBirth.toString().substr(6, 4);
                            var nrMonth = dateOfBirth.toString().substr(3, 2);
                            var nrDay = dateOfBirth.toString().substr(0, 2);
                            var nrModuloNumber = nationalRegisterNumber.toString().substring(0, 9);
                            if (parseInt(nrYear) >= 2000) {
                                nrModuloNumber = "2" + nrModuloNumber;
                            }

                            var nrRest = nrModuloNumber % 97;
                            var nrCheckCalculatedNumber = 97 - nrRest;
                            var nrCheckNumberString = nationalRegisterNumber.toString().substr(9, 2);
                            var nrCheckNumber = parseInt(nrCheckNumberString);
                            if (nrCheckCalculatedNumber == nrCheckNumber &&
                                    nrYear.substring(2, 4) == nationalRegisterNumber.toString().substr(0, 2) &&
                                    nrMonth == nationalRegisterNumber.toString().substr(2, 2) &&
                                    nrDay == nationalRegisterNumber.toString().substr(4, 2)) {
                                ctrl.$setValidity('checknational', true);
                            } else {
                                ctrl.$setValidity('checknational', false);
                            }
                            return value;
                        }
                        else {
                            ctrl.$setValidity('checknational', false);
                        }
                    }
                    ;
                }
            };
        }).directive('confirmemail', [function() {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ctrl) {
                var firstemail = '#' + attrs.confirmemail;
                elem.add(firstemail).on('keyup', function() {
                    scope.$apply(function() {
                        ctrl.$setValidity('emailmatch', elem.val() === $(firstemail).val());
                    });
                });
            }
        };
    }]).directive('formwrapper', function() {
    return {
        restrict: "E",
        scope: {
            oncheck: '='
        }
    };
});

