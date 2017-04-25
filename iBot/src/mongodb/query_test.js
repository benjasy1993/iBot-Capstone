const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
// const url = 'mongodb://localhost:27017/credentials';
const url = 'mongodb://dbadmin:dbadmin@ds161179.mlab.com:61179/bot-jira';

module.exports = {

  getCredential : function(userId,callback) {
    MongoClient.connect(url, function (err,db) {
      if (err) {
        return console.dir(err);
      }
      var collection = db.collection('tokens');
      collection.find({"skypeid":userId}).nextObject(function (err, result) {
      	db.close();
        return callback(result);   
      });
    });
  },

  //return a result, pass a callback function to deal with the
  storeCredential: function(userId, credential, callback) {
  	MongoClient.connect(url, function (err, db) {
  		if (err) {
  			return console.dir(err);
  		}
  		var collection = db.collection('tokens');
  		collection.insertOne({"skypeid":userId, "credential":credential
  		}, function(err, result){
  			assert.equal(err, null);
  			console.log("Inseted a document successfully");
  			db.close();
  			callback(result);
  		});
  	});
  }
};



