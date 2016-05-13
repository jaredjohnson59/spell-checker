var express = require('express');
var app = express();
var nodehun = require('nodehun');
var fs = require('fs');
var htmlToText = require('html-to-text');
async = require("async");
var mongojs = require('mongojs');
var db = mongojs('spell-checker', ['sites']);



//Dictionary is set to US
var affbuf = fs.readFileSync(__dirname+'/dictionaries/en_US.aff');
var dictbuf = fs.readFileSync(__dirname+'/dictionaries/en_US.dic');
var ignore = fs.readFileSync(__dirname+'/dictionaries/test.dic');

var hunspell = new nodehun(affbuf, dictbuf);
var bodyParser = require('body-parser');
var spellcheck = require('nodehun-sentences');

var collection = db.collection("sites");

//Set Default Dictionary Code
var dictCode = "en_US";

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.post('/spell-checker/addword/:word', function (req, res){

  console.log(req.params.word);
  var wordToAdd = req.params.word;

  fs.appendFile(__dirname+'/dictionaries/'+dictCode+'.dic', '\r\n' + wordToAdd, function (err) {

  });

  affbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');
  dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');

});

app.post('/spell-checker/setdict/:id', function (req, res){

  var pageID = req.params.id;

  console.log("Page ID:" + pageID);

      collection.findOne({_id: mongojs.ObjectId(pageID)}, function (err, doc){

      affbuf = fs.readFileSync(__dirname+'/dictionaries/' + doc.currentDictionary + '.aff');
      dictbuf = fs.readFileSync(__dirname+'/dictionaries/' + doc.currentDictionary + '.dic');

      res.json(doc.currentDictionary);
    });
});


app.post('/spell-checker/changedict/:id', function (req, res){
	//console.log(req.body.id);
	dictCode = req.body.singleSelect;

  var pageID = req.params.id;

  console.log("Page ID:" + pageID);

  collection.findAndModify({
  	query: {_id: mongojs.ObjectId(pageID)},
  	update: { $set: { currentDictionary: dictCode } },
  	new: true
  }, function (err, doc, lastErrorObject) {
  	// doc.tag === 'maintainer'
    console.log(doc._id)
    console.log("Page dictionary is: " + doc.currentDictionary);
  });

//Set the dictionary (default is US)
affbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');
dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');
hunspell = new nodehun(affbuf, dictbuf);

res.json(dictCode);

//hunspell.addDictionary(ignore);
//console.log(hunspell);
});

app.get('/spell-checker/getMistakes/:id', function  (req, res)
{

	//send page ID, site ID and crawlID
	//console.log(db)
	var id = req.params.id;
  //console.log("Set to ignore:" + ignore);
  //hunspell.addDictionary(ignore);
	console.log(id);

	//Find All Pages with Site ID
	db.sites.findOne({_id: mongojs.ObjectId(id)}, function (err, doc){
	//Return Response
	console.log("Document: " + doc);
	var html = htmlToText.fromString(doc.html, {	wordwrap: 130});
	console.log(html);

  affbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');
  dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+dictCode+'.dic');
  hunspell = new nodehun(affbuf, dictbuf);

	spellcheck(hunspell, html, function(err, typos) {
		console.log(typos);


		res.json(typos);
});
	});
});

app.get('/spell-checker/', function (req, res)
{
	db.sites.find(function (err, docs){

		res.json(docs);
	});
});

app.get('/spell-checker/:id', function  (req, res)
{
  console.log("Running refresh");
	//send page ID, site ID and crawlID
	//console.log(db)
	var id = req.params.id;
  //console.log("Set to ignore:" + ignore);
  //hunspell.addDictionary(ignore);
	console.log(id);

	db.sites.findOne({_id: mongojs.ObjectId(id)}, function (err, doc){
	//Return Response
	console.log("Document: " + doc);
	var html = htmlToText.fromString(doc.html, {	wordwrap: 130});
	console.log(html);

  affbuf = fs.readFileSync(__dirname+'/dictionaries/'+doc.currentDictionary+'.dic');
  dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+doc.currentDictionary+'.dic');
  hunspell = new nodehun(affbuf, dictbuf);

	spellcheck(hunspell, html, function(err, typos) {
//		console.log(typos);
  collection.findAndModify({
    query: {_id: mongojs.ObjectId(id)},
    update: { $set: { numOfMistakes: typos.length } },
    new: true
  }, function (err, doc, lastErrorObject) {
    // doc.tag === 'maintainer'
    console.log(doc._id)
    console.log("Page has: " + doc.numOfMistakes + " mistakes");
  });

  collection.findAndModify({
  	query: {_id: mongojs.ObjectId(id)},
  	update: { $set: { spellingMistakes: typos } },
  	new: true
  }, function (err, doc, lastErrorObject) {
  	// doc.tag === 'maintainer'
    //console.log(doc._id)
    console.log("Spelling Mistakes are: " + doc.spellingMistakes);
  });

		res.json(typos);
});
	});
});

app.post('/spell-checker', function (req,res)
{
	var wordToTest = req.body.name;
	var text = htmlToText.fromString(wordToTest, {	wordwrap: 130});
	console.log(text);
  //hunspell.addDictionary(ignore);
  console.log("Add dictionary");
	spellcheck(hunspell, text, function(err, typos) {
    console.log(typos);


    res.json(typos);
});





});

app.listen(3001);
console.log("Server running on port 3001");
