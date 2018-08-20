'use strict';

app.controller('NavController', ['$scope', '$http', '$state', '$rootScope', function ($scope, $http, $state, $rootScope) {

  $scope.sections = [{
    title: 'Seat Map',
    stateName: 'seatmap'
  }, {
    title: 'Postings',
    stateName: 'postings'
  }, {
    title: 'My Requests',
    stateName: 'requests'
  }];

  $scope.changeState = function (stateName) {
    $state.go(stateName);
  };
}]);