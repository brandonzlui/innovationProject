'use strict';

app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', function ($scope, $http, $state, $rootScope, FlightData) {
  $scope.FlightData = FlightData;
}]);