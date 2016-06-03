var express = require('express');
var app = express();
var nodehun = require('nodehun');
var fs = require('fs');
//var htmlToText = require('html-to-text');
var sanitizeHtml = require('sanitize-html');
async = require("async");
var mongojs = require('mongojs');
var dbConfig = require('./config');
var db = mongojs(dbConfig.database, [dbConfig.collection]);
var bodyParser = require('body-parser');
var spellcheck = require('nodehun-sentences');

var affbuf;
var dictbuf;

//Set up dictionary
var hunspell;

//Set database collection (change the collection based on the mongodb collection)
var collection = db.collection(dbConfig.collection);
var dictCode;
var ignoreDict = "ignore";
var ignore = fs.readFileSync(__dirname+'/dictionaries/' + ignoreDict + '.dic');

//Set up express directory
app.use(express.static(__dirname + "/public"));

//set up response parser
app.use(bodyParser.json());


//Method to add word to dictionary
app.post('/spell-checker/addword/:word', function(req, res) {

    //Set word that is going to be added
    var wordToAdd = req.params.word;
    //console("Word to add:" + wordToAdd);

    fs.appendFile(__dirname + '/dictionaries/' + ignoreDict + '.dic', '\r\n' + wordToAdd);

    affbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');
    dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');

});

app.post('/spell-checker/setdict/:id', function(req, res) {

    var pageID = req.params.id;

    collection.findOne({
        _id: mongojs.ObjectId(pageID)
    }, function(err, doc) {

        affbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.aff');
        dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.dic');

        res.json(doc);
    });
});


app.post('/spell-checker/changedict/:id', function(req, res) {
    //console.log(req.body.id);
    dictCode = req.body.singleSelect;

    var pageID = req.params.id;

    collection.findAndModify({
        query: {
            _id: mongojs.ObjectId(pageID)
        },
        update: {
            $set: {
                currentDictionary: dictCode
            }
        },
        new: true
    }, function(err, doc, lastErrorObject) {
        // doc.tag === 'maintainer'
        //console.log(doc._id)
        res.json(doc);
      //  console.log("Page dictionary is: " + doc.currentDictionary);
    });

    //Set the dictionary
    affbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.aff');
    dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');
    hunspell = new nodehun(affbuf, dictbuf);
    ignore = fs.readFileSync(__dirname+'/dictionaries/' + ignoreDict + '.dic');
    hunspell.addDictionary(ignore);


});

app.get('/spell-checker/getMistakes/:id', function(req, res) {

    var id = req.params.id;

    //Find All Pages with Site ID
    collection.findOne({
        _id: mongojs.ObjectId(id)
    }, function(err, doc) {
      /*dictCode = doc.currentDictionary;
        console.log("Dictionary code: " + dictCode);
        */
        res.json(doc);
    });
});


//Get all documents in MongoDB
app.get('/spell-checker/', function(req, res) {
    console.log("Get documents from database");
    collection.find(function(err, docs) {
        res.json(docs);
    });
});


//Get Page Info
app.get('/spell-checker/:id', function(req, res) {

    //Set and display pageID
    var id = req.params.id;

    collection.findOne({
        _id: mongojs.ObjectId(id)
    }, function(err, doc) {
        //Return Response
        var html = sanitizeHtml(doc.html, {
        allowedTags: [ '' ],
        textFilter: function(text) {
        return text + ' ';
      }
      });

        affbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.aff');
        dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.dic');
        hunspell = new nodehun(affbuf, dictbuf);
        ignore = fs.readFileSync(__dirname+'/dictionaries/' + ignoreDict + '.dic');
        hunspell.addDictionary(ignore);

        console.log("Affbuf:",affbuf);
        console.log("Dictbuf",dictbuf);

        spellcheck(hunspell, html, function(err, typos) {
            	//	console.log(typos);

            collection.findAndModify({
                query: {
                    _id: mongojs.ObjectId(id)
                },
                update: {
                    $set: {
                       numOfMistakes: typos.length
                    }
                },
                new: true
            }, function(err, doc, lastErrorObject) {
                console.log("Page has: " + doc.numOfMistakes + " mistakes");
            });

            collection.findAndModify({
                query: {
                    _id: mongojs.ObjectId(id)
                },
                update: {
                    $set: {
                        spellingMistakes: typos
                    }
                },
                new: true
            }, function(err, doc, lastErrorObject) {
              //  console.log("Spelling Mistakes are: " + doc.spellingMistakes);
              res.json(doc);
            });
            //console.log("Typos", typos.length)

        });
    });
});

/*
app.post('/spell-checker', function(req, res) {
    var wordToTest = req.body.name;
    var text = sanitizeHtml(wordToTest, {
    allowedTags: [ '' ],
    textFilter: function(text) {
    return text + ' ';
  }
  });

    console.log(text);
    hunspell.addDictionary(ignore);
    console.log("Add dictionary");
    spellcheck(hunspell, text, function(err, typos) {
        console.log(typos);


        res.json(typos);
    });




});*/

app.listen(3001);
console.log("Server running on port 3001");
