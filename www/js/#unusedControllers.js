        /*controller('SettingsCtrl', function($scope, $location, $rootScope, hospiviewFactory) {
         
         $scope.selectedUser = JSON.parse(localStorage.getItem($rootScope.user));
         
         $scope.servers = $scope.selectedUser.servers;
         $scope.server = $rootScope.currentServer;
         
         var unitsandgroups = [];
         hospiviewFactory.getUnitAndDepList($scope.server.uuid, $scope.server.hosp_url).
         success(function(data) {
         var json = parseJson(data);
         if (json.UnitsAndDeps.Header.StatusCode == 1) {
         var units = json.UnitsAndDeps.Detail.Unit;
         for (var i = 0; i < units.length; i++) {
         units[i].type = "dokters";
         units[i].Header.name = units[i].Header.unit_name;
         unitsandgroups.push(units[i]);
         
         if ($scope.server.shortcut1.unit.type === "dokters") {
         if (units[i].Header.unit_id === $scope.server.shortcut1.unit.Header.unit_id) {
         $scope.server.shortcut1.unit = units[i];
         $scope.loadDep(1);
         for (var j = 0; j < $scope.server.shortcut1.unit.Detail.Dep.length; j++) {
         if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut1.department.dep_id)
         $scope.server.shortcut1.department = units[i].Detail.Dep[j];
         }
         }
         }
         
         if ($scope.server.shortcut2.unit.type === "dokters") {
         if (units[i].Header.unit_id === $scope.server.shortcut2.unit.Header.unit_id) {
         $scope.server.shortcut2.unit = units[i];
         $scope.loadDep(2);
         for (var j = 0; j < $scope.server.shortcut2.unit.Detail.Dep.length; j++) {
         if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut2.department.dep_id)
         $scope.server.shortcut2.department = units[i].Detail.Dep[j];
         }
         }
         }
         
         if ($scope.server.shortcut3.unit.type === "dokters") {
         if (units[i].Header.unit_id === $scope.server.shortcut3.unit.Header.unit_id) {
         $scope.server.shortcut3.unit = units[i];
         $scope.loadDep(3);
         for (var j = 0; j < $scope.server.shortcut3.unit.Detail.Dep.length; j++) {
         if (units[i].Detail.Dep[j].dep_id === $scope.server.shortcut3.department.dep_id)
         $scope.server.shortcut3.department = units[i].Detail.Dep[j];
         }
         }
         }
         }
         } else {
         
         $scope.error = true;
         $scope.errormessage = "Fout in de gegevens.";
         }
         }).
         error(function() {
         alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
         });
         hospiviewFactory.getUnitDepGroups($scope.server.uuid, $scope.server.hosp_url).
         success(function(data) {
         var json = parseJson(data);
         if (json.UnitDepGroups.Header.StatusCode == 1) {
         var groups = json.UnitDepGroups.Detail.Group;
         for (var i = 0; i < groups.length; i++) {
         groups[i].type = "groepen";
         groups[i].Header.name = groups[i].Header.group_name;
         unitsandgroups.push(groups[i]);
         
         
         if ($scope.server.shortcut1.unit.type === "groepen") {
         if (groups[i].Header.group_id === $scope.server.shortcut1.unit.Header.group_id) {
         $scope.server.shortcut1.unit = groups[i];
         }
         }
         
         if ($scope.server.shortcut2.unit.type === "groepen") {
         if (groups[i].Header.group_id === $scope.server.shortcut2.unit.Header.group_id) {
         $scope.server.shortcut2.unit = groups[i];
         }
         }
         
         if ($scope.server.shortcut3.unit.type === "groepen") {
         if (groups[i].Header.group_id === $scope.server.shortcut3.unit.Header.group_id) {
         $scope.server.shortcut3.unit = groups[i];
         }
         }
         
         
         }
         $scope.unitsandgroups = unitsandgroups;
         } else {
         $scope.error = true;
         $scope.errormessage = "Fout in de ingevoerde login gegevens.";
         }
         ;
         }).
         error(function() {
         alert("De lijst kon niet worden opgehaald. Controleer uw internetconnectie of probeer later opnieuw");
         });
         
         $scope.disableS1 = true;
         $scope.disableS2 = true;
         $scope.disableS3 = true;
         
         $scope.loadDep = function(shortcut) {
         switch (shortcut)
         {
         case 1:
         if (!(angular.isUndefined($scope.server.shortcut1.unit))) {
         if ($scope.server.shortcut1.unit == null || $scope.server.shortcut1.unit.type == "groepen")
         $scope.disableS1 = true;
         else {
         $scope.disableS1 = false;
         for (var i = 0; i < $scope.server.shortcut1.unit.Detail.Dep.length; i++) {
         if ($scope.server.shortcut1.unit.Detail.Dep[i].dep_name === "") {
         $scope.server.shortcut1.unit.Detail.Dep[i].dep_name = "Allemaal";
         break;
         }
         }
         $scope.departments1 = $scope.server.shortcut1.unit.Detail;
         }
         }
         break;
         case 2:
         if (!(angular.isUndefined($scope.server.shortcut2.unit))) {
         if ($scope.server.shortcut2.unit == null || $scope.server.shortcut2.unit.type == "groepen")
         $scope.disableS2 = true;
         else {
         $scope.disableS2 = false;
         for (var i = 0; i < $scope.server.shortcut2.unit.Detail.Dep.length; i++) {
         if ($scope.server.shortcut2.unit.Detail.Dep[i].dep_name === "") {
         $scope.server.shortcut2.unit.Detail.Dep[i].dep_name = "Allemaal";
         break;
         }
         }
         $scope.departments2 = $scope.server.shortcut2.unit.Detail;
         }
         }
         break;
         case 3:
         if (!(angular.isUndefined($scope.server.shortcut3.unit))) {
         if ($scope.server.shortcut3.unit == null || $scope.server.shortcut3.unit.type == "groepen")
         $scope.disableS3 = true;
         else {
         $scope.disableS3 = false;
         for (var i = 0; i < $scope.server.shortcut3.unit.Detail.Dep.length; i++) {
         if ($scope.server.shortcut3.unit.Detail.Dep[i].dep_name === "") {
         $scope.server.shortcut3.unit.Detail.Dep[i].dep_name = "Allemaal";
         break;
         }
         }
         $scope.departments3 = $scope.server.shortcut3.unit.Detail;
         }
         }
         break;
         }
         };
         
         $scope.cellcontentchange = function(newCellcontent) {
         $scope.selectedUser.cellcontent = newCellcontent;
         };
         
         $scope.save = function() {
         for (var i = 0; i < $scope.selectedUser.servers.length; i++) {
         if ($scope.selectedUser.servers[i].id == $scope.server.id)
         {
         $scope.selectedUser.servers[i] = $scope.server;
         localStorage.setItem($rootScope.user, JSON.stringify($scope.selectedUser));
         }
         }
         $location.path('/mainmenu');
         };
         $scope.addOrEditServer = function(action, server) {
         if (action === "add" && $scope.selectedUser.servers.length === 3)
         alert("Er kunnen maximaal 3 ziekenhuizen worden opgeslaan.");
         else {
         if (action === "edit")
         $rootScope.editServer = server;
         }
         $location.path('/selectserver/' + action);
         };
         }).*/