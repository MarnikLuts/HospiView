var dutchStrings = {
        //Login screen
        loginGreeting: "Welkom",
        loginUserSelectDefault: "Selecteer een gebruiker",
        loginServerSelectDefault: "Selecteer een ziekenhuis",
        loginAutomaticallyEnterPassword: "Wachtwoord automatisch invullen?",
        loginUsername: "Gebruikersnaam",
        loginPassword: "Wachtwoord",
        login: "Inloggen",
        loginError: "Fout in de ingevoerde login gegevens.",
        loginPasswordCheckedMessage: "Opgelet! Door uw wachtwoord automatisch te laten invullen kan elke gebruiker van dit toestel inloggen met uw account.",
        loginNoReservationsFound: "Er zijn de volgende 14 dagen geen afspraken gevonden. Wilt u verder zoeken?",
        loginNoConnection: "Er is geen internetconnectie of er kan geen connectie worden gemaakt met de server. Offline kan u nog steeds de laatst opgehaalde afspraken bekijken. Wilt u offline doorgaan?",
        loginServerListFailed: "Inloggen is mislukt op de volgende servers:",
        
        //AppointmentsView
        appointmentsViewReservations: "Afspraken",
        appointmentsViewNoReservations: "Geen afspraken op deze dag.",
        appointmentsViewEndOfDateRange: "Er zijn geen afspraken meer gevonden.",
        
        //AppointmentsCalendar
        appointmentsCalendarToday: "Vandaag",
        appointmentsCalendarWeekends: "Weekends",
        appointmentsCalendarAbsent: "Afwezigheidsdag",
        
        //AppointmentsFilter
        appointmentsFilterMessage: "Stel een filter in. Alle velden zijn optioneel.",
        appointmentsFilterTitle: "Filter",
        appointmentsFilterNoFilter: "Niet filteren",
        appointmentsFilterRemove: "Verwijder filter",
        appointmentsFilterApply: "Voer filter uit",
        appointmentsFilterAllDepartments: "Allemaal",
        appointmentsFilterServer: "Selecteer een server",
        appointmentsFilterUnitOrGroup: "Selecteer een unit of groep",
        appointmentsFilterDepartment: "Selecteer een departement",
        
        //AppointmentDetail
        appointmentDetail: "Reservatie info",
        appointmentDetailPatient: "Patiënt info",
        appointmentDetailDoctor: "Arts: ",
        appointmentDetailDepartment: "Departement: ",
        appointmentDetailId: "Reservatie id: ",
        appointmentDetailTitle: "Titel: ",
        appointmentDetailBooking: "Geboekt door: ",
        appointmentDetailMarking: "Markering(en): ",
        appointmentDetailType: "Type: ",
        appointmentDetailFinal: "definitief",
        appointmentDetailProposal: "voorstel",
        appointmentDetailComment: "Commentaar: ",
        appointmentDetailPatientId: "Patiënt id: ",
        appointmentDetailPatientName: "Naam en voornaam: ",
        appointmentDetailPatientNational: "Rijksregisternummer: ",
        
        //Selectserver/new
        newGreeting: "Welkom bij Hospiview",
        newInfo: "Selecteer de zorginstelling waarmee u verbinding wil maken:_"
                +"Om onze demoserver te gebruiken selecteer \"Agendaview Demo\" en gebruik de volgende login gegevens:_"
                +"Gebruikersnaam:_apple-user_"
                +"Wachtwoord:_apple-user",
        newServerSelectDefault: "Klik hier om te selecteren",
        newServerHasAccount: "Heeft u een account bij deze zorginstelling?",
        newServerEnterAccount: "Geef uw login gegevens in:",
        
        newFunctionSelectDefault: "Selecteer een functie",
        
        newUserEnterDetails: "Geef volgende gegevens in om een account aan te vragen:",
        
        newFunctionPatient: "Patiënt",
        newFunctionRepresentative: "Vertegenwoordiger",
        newFunctionHouseDoctor: "Huisarts",
        newFunctionDoctor: "Arts",
                
        newUserFirstName: "Voornaam",
        newUserLastName: "Achternaam",
        newUserDateOfBirth: "Geboortedatum",
        newUserEmail: "E-mailadres",
        newUserEmailConfirm: "Bevestig uw E-mailadres",
        newUserNatReg: "Rijksregisternummer",
        newUserFirm: "Firma",
        newUserRiziv: "RIZIV nummer",
        newUserNoKiosk: "Deze zorginstelling heeft ervoor gekozen om patiënten momenteel geen afspraken te laten maken via deze app. Hierdoor kan u zich niet registreren",
        
        //Selectserver/new validation
        newUserDateIncorrect: "Geboortedatum moet volgend formaat hebben:",
        newUserEmailIncorrect: "E-mailadres heeft een fout formaat.",
        newUserEmailConfirmRequired: "E-mail bevestigen is verplicht",
        newUserEmailConfirmIncorrect: "E-mailadressen komen niet overeen.",
        newUserNatRegIncorrect: "Rijksregisternummer is niet correct.",
        newUserRizivIncorrect: "RIZIV nummer is niet correct.",
        newUserRequest: "Vraag account aan",
        newUserRequestMessage: "U ontvangt dadelijk een email met uw logingegevens.",
        
        //Validation
        isRequired: "Dit veld is verplicht.",        
        and: "en",
        mustBeNumber: "moet een nummer zijn",
        
        //general app use
        settings: "Instellingen",
        filter: "Filter",
        back: "Terug",
        logout: "Uitloggen",
        yes: "Ja",
        no: "Nee",
        cancel: "annuleer",
        wait: "Even geduld a.u.b.",
        
        //Connection messages
        internalError: "Interne fout in de server.",
        connectionError: "Kan geen verbinding maken met de server.",
        uuidExpiredMessage: "Uw login tijd is verlopen of u bent op een ander mobile toestel ingelogd. U bent nu in offline mode.",
        
        //Settings
        settingsNew: "Dit zijn de instellingen, hier kan u nieuwe gebruikers en servers toevoegen.\n\nOm uit dit scherm te gaan klik op 'Terug'.",
        settingsSave: "Opslaan",
        settingsAddServer: "Voeg server toe",
        settingsEditServer: "Wijzig server",
        settingsUser: "Gebruiker",
        settingsRefresh: "Verversing",
        settingsRefreshUnit: "seconden",
        settingsAddDelete: "Toevoegen of verwijderen",
        settingsEditDelete: "Wijzigen of verwijderen",
        settingsCellcontent: "Reservatie instellingen",
        settingsPatient: "Patiënt",
        settingsTitle: "Titel",
        settingsDepartment: "Departement",
        settingsAddUser: "Voeg applicatiegebruiker toe",
        settingsServerSettings: "Server instellingen",
        settingsApplicationSettings: "Applicatie instellingen",
        settingsUserSettings: "Gebruiker instellingen",
        settingsLanguage: "Taal",
        settingsRefreshMin: "Minimum 30",
        settingsRefreshMax: "Maximum 7200",
        settingsRefreshDecimal: "Mag geen komma getal zijn",
        settingsDeleteServer: "Verwijder server",
        settingsDeleteCurrentUser: "Verwijder gebruiker",
        settingsDeleteServerConfirm: "Weet u zeker dat u de geselecteerde server wil verwijderen?",
        settingsDeleteCurrentUserConfirm: "Weet u zeker dat u de huidige gebruiker wil verwijderen?"
};
