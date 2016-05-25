var express = require('express');
var app = express();
//init spell-checker
var nodehun = require('nodehun');
var myArgs = require('optimist').argv;
var sanitizeHtml = require('sanitize-html');
var fs = require('fs');
//var htmlToText = require('html-to-text');
async = require("async");
var mongojs = require('mongojs');

//Set mongojs based on user input
var db = mongojs(myArgs.b, [myArgs.c]);
//Get parameters from command line

console.log('Dictionary ', myArgs.a);
console.log('Site ID: ', myArgs.d);
console.log('Mongo Collection:', myArgs.c);
console.log('Mongo Database Name:', myArgs.b);
console.log('Crawl ID', myArgs.e);
//console.log('Site ID: ', myArgs.y);

//Dictionary is set to US
var affbuf = fs.readFileSync(__dirname+'/dictionaries/'+ myArgs.a +'.aff');
var dictbuf = fs.readFileSync(__dirname+'/dictionaries/'+ myArgs.a +'.dic');
var ignore = fs.readFileSync(__dirname+'/dictionaries/ignore.dic');
var hunspell = new nodehun(affbuf, dictbuf);
var bodyParser = require('body-parser');
var spellcheck = require('nodehun-sentences');
var docs;
var collection = db.collection(myArgs.c);
var siteID = myArgs.d;
var crawlID = myArgs.e;

app.use(bodyParser.json());

//Add dictionary with ignore words
hunspell.addDictionary(ignore);

collection.find({siteId : siteID}, function (err, doc){
doc.forEach(function(item){

  console.log("page id: " + item._id);

  //var html = htmlToText.fromString(item.html, {	wordwrap: 130});
  var html = sanitizeHtml(item.html, {
  allowedTags: [ '' ],
  textFilter: function(text) {
  return text + ' ';
}
});

spellcheck(hunspell, html, function(err, typos) {
console.log(typos);
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
  //console.log("Spelling Mistakes are: " + doc.spellingMistakes);
});

  });

});

});
