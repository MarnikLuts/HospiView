var frenchStrings = {
        //Login screen
        loginGreeting: "Bienvenue",
        loginUserSelectDefault: "Choisissez un utilisatuer",
        loginServerSelectDefault: "Choisissez votre hôpital",
        loginAutomaticallyEnterPassword: "Mémoriser mes codes d'accès",
        loginUsername: "Nom d'utilisateur",
        loginPassword: "Mot de passe",
        login: "Enregistrer",
        loginError: "Le mot de passe et/ou l'email que vous avez saisi est invalide.",
        loginPasswordCheckedMessage: "Attention! Par entrer votre mot de passe automatiquement tous les utilisatuers de l'appareil peuvent enregistrer avec votre codes d'accès.",
        loginNoReservationsFound: "Il n'y a pas de des réservations les 14 jours prochaines. Vous voulez continer à cherchez?",
        loginNoConnection: "Il n'y a pas un connexion avec l'internet ou ce n'est pas possible de connecter avec le serveur. Sans connexions vous pouvez encore regarder les réservations qui sont déjà obtenues. Vous voulez continuer sans connexion?",
        loginServerListFailed: "Enregistration est echouée à les serveurs suivantes:",
        
        //AppointmentsView
        appointmentsViewReservations: "Réservations",
        appointmentsViewNoReservations: "Pas de Réservation",
        appointmentsViewEndOfDateRange: "Il n'ya plus des réservations",
        
        //patient/appointmentsView
        appointmentsViewPatientNoConnection: "Il n'y a pas un connexion avec l'internet ou ce n'est pas possible de connecter avec le serveur. Vous êtes maintenant dans la mode hors-ligne.",
        appointmentsViewPatientNoConnectionCreateAppointment: "Il n'y a pas un connexion avec l'internet ou ce n'est pas possible de connecter avec le serveur. Pour faire une reservation, vous avez besoin d'une connexion d'internet. Essayer à nouveau si vous avez connexion d'internet s'il vous plait.",
        
        //AppointmentsCalendar
        appointmentsCalendarToday: "Aujourd'hui",
        appointmentsCalendarWeekends: "Week-end",
        appointmentsCalendarAbsent: "Jour de congé",
        
        //AppointmentsFilter
        appointmentsFilterMessage: "Règle un filtre. Tous les champs sont optional.",
        appointmentsFilterTitle: "Filtre",
        appointmentsFilterNoFilter: "Aucun filtre",
        appointmentsFilterRemove: "Supprimer le filtre",
        appointmentsFilterApply: "Appliquer le filtre",
        appointmentsFilterAllDepartments: "Tous",
        appointmentsFilterServer: "Choisissez un serveur",
        appointmentsFilterUnitOrGroup: "Choisissez une unité",
        appointmentsFilterDepartment: "Choisissez un département",

        //AppointmentDetail
        appointmentDetail: "Info du réservation",
        appointmentDetailPatient: "Info du patient",
        appointmentDetailDepartment: "Département ",
        appointmentDetailId: "Réservation id ",
        appointmentDetailTitle: "Titre ",
        appointmentDetailBooking: "Réservé par ",
        appointmentDetailMarking: "Marquage(s) ",
        appointmentDetailType: "Type ",
        appointmentDetailFinal: "définitif",
        appointmentDetailProposal: "proposition",
        appointmentDetailComment: "Commentaire ",
        appointmentDetailPatientId: "Id patient ",
        appointmentDetailPatientName: "Nom ",
        appointmentDetailDate: "Date",
        
        //Selectserver/new
        newGreeting: "Bienvenue chez HospiView",
        newInfo: "Selectionez l'institution vous voulez vous connecter:_"
                +"Om onze demoserver te gebruiken selecteer \"Agendaview Demo\" en gebruik de volgende login gegevens:_"
                +"Gebruikersnaam:_apple-user_"
                +"Wachtwoord:_apple-user",
        newServerSelectDefault: "Choisissez un serveur",
        newServerHasAccount: "Avez-vous un compte chez l'institution?",
        newServerEnterAccount: "Entrez vos données de connexion:",
                
        newFunctionSelectDefault: "Selectionez une fonction",
        
        newFunctionPatient: "Patient",
        newFunctionRepresentative: "Représentant",
        newFunctionHouseDoctor: " Médecin de famille",
        newFunctionDoctor: "Médecin",
        
        newUserEnterDetails: "Donnez les données suivante pour demander un compte:",
        
        newUserFirstName: "Prénom",
        newUserLastName: "Nom",
        newUserDateOfBirth: "Date de né",
        newUserEmail: "Courrier",
        newUserEmailConfirm: "Confirmer votre courrier",
        newUserNatReg: "Numéro de registre national",
        newUserFirm: "Entreprise",
        newUserRiziv: "Numéro INAMI",
        newUserNoKiosk: "Cette institution de santé a choisi de ne pas permettre aux patients de fixer un rendez-vous en utilisant cette app. Ainsi vous ne pouvez pas enregistrer.",
        newUserNoAccountCreation: "Fonction n'est pas encore disponible dans cette version de l'App.",
        
        //Selectserver/new validation
        newUserDateIncorrect: "La date de naissance doit être ce format: ",
        newUserEmailIncorrect: "Le courrier n'a pas le format correct.",
        newUserEmailConfirmRequired: "Vous devez confirmer votre courrier",
        newUserEmailConfirmIncorrect: "Les courriers ne sont pas la même.",
        newUserNatRegIncorrect: "Numéro de registre national n'est pas correct.",
        newUserRizivIncorrect: "Nombre de RIZIV n'est pas correct.",
        newUserRequest: "Demandez un compte",
        newUserRequestMessage: "Vous aurez reçu un courrier avec vos données de connextion.",
        
        //Validation
        isRequired: "Ce champ est obligatoire",
        and: "et",
        mustBeNumber: "Doit être un nombre",
        
        //general app use
        settings: "Paramètres",
        back: "Retour",
        filter: "Filter",
        logout: "Quitter",
        yes: "Oui",
        no: "Non",
        cancel: "annuler",
        wait: "Un instant s'il vous plaît...",
        tooManyReservations: "Votre compte a lié a beaucoup de reservations. Cettes reservations ne peuvent pas être conservé donc la mode hors-ligne de l'application ne marche pas pour votre compte. L'application va aussi marcher un petit peut plus lente.",
        or: "OU",
        
        //Connection messages
        internalError: "Erreur interne du serveur.",
        connectionError: "Erreur de connexion.",
        connectionErrorRetrievingAppointments: "Erreur de connexion. Réessayer plus tard.",
        connectionErrorSelectServer: "Erreur de connexion. Si vous avez connexion internet, utilise le bouton de rafraichir pour recueillir les serveurs.",
        uuidExpiredMessage: "Votre temps de connexion est expirer ou vous avez connecté sur un autre appareil mobile. Vous êtes hors ligne",
        
        //Settings
        settingsNew: "Ici sont les paramètres, vous pouvez ajouter ou supprimer des utilisateurs ou serverurs ici\n\nPour quitter les paramètres appuyer sur 'Retour' en haut.",
        settingsSave: "Sauver",
        settingsAddServer: "Ajouter un serveur",
        settingsEditServer: "Changez le serveur",
        settingsUser: "Utilisateur",
        settingsRefresh: "Rafraîchissement",
        settingsRefreshUnit: "sec",
        settingsAddDelete: "Ajouter, modifier ou supprimer",
        settingsEditDelete: "Modifier ou supprimer",
        settingsCellcontent: "Paramètres des réservations",
        settingsPatient: "Patient",
        settingsTitle: "Titre",
        settingsDepartment: "Département",
        settingsAddUser: "Ajoutez un utilisateur de l'application",
        settingsServerSettings: "Paramètres du serveur",
        settingsApplicationSettings: "Paramètres de l'application",
        settingsUserSettings: "Paramètres de l'utilisateur",
        settingsLanguage: "Langue",
        settingsRefreshMin: "Minimum 30",
        settingsRefreshMax: "Maximum 7200",
        settingsRefreshDecimal: "Maximum 7200 et doit être décimal",
        settingsDeleteServer: "Supprimer serveur",
        settingsDeleteCurrentUser: "Supprimer utilisateur",
        settingsDeleteServerConfirm: "Êtes-vous sûr vous voulez supprimer cette serveur?",
        settingsDeleteCurrentUserConfirm: "Êtes-vous sûr vous voulez supprimer l'utilisateur courant?",
        settingsChangeName: "Change votre nom",
        settingsChangeEmail: "Change votre courrier",
        
        //patient/mainmenu
        notAvailableInOffline: "Cette fonction n'est pas disponible sans connexion.",

        //patient/patientAppointmentsView
        patientAppointmentsViewNoReservations: "Vous n'avez pas de réservations les 90 jours suivant.",
        patientAppointmentsViewType: "Type de réservation",
        patientAppointmentsViewUnit: "Bij",
        patientAppointmentsViewFacility: "Institution",
                
        //patient/step1
        createAppointmentStep1Server: "Hôpital",
        createAppointmentStep1SelectDoctor: "Choisissez un médecin",
        createAppointmentStep1SelectSection: "Choisissez un service",
        
        //patient/step2
        createAppointmentStep2SelectType: "Choisissez un type",
        createAppointmentStep2ExtraInfoPlaceholer: "Indien u nog iets aan de arts wil meegeven over de afspraak kan u dit hier doen.",
                
        //patient/step3
        createAppointmentStep3Morning: "matin",
        createAppointmentStep3Afternoon: "après-midi",
        createAppointmentStep3MorningShort: "AM",
        createAppointmentStep3AfternoonShort: "PM",
        createAppointmentStep3Selected: "Vous avez choisi cette réservation:",
        createAppointmentStep3SelectDate: "la date de début",
        
        //patient/step4
        createAppointmentStep4MakeYourChoice: "choisissez ici",
        createAppointmentStep4FieldsRequired: "* indique les champs obligatoires",
        createAppointmentStep4FirstName: "Prénom",
        createAppointmentStep4LastName: "Nom",
        createAppointmentStep4Phone2: "Téléphone 2",
        createAppointmentStep4Street: "Rue",
        createAppointmentStep4HouseNumber: "Numéro de la maison",
        createAppointmentStep4PostalCode: "Code postal",
        createAppointmentStep4Town: "Ville",
        createAppointmentStep4Country: "Pays",
        createAppointmentStep4GenderNotDetermined: "I",
        createAppointmentStep4UnknownRegno: "Numéro de registre national inconnu",
        
        //patient/step5
        createAppointmentStep5Info: "Vous pouvez trouver votre rendez-vous si vous cliquez sur le bouton \"Regarder les réservations\" dans le menu principal",
        createAppointmentStep5Thanks: "vous remercie pour utiliser cette app",
        createAppointmentStep5End: "Fin"
};
