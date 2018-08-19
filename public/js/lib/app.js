'use strict';

var app = angular.module('seatCX', ['ui.router']);

// Setup flight data
app.factory('FlightData', function () {
  alert('once pls');
  return {
    Flight: 'CX888'
  };
});

// Components
app.component('seatmap', {
  templateUrl: 'views/seatmap.html',
  controller: 'SeatMapController'
});

app.component('postings', {
  templateUrl: 'views/postings.html',
  controller: 'PostingsController'
});

// States
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state({
    name: 'seatmap',
    url: '/',
    component: 'seatmap'
  });

  $stateProvider.state({
    name: 'postings',
    url: '/',
    component: 'postings'
  });

  $urlRouterProvider.otherwise('/');
}]);