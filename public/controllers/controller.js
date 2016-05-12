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


$scope.testWords = function(){
		console.log($scope.word);

		$http.post('/spell-checker', $scope.word).success(function(response)
		{
			console.log(response);

			$scope.suggestionlist = response;

		}
	)};

	$scope.returnSuggestions = function(id){
	//	console.log(dataid);
  pageID = id;

		$http.get('/spell-checker/' + id).success(function(response){
			console.log(response);
			$scope.suggestlist = response;
		});
	};

	$scope.selectedItemChanged = function(){
	 console.log("changed");

	 $http.post('/spell-checker/changedict/', $scope.data);

	 console.log($scope.data.singleSelect);
	 refresh();

 };

 $scope.addWord = function(word){
   console.log(word);
   $http.post('/spell-checker/addword/' + word).success(function(response)
   {
     console.log(response);
   });

   refresh();

 };


	$scope.getWords = function(id){
		console.log(id);
		$http.get('/spell-checker/' + id).success(function(response){
			console.log(response);
			$scope.pagelist = response;
		});
	};

}]);
