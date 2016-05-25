var myApp = angular.module('myApp', []);

myApp.controller('AppCtrl', ['$scope', '$http',
function($scope,$http)
{
	//console.log("Hello World from controller");
  var pageID;


  var refresh = function(){
    console.log(pageID);
	$http.get('/spell-checker/' + pageID).success(
	function(response)
	{
		console.log("I got the data");
		$scope.suggestlist = response;
	});
};

	$http.get('/spell-checker/').success(function(response){
		console.log(response);
		$scope.pagelist = response;
	});

	$scope.returnSuggestions = function(id){
	//	console.log(dataid);
  pageID = id;

		$http.get('/spell-checker/' + id).success(function(response){
			console.log(response);
			$scope.suggestlist = response;
		});
	};
}]);
