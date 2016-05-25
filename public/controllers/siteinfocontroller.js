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
    console.log("Returned response", response);
		$scope.suggestlist = response.spellingMistakes;
    $scope.numOfMistakes = response.numOfMistakes;
	});
};

  //Sets the dictionary for the page
  $http.post('/spell-checker/setdict/' + pageID).success(function(response){
    $scope.currentDictionary = response.currentDictionary;
  });

 //Return the mistakes for the page
  $http.get('/spell-checker/getMistakes/' + $window.pageid).success(function(response){

    //Set values from database on page
    $scope.suggestlist = response.spellingMistakes;
    $scope.pagename = pageName;
    $scope.numOfMistakes = response.numOfMistakes;
    $scope.currentDictionary = response.currentDictionary;

    //Print Results
    console.log("Number of Mistakes:", response.numOfMistakes);
    console.log("Mistakes:", response.spellingMistakes);
  });

$scope.testWords = function(){
		console.log($scope.word);

		$http.post('/spell-checker', $scope.word).success(function(response)
		{
			console.log(response);

			$scope.suggestionlist = response;

		}
	)};

  //Return words with spelling mistakes
	$scope.returnSuggestions = function(id){
  pageID = id; //Set pageID
  console.log(pageID);
		$http.get('/spell-checker/' + id).success(function(response){
			console.log(response);
      //Set spelling mistakes
			$scope.suggestlist = doc.spellingMistakes;
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
