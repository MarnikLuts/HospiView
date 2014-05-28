'use strict';

/* Directives */

/**
 * Directives are used to give HTML elements, attributes,... certain behaviour.
 * retrict: 'A' means it can only be used as an attribute.
 * require: indicaties what the directive depends on. 
 * link: function that will be execute if the prerequisites are correct fulfilled.
 */

angular.module('myApp.directives', []).
        /**
         * This directive is used by adding "checknational" to an HTML element.
         * In other words, checknational is an attribute of an element.
         * The directive is used to check if the national number is valid and
         * is the correct national number for the given date of birth.
         * require: The directive is going to search for ngModel in the HTML 
         *          element, otherwise it will throw an error.
         * link: the scope is the scope of the controller this directive is used.
         *       userFunctionSelect is used during step 4 when creating an appointment.
         *       In this step, doctors can toggle wether a national number is passed
         *       or not. If userFunctionSelect model is declared in the scope, the
         *       check for national number will only be executed if the doctor
         *       wants to enter a national number.
         *       $watch is used to watch any changes in the models. If any changes
         *       hebben, the check is executed again.
         *       The needed checks on the national number will be done. If it passes
         *       the checks, the validity of checknational will be set to true,
         *       meaning it passes the validation of the form it is used in.
         */
        directive('checknational', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    if (scope.userFunctionSelect)
                        scope.$watch('userFunctionSelect', validate);
                    scope.$watch('dateOfBirth', validate);
                    scope.$watch('nationalRegister', validate);
                    scope.$watch('disableRegno', validate);
                    function validate(value) {

                        if (scope.disableRegno) {
                            ctrl.$setValidity('checknational', true);
                        }

                        if (scope.userFunctionSelect)
                            var userFunction = scope.userFunctionSelect;
                        if (scope.userFunctionSelect && !scope.needsNationalReg(userFunction)) {
                            ctrl.$setValidity('checknational', true);
                        } else if (typeof scope.dateOfBirth !== "undefined") {
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
        }).
        /**
         * Checks if the first email address entered by the user is the same
         * as the second one.
         * require: The directive is going to search for ngModel in the HTML 
         *          element, otherwise it will throw an error.
         * link: first gets the value of the attribute confirmemail and add a #.
         *       The value is the value the id attribute of the element of the first
         *       email address.
         *       Now that we have the id of the element containt the first email address, 
         *       we add a keyup listener, so the check happens when the user is changing the value.
         *       emailmatch will be set to true if the two email addresses are the same.
         *       
         */
        directive('confirmemail', [function() {
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
            }]).
        /**
         * Similar to the nationalreg directive, watches the userFunctionSelect
         * and rizivNumber for changes. If any changes happen, the check will be
         * executed. If the selected function of the user (e.g. patient) does
         * not need a riziv number, the check is set to true. If the function does,
         * the check will be executed and the validity of riziv is set to true.
         */
        directive('riziv', function() {
            return{
                restrict: "A",
                require: "ngModel",
                link: function(scope, elm, attrs, ctrl) {
                    scope.$watch('userFunctionSelect', validate);
                    scope.$watch('rizivNumber', validate);
                    function validate(value) {
                        var userFunction = scope.userFunctionSelect;
                        if (!scope.needsRiziv(userFunction)) {
                            ctrl.$setValidity('riziv', true);
                        } else {
                            var rizivNumber = scope.rizivNumber;
                            var isNum = /^\d+$/.test(rizivNumber);
                            var isValid = false;

                            if (isNum && rizivNumber.toString().length === 11)
                                isValid = true;

                            ctrl.$setValidity('riziv', isValid);

                        }

                    }
                }
            }
        });

