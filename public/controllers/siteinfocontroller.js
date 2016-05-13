var myApp = angular.module('myApp', []);

myApp.controller('AppCtrl', ['$scope', '$http','$window',
function($scope,$http,$window)
{

  //set the page ID for the page
  var pageID = $window.pageid;
  //set the page name for the page
  var pageName = $window.pageTitle;


 //Method that refreshes database and page information
  var refresh = function(){
	$http.get('/spell-checker/' + pageID).success(
	function(response)
	{
		$scope.suggestlist = response;
    $scope.numOfMistakes = response.length;
	});
};

  //Sets the dictionary for the page
  $http.post('/spell-checker/setdict/' + pageID).success(function(response){
    $scope.currentDictionary = response;
  });


  $http.get('/spell-checker/getMistakes/' + $window.pageid).success(function(response){
    console.log(response.length);
    $scope.suggestlist = response;
    $scope.pagename = pageName;
    $scope.numOfMistakes = response.length;
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
  console.log(pageID);
		$http.get('/spell-checker/' + id).success(function(response){
			console.log(response);
			$scope.suggestlist = response;
		});
	};

	$scope.selectedItemChanged = function(){
	 console.log("changed");

	 $http.post('/spell-checker/changedict/' + pageID, $scope.data);
   $scope.currentDictionary = $scope.data.singleSelect;
	 console.log($scope.data.singleSelect);
	 refresh();

 };

 $scope.addWord = function(word){
   console.log("start");
   $http.post('/spell-checker/addword/' + word).success(function(response)
   {
     console.log(response);
   });

   refresh();

 };



}]);
