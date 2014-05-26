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
        
        //patient/appointmentsView
        appointmentsViewPatientNoConnection: "Er is geen internetconnectie of er kan geen connectie worden gemaakt met de server. U bent nu in offline modus.",
        appointmentsViewPatientNoConnectionCreateAppointment: "Er is geen internetconnectie of er kan geen connectie worden gemaakt met de server. U heeft connectie nodig om een afspraak te maken. Probeer opnieuw als u internetconnectie heeft.",
        
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
        appointmentDetail: "Afspraak info",
        appointmentDetailPatient: "Patiënt info",
        appointmentDetailDepartment: "Departement ",
        appointmentDetailId: "Afspraak id ",
        appointmentDetailTitle: "Titel ",
        appointmentDetailBooking: "Geboekt door ",
        appointmentDetailMarking: "Markering(en) ",
        appointmentDetailType: "Type ",
        appointmentDetailFinal: "definitief",
        appointmentDetailProposal: "voorstel",
        appointmentDetailComment: "Commentaar ",
        appointmentDetailPatientId: "Patiënt id ",
        appointmentDetailPatientName: "Naam en voornaam ",
        appointmentDetailDate: "Datum",
        
        //Selectserver/new
        newGreeting: "Welkom bij HospiView",
        newInfo: "Selecteer de instelling waarmee u verbinding wil maken:_"
                +"Om onze demoserver te gebruiken selecteer \"Agendaview Demo\" en gebruik de volgende login gegevens:_"
                +"Gebruikersnaam:_apple-user_"
                +"Wachtwoord:_apple-user",
        newServerSelectDefault: "Klik hier om te selecteren",
        newServerHasAccount: "Heeft u een account bij deze instelling?",
        newServerEnterAccount: "Geef uw login gegevens in:",
        
        newFunctionSelectDefault: "Selecteer een functie",
        
        newUserEnterDetails: "Geef volgende gegevens in om een account aan te vragen:",
        
        newFunctionPatient: "Patiënt",
        newFunctionRepresentative: "Vertegenwoordiger",
        newFunctionHouseDoctor: "Huisarts",
        newFunctionDoctor: "Dokter",
                
        newUserFirstName: "Voornaam",
        newUserLastName: "Achternaam",
        newUserDateOfBirth: "Geboortedatum",
        newUserEmail: "E-mailadres",
        newUserEmailConfirm: "Bevestig uw E-mailadres",
        newUserNatReg: "Rijksregisternummer",
        newUserFirm: "Firma",
        newUserRiziv: "RIZIV nummer",
        newUserNoKiosk: "Deze instelling heeft ervoor gekozen om patiënten momenteel geen afspraken te laten maken via deze app. Hierdoor kan u zich niet registreren.",
        newUserNoAccountCreation: "Functie nog niet beschikbaar in deze versie van de app.",
        
        //Selectserver/new validation
        newUserDateIncorrect: "Geboortedatum moet volgend formaat hebben:",
        newUserEmailIncorrect: "E-mailadres heeft een fout formaat.",
        newUserEmailConfirmRequired: "E-mail bevestigen is verplicht",
        newUserEmailConfirmIncorrect: "E-mailadressen komen niet overeen.",
        newUserNatRegIncorrect: "Rijksregisternummer is niet correct.",
        newUserRizivIncorrect: "RIZIV nummer is niet correct.",
        newUserRequest: "Vraag account aan",
        newUserRequestMessage: "U ontvangt dadelijk een e-mail met uw logingegevens.",
        
        //Validation
        isRequired: "Dit veld is verplicht.",        
        and: "en",
        mustBeNumber: "Moet een nummer zijn",
        
        //general app use
        settings: "Instellingen",
        filter: "Filter",
        back: "Terug",
        logout: "Uitloggen",
        yes: "Ja",
        no: "Nee",
        cancel: "annuleer",
        wait: "Even geduld a.u.b.",
        tooManyReservations: "Uw account is gebonden aan heel veel afspraken. Deze kunnen niet lokaal opgeslagen worden dus de offline modus van deze applicatie werkt niet voor uw account. Ook zal de applicatie iets trager werken.",
        or: "OF",
        
        //Connection messages
        internalError: "Interne fout in de server.",
        connectionError: "Kan geen verbinding maken met de server.",
        connectionErrorRetrievingAppointments: "Kan geen verbinding maken met de server. Probeer later opnieuw.",
        connectionErrorSelectServer: "Kan geen verbinding maken met de server. Indien u internetconnectie heeft, gebruik dan de refreshknop om de lijst van servers op te halen.",
        uuidExpiredMessage: "Uw login tijd is verlopen of u bent op een ander mobile toestel ingelogd. U bent nu in offline mode.",
        
        //Settings
        settingsNew: "Dit zijn de instellingen, hier kan u nieuwe gebruikers en servers toevoegen.\n\nOm uit dit scherm te gaan klik bovenaan op 'Terug'.",
        settingsSave: "Opslaan",
        settingsAddServer: "Voeg server toe",
        settingsEditServer: "Wijzig server",
        settingsUser: "Gebruiker",
        settingsRefresh: "Verversing",
        settingsRefreshUnit: "sec",
        settingsAddDelete: "Toevoegen, wijzigen of verwijderen",
        settingsEditDelete: "Wijzigen of verwijderen",
        settingsCellcontent: "Afspraak instellingen",
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
        settingsRefreshDecimal: "Maximum 7200 toegestaan en mag geen komma getal zijn",
        settingsDeleteServer: "Verwijder server",
        settingsDeleteCurrentUser: "Verwijder gebruiker",
        settingsDeleteServerConfirm: "Weet u zeker dat u de geselecteerde server wil verwijderen?",
        settingsDeleteCurrentUserConfirm: "Weet u zeker dat u de huidige gebruiker wil verwijderen?",
        settingsChangeName: "Naam wijzigen",
        settingsChangeEmail: "E-mail wijzigen",
        
        //patient/mainmenu
        notAvailableInOffline: "Deze functie is niet beschikbaar in offline mode.",
        
        //patient/patientAppointmentsView
        patientAppointmentsViewNoReservations: "U heeft de volgende 90 dagen geen afspraken.",
        patientAppointmentsViewType: "Type afspraak",
        patientAppointmentsViewUnit: "Bij",
        patientAppointmentsViewFacility: "Instelling",
        
        //patient/step1
        createAppointmentStep1Server: "Ziekenhuis",
        createAppointmentStep1SelectDoctor: "Selecteer een dokter",
        createAppointmentStep1SelectSection: "Selecteer een afdeling",
                
        //patient/step2
        createAppointmentStep2SelectType: "Kies een type",
        createAppointmentStep2ExtraInfoPlaceholer: "Indien u nog iets aan de arts wil meegeven over de afspraak kan u dit hier doen.",
        
        //patient/step3
        createAppointmentStep3Morning: "voormiddag",
        createAppointmentStep3Afternoon: "namiddag",
        createAppointmentStep3MorningShort: "VM",
        createAppointmentStep3AfternoonShort: "NM",
        createAppointmentStep3Selected: "U selecteerde volgende afspraak:",
        createAppointmentStep3SelectDate: "startdatum",
                        
        //patient/step4
        createAppointmentStep4MakeYourChoice: "maak hier uw keuze",
        
        //patient/step4
        createAppointmentStep4FieldsRequired: "Velden met een * zijn verplicht in te vullen",
        createAppointmentStep4FirstName: "Voornaam",
        createAppointmentStep4LastName: "Achternaam",
        createAppointmentStep4Phone2: "Telefoon 2",
        createAppointmentStep4Street: "Straat",
        createAppointmentStep4HouseNumber: "Huisnummer",
        createAppointmentStep4PostalCode: "Postcode",
        createAppointmentStep4Town: "Gemeente",
        createAppointmentStep4Country: "Land",
        createAppointmentStep4GenderNotDetermined: "O",
        
        //patient/step5
        createAppointmentStep5Info: "U kan uw afspraak terugvinden als u op \"Afspraak Bekijken\" drukt in het hoofdmenu",
        createAppointmentStep5Thanks: "dankt u om dit systeem te gebruiken",
        createAppointmentStep5End: "Einde"
};
