



var app=angular.module('RoutingApp', ['ngRoute','ui.bootstrap']);
app.controller("mycontroller",function($scope, $modal, $log){
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

$scope.user=[{name:""}];
$scope.mylist=[];
$scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      scope: $scope
    });

  };


});

app.controller('ModalInstanceCtrl',function($scope, $modalInstance){

	$scope.ok = function () {
    $modalInstance.close();
    $scope.mylist.push(user);
  };
   $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

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