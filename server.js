var express = require('express');
var app = express();
var nodehun = require('nodehun');
var fs = require('fs');
var htmlToText = require('html-to-text');
async = require("async");
var mongojs = require('mongojs');
var db = mongojs('spell-checker', ['sites']);
var bodyParser = require('body-parser');
var spellcheck = require('nodehun-sentences');

var affbuf;
var dictbuf;

//Set up dictionary
var hunspell;



//Set database collection (change the collection based on the mongodb collection)
var collection = db.collection("sites");
var dictCode;


//Set up express directory
app.use(express.static(__dirname + "/public"));

//set up response parser
app.use(bodyParser.json());


//Method to add word to dictionary
app.post('/spell-checker/addword/:word', function(req, res) {

    //Set word that is going to be added
    var wordToAdd = req.params.word;
    //console("Word to add:" + wordToAdd);

    fs.appendFile(__dirname + '/dictionaries/' + dictCode + '.dic', '\r\n' + wordToAdd);

    affbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');
    dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');

});

app.post('/spell-checker/setdict/:id', function(req, res) {

    var pageID = req.params.id;

    console.log("Page ID:" + pageID);

    collection.findOne({
        _id: mongojs.ObjectId(pageID)
    }, function(err, doc) {

        affbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.aff');
        dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.dic');

        res.json(doc.currentDictionary);
    });
});


app.post('/spell-checker/changedict/:id', function(req, res) {
    //console.log(req.body.id);
    dictCode = req.body.singleSelect;

    var pageID = req.params.id;

    console.log("Page ID:" + pageID);

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
        console.log(doc._id)
        console.log("Page dictionary is: " + doc.currentDictionary);
    });

    //Set the dictionary
    affbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');
    dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + dictCode + '.dic');
    hunspell = new nodehun(affbuf, dictbuf);

    res.json(dictCode);

    //hunspell.addDictionary(ignore);
    //console.log(hunspell);
});

app.get('/spell-checker/getMistakes/:id', function(req, res) {

    var id = req.params.id;

    //Find All Pages with Site ID
    db.sites.findOne({
        _id: mongojs.ObjectId(id)
    }, function(err, doc) {
        //Return Response

        console.log("Get spelling mistakes");
        console.log(doc.spellingMistakes);

        dictCode = doc.currentDictionary;
        console.log("Dictionary code: " + dictCode);

        res.json(doc.spellingMistakes);

    });
});

app.get('/spell-checker/', function(req, res) {
    db.sites.find(function(err, docs) {

        res.json(docs);
    });
});

app.get('/spell-checker/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);

    db.sites.findOne({
        _id: mongojs.ObjectId(id)
    }, function(err, doc) {
        //Return Response
        console.log("Document: " + doc);
        var html = htmlToText.fromString(doc.html, {
            wordwrap: 130
        });

        affbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.dic');
        dictbuf = fs.readFileSync(__dirname + '/dictionaries/' + doc.currentDictionary + '.dic');
        hunspell = new nodehun(affbuf, dictbuf);

        spellcheck(hunspell, html, function(err, typos) {
            //		console.log(typos);
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
                // doc.tag === 'maintainer'
                console.log(doc._id)
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
                // doc.tag === 'maintainer'
                //console.log(doc._id)
                console.log("Spelling Mistakes are: " + doc.spellingMistakes);
            });

            res.json(typos);
        });
    });
});

app.post('/spell-checker', function(req, res) {
    var wordToTest = req.body.name;
    var text = htmlToText.fromString(wordToTest, {
        wordwrap: 130
    });
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
