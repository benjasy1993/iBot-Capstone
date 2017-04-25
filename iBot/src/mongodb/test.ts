const Query = require('./query');


// test getCredential
const skypeid = "";

//should have two functions, onFulfilled and onRejected

// function onFulfilled(result):void {
	// console.log(result);
// }

// function onRejected(err):void {
	// if(err){
		// console.log("no valid record");
	// }
// }

Query.getCredential(skypeid)
	.then(console.log)
	.catch((err: any) => {
		console.log(err.message);
	});


// test store credential
// const skypeid1 = "young";
// const credential = "fakecredential==";

// Query.storeCredential(skypeid1, credential);






// test storeCredential
// Query.storeCredential("yang", "fakecredential==", function(result){
	// console.log(result["result"])
// });
