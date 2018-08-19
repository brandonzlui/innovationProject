app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', ($scope, $http, $state, $rootScope) => {

  $scope.sections = [
    {
      title: 'Seat Map',
      stateName: 'seatmap' 
    },
    {
      title: 'Postings',
      stateName: 'postings'
    }
  ]

  $scope.changeState = function(stateName) {
    $state.go(stateName)
  }

}])