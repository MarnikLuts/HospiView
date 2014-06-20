var englishStrings = {
        //Login screen
        loginGreeting: "Welcome",
        loginUserSelectDefault: "Choose a user",
        loginServerSelectDefault: "Choose an institution",
        loginAutomaticallyEnterPassword: "Automatically enter password?",
        loginUsername: "Username",
        loginPassword: "Password",
        login: "Log In",
        loginError: "Invalid username or password.",
        loginPasswordCheckedMessage: "Attention! By automatically entering your password every user of this device can log in with your account.",
        loginNoReservationsFound: "There are no appointments found in the next 14 days. Would you like to continue searching?",
        loginNoConnection: "There is no internet connection or a connection to the server can't be made. Offline you can still view the appointments from the last time you logged in. Would you like to continue offline?",
        loginServerListFailed: "Login failed on the following servers:",
        
        //AppointmentsView
        appointmentsViewReservations: "Appointments",
        appointmentsViewNoReservations: "No appointments.",
        appointmentsViewEndOfDateRange: "There are no more appointments.",
        
        //patient/appointmentsView
        appointmentsViewPatientNoConnection: "There is no internet connection or a connection to the server can't be made. You are now in offline mode.",
        appointmentsViewPatientNoConnectionCreateAppointment: "There is no internet connection or a connection to the server can't be made. To create an appointment, you need internetconnection. Please try again when you have internetconnection.",
        
        //AppointmentsCalendar
        appointmentsCalendarToday: "Today",
        appointmentsCalendarWeekends: "Weekends",
        appointmentsCalendarAbsent: "Day Off",
        
        //AppointmentsFilter
        appointmentsFilterMessage: "Set a filter. All fields are optional.",
        appointmentsFilterTitle: "Filter",
        appointmentsFilterNoFilter: "No filter",
        appointmentsFilterRemove: "Remove filter",
        appointmentsFilterApply: "Apply filter",
        appointmentsFilterAllDepartments: "All",
        appointmentsFilterServer: "Select a server",
        appointmentsFilterUnitOrGroup: "Select a unit or group",
        appointmentsFilterDepartment: "Select a department",
        
        //AppointmentDetail
        appointmentDetail: "Appointment info",
        appointmentDetailPatient: "Patient info",
        appointmentDetailDepartment: "Department ",
        appointmentDetailId: "Appointment id ",
        appointmentDetailTitle: "Title ",
        appointmentDetailBooking: "Booked by ",
        appointmentDetailMarking: "Marking ",
        appointmentDetailType: "Type ",
        appointmentDetailFinal: "final",
        appointmentDetailProposal: "proposal",
        appointmentDetailComment: "Comment ",
        appointmentDetailPatientId: "Patient id ",
        appointmentDetailPatientName: "Name ",
        appointmentDetailDate: "Date",
        
        //Selectserver/new
        newGreeting: "Welcome to HospiView",
        newInfo: "Select the institution you want to connect with:_"
                +"To use our demoserver, select \"Agendaview Demo\" and use the following credentials:_"
                +"Username:_apple-user_"
                +"Password:_apple-user",
        newServerSelectDefault: "Click here to select",
        newServerHasAccount: "Do you have an account with this institution?",
        newServerEnterAccount: "Enter your login details:",
        
        newFunctionSelectDefault: "Select a function",
        
        newUserEnterDetails: "Enter the following details to request an account:",
        
        newFunctionPatient: "Patient",
        newFunctionRepresentative: "Representative",
        newFunctionHouseDoctor: "House doctor",
        newFunctionDoctor: "Doctor",
        
        newUserFirstName: "First name",
        newUserLastName: "Last name",
        newUserDateOfBirth: "Date of birth",
        newUserEmail: "Email address",
        newUserEmailConfirm: "Confirm your Email address",
        newUserNatReg: "National register number",
        newUserFirm: "Firm",
        newUserRiziv: "RIZIV number",
        newUserNoKiosk: "This health institution has chosen not to allow patients to make appointments using this app. Therefore you can't register.",
        newUserNoAccountCreation: "Function not yet available in this version of the App.",
        
        //Selectserver/new validation
        newUserDateIncorrect: "Date of birth must have the following format:",
        newUserEmailIncorrect: "Email address has a wrong format.",
        newUserEmailConfirmRequired: "Confirming your email address is required",
        newUserEmailConfirmIncorrect: "Email addresses do not match.",
        newUserNatRegIncorrect: "National register number does not match birthday.",
        newUserRizivIncorrect: "RIZIV number is not correct.",
        newUserRequest: "Request account",
        newUserRequestMessage: "You will recieve an email with your login details shortly.",
        newUserFunctionNotSupported: "You must call the institution to request a username and password",
        
        //Validation
        isRequired: "This field is required",
        and: "and",
        mustBeNumber: "Has to be a number",
        
        //general app use
        settings: "Settings",
        back: "Back",
        filter: "Filter",
        logout: "Log Out",
        yes: "Yes",
        no: "No",
        cancel: "cancel",
        wait: "Please wait...",
        tooManyReservations: "Your account bound to a lot of appointments. This amount of appointments can't be saved local so the offline mode of this application won't work for your account. The application will also be a little bit slower.",
        or: "OR",
        
        //Connection messages
        internalError: "Internal server error.",
        connectionError: "Cannot connect to the server.",
        connectionErrorRetrievingAppointments: "Cannot connect to the server. Please try again later",
        connectionErrorSelectServer: "Cannot connect to the server. If you have internet connection, press the refreshbutton to get all servers.",
        uuidExpiredMessage: "Your login time is expired or you are logged in on another mobile device. You are now in offline mode.",
                
        //Settings
        settingsNew: "These are the settings, here you can add new users and servers.\n\nTo exit this screen press 'Back' on top of the screen.",
        settingsSave: "Save",
        settingsAddServer: "Add server",
        settingsEditServer: "Edit server",
        settingsUser: "User",
        settingsRefresh: "Refresh rate",
        settingsRefreshUnit: "sec",
        settingsAddDelete: "Add or delete",
        //settingsAddDelete: "Add, edit or delete",
        settingsEditDelete: "Edit or delete",
        settingsCellcontent: "Appointment settings",
        settingsPatient: "Patient",
        settingsTitle: "Title",
        settingsDepartment: "Department",
        settingsAddUser: "Add application user",
        settingsServerSettings: "Server settings",
        settingsApplicationSettings: "Application settings",
        settingsUserSettings: "User settings",
        settingsLanguage: "Language",
        settingsRefreshMin: "Minimum 30",
        settingsRefreshMax: "Maximum 7200",
        settingsRefreshDecimal: "Maximum 7200 and has to be decimal",
        settingsDeleteServer: "Delete server",
        settingsDeleteCurrentUser: "Delete user",
        settingsDeleteServerConfirm: "Are you sure you want to delete the selected server?",
        settingsDeleteCurrentUserConfirm: "Are you sure you want to delete the current user?",
        settingsChangeName: "Change name",
        settingsChangeEmail: "Change email address",
        
        //patient/mainmenu
        notAvailableInOffline: "This feature is not available in offline mode.",
        
        //patient/patientAppointmentsView
        patientAppointmentsViewNoReservations: "You don't have any appointments the next 90 days.",
        patientAppointmentsViewType: "Appointment Type",
        patientAppointmentsViewUnit: "With",
        patientAppointmentsViewFacility: "Institution",
        
        //patient/step1
        createAppointmentStep1Server: "Institution",
        createAppointmentStep1SelectDoctor: "Select a doctor",
        createAppointmentStep1SelectSection: "Select a section",
                
        //patient/step2
        createAppointmentStep2SelectType: "Choose a type",
        createAppointmentStep2ExtraInfoPlaceholer: "Indien u nog iets aan de arts wil meegeven over de afspraak kan u dit hier doen.",
                
        //patient/step3
        createAppointmentStep3Morning: "morning",
        createAppointmentStep3Afternoon: "afternoon",
        createAppointmentStep3MorningShort: "AM",
        createAppointmentStep3AfternoonShort: "PM",
        createAppointmentStep3Selected: "You selected this appointment:",
        createAppointmentStep3SelectDate: "start date",
        createAppointmentCampus: "Location",
                
        //patient/step4
        createAppointmentStep4MakeYourChoice: "make your choice",
        createAppointmentStep4FieldsRequired: "* indicates required fields",
        createAppointmentStep4FirstName: "First name",
        createAppointmentStep4LastName: "Last name",
        createAppointmentStep4Phone: "Telephone 1",
        createAppointmentStep4Phone2: "Telephone 2",
        createAppointmentStep4Street: "Street",
        createAppointmentStep4HouseNumber: "House number",
        createAppointmentStep4PostalCode: "Postal code",
        createAppointmentStep4Town: "Town",
        createAppointmentStep4Country: "Country",
        createAppointmentStep4GenderNotDetermined: "U",
        createAppointmentStep4UnknownRegno: "Unknown national register number",
        
        //patient/step5
        createAppointmentStep5Info: "You can find your appointment if you click on the \"Look at appointments\" button in the main menu",
        createAppointmentStep5Thanks: " thanks you for using this app",
        createAppointmentStep5End: "End",
        createAppointmentStep5AtLocation: "at"
};
