var express = require('express');
var app = express();
//init spell-checker
var nodehun = require('nodehun');
var myArgs = require('optimist').argv;

var fs = require('fs');
var htmlToText = require('html-to-text');
async = require("async");
var mongojs = require('mongojs');

//Set mongojs based on user input
var db = mongojs(myArgs.b, [myArgs.c]);
//Get parameters from command line

console.log('Dictionary ', myArgs.a);
console.log('Site ID: ', myArgs.d);
console.log('Mongo Collection:', myArgs.c);
console.log('Mongo Database Name:', myArgs.b);
//console.log('Site ID: ', myArgs.y);

//Dictionary is set to US
var affbuf = fs.readFileSync(__dirname+'/dictionaries/'+ myArgs.a +'.aff');
var dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+ myArgs.a +'.dic');
var hunspell = new nodehun(affbuf, dictbuf);
var bodyParser = require('body-parser');
var spellcheck = require('nodehun-sentences');
var docs;
var collection = db.collection(myArgs.c);


app.use(bodyParser.json());

collection.find({"siteId" : "2"}, function (err, doc){


doc.forEach(function(item){

  console.log("page id: " + item._id);
  var html = htmlToText.fromString(item.html, {	wordwrap: 130});
  spellcheck(hunspell, html, function(err, typos) {

    console.log(typos.length);

collection.findAndModify({
	query: {_id: mongojs.ObjectId(item._id)},
	update: { $set: { numOfMistakes: typos.length } },
	new: true
}, function (err, doc, lastErrorObject) {
	// doc.tag === 'maintainer'
  console.log(doc._id)
  console.log("Page has: " + doc.numOfMistakes + " mistakes");
});

collection.findAndModify({
	query: {_id: mongojs.ObjectId(item._id)},
	update: { $set: { currentDictionary: myArgs.a } },
	new: true
}, function (err, doc, lastErrorObject) {
	// doc.tag === 'maintainer'
  //console.log(doc._id)
  console.log("Page dictionary is: " + doc.currentDictionary);
});

collection.findAndModify({
	query: {_id: mongojs.ObjectId(item._id)},
	update: { $set: { spellingMistakes: typos } },
	new: true
}, function (err, doc, lastErrorObject) {
	// doc.tag === 'maintainer'
  //console.log(doc._id)
  console.log("Spelling Mistakes are: " + doc.spellingMistakes);
});

  });

});

  //console.log(docs);
});
