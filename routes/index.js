var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var shortid = require('shortid');
    shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
var validUrl = require('valid-url');

var config = require('../config');
var mLink = 'mongodb://' + config.db.host + '/' + config.db.name;
var MongoClient = mongodb.MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
    var local = req.get('host');
  res.render('index', { host: local });
});

router.get('/new/:url(*)', function (req, res, next) {
    MongoClient.connect(mLink, function(err, db){
    if(err){
        throw err;
    } else {
        var collection = db.collection('links');
        var params = req.params.url;
        
        var local = req.get('host') + '/';
        
        var newLink = function(db, callback){
             collection.findOne({ "url": params }, { short: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.json({ original_url: params, short_url: local + doc.short });
          } else {
              
            if(validUrl.isUri(params)){
                var shortCode = shortid.generate();
                var newUrl = { url: params, short: shortCode };
                collection.insert([newUrl]);
                res.json({ original_url: params, short_url: local + shortCode });
            } else {
                res.json({ error: "Wrong url format"});
            };
        };
    });
};
    newLink(db, function(){
    db.close();
    });
    }
    });
});

router.get('/new/:url(*)', function (req, res, next) {
    MongoClient.connect(mLink, function (err, db){
        if(err){
            throw err;
        } else {
            var collection = db.collection('links');
            var params = req.params.short;
            
            var findLink=function(db, callback){
                collection.findOne({ "short": params }, { url: 1, _id: 0 }, function(err, doc){
                    if(doc != null){
                        res.redirect(doc.url);
                    } else {
                        res.json({ error: "No corresponding shortlink found!"});
                    };
                });
            };
            findLink(db, function(){
                db.close();
            });
        }
    });
});

module.exports = router;
