const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
import assert = require('assert');


const url = 'mongodb://dbadmin:dbadmin@ds161179.mlab.com:61179/bot-jira';

const channels = ["skype", "slack", "emulator"];

enum Channel {
  Skype,
  Slack,
  Emulator
}

// to access a member: channels[Channel.Emulator]

export function getCredential(userId: string): Promise<any> {
    return new Promise((resolve, reject)=>{
        MongoClient.connect(url, function(err:any, db:any){
          if(err) {
            reject(err);
          }
          console.log("connected to database successgully");
          var collection = db.collection("tokens");
          collection.findOne({"skypeid": userId}, function(err:any, result:any){
            if(err) reject(err);
            else {
              db.close();
              resolve(result);
            }
          });
        });
    });
}


export function getJiraId(userId: string, channel: string): Promise<any> {
    return new Promise((resolve, reject)=>{
        MongoClient.connect(url, function(err:any, db:any){
            if(err) {
                reject(err);
            }
            console.log("connected to database successgully");
            var collection = db.collection("tokens");
            collection.findOne({"skypeid": userId, "channel": channel}, function(err:any, result:any){
                if(err) reject(err);
                else {
                    db.close();
                    resolve(result);
                }
            });
        });
    });
}


export function getCredentialWithChannel(userId: string, channel: string):Promise<any> {
    return new Promise((resolve, reject)=>{
        MongoClient.connect(url, function(err:any, db:any){
            if(err) {
                reject(err);
            }
            console.log("connected to database successgully");
            var collection = db.collection("tokens");
            collection.findOne({"skypeid": userId, "channel":channel}, function(err:any, result:any){
                if(err) reject(err);
                else {
                    db.close();
                    resolve(result);
                }
            });
        });
    });
}
// export async function getCredential(userId: string): string {
  // const credential = await getCredentialInternal(userId);
  // return credential;
// }

export function storeCredential(userId: string,
                                credential: string,
                                jiraid: string,
                                channel: string): void {
    MongoClient.connect(url, function(err:any, db:any){
        assert.equal(err, null);
        console.log('connected to database successfully');
        db.collection("tokens").insertOne({"skypeid":userId,
                                           "credential":credential,
                                           "jiraid": jiraid,
                                           "channel": channel
                                          }, function(err:any, result:any){
            assert.equal(err, null);
            console.log("inserted a document into tokens collection");
            console.dir(result.ops);
            db.close();
        });
    });
}