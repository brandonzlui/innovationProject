app.controller('PostingsController', ['$scope', '$http', '$state', '$rootScope', 'FlightData', ($scope, $http, $state, $rootScope, FlightData) => {
  $scope.FlightData = FlightData
}])