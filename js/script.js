



var app=angular.module('RoutingApp', ['ngRoute']);
app.controller("mycontroller",function($scope){
$scope.name="";
$scope.persons=[
                  {
                  	id:1,
                  	name:'Macha',
                  	company:'IBM'
                  },
                  {
                  	id:2,
                  	name:'Karthik',
                  	company:'IBM'
                  },
                  {
                  	id:3,
                  	name:'kanda',
                  	company:'IBM'
                  }




];


});

	app.config( ['$routeProvider', function($routeProvider) {
		
		$routeProvider
			.when('/first', {
				templateUrl: 'app/first.html',
				controller:'messagecontroller'
			})
			.when('/second', {
				templateUrl: 'app/second.html',
				controller:'secondcontroller'
			})
			.when('/back', {
				templateUrl: 'index.html',
				
			})
			.when('/view/:id',{
				 templateUrl:'app/view.html',
				 controller:'personcontroller'

			})
			.otherwise({
				redirectTo: '/'
			});
	}]);

app.controller('messagecontroller',function($scope){

$scope.message="Hello this is first controller";


});
app.controller('personcontroller',['$scope','$routeParams',function($scope,$routeParams)
{
	$scope.person=$scope.persons[$routeParams.id]

}]);

app.controller('secondcontroller',function($scope){
	$scope.secondone="Hello this is second controller";
	
});