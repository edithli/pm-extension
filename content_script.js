document.body.style.border = "5px solid black";
console.log('content script running!');

// to read in possible login information
// var inputs = document.getElementsByTagName('INPUT');
// for (var i = inputs.length - 1; i >= 0; i--) {
// 	var input = inputs[i];
// 	var type = input.type;
// 	console.assert(typeof type == 'string', 'input type is not a string');
// 	console.log('input type ' + input.type + ' input id: ' + input.id);
// 	// add buttons to account id and password input elements
// 	if (type == 'password' || input.name == 'password') {
// 		input.style.border = "3px solid red";
// 		console.log('password input id ' + input.id);
// 	}
// }

// the list of all documents
var docs = new Array();
docs.push(document);
// in case of iFrame
var iFrames = document.getElementsByTagName('iframe');
for (var i = iFrames.length - 1; i >= 0; i--) {
	var doc1 = iFrames[i].contentDocument;
	if (doc1 != null && doc1 != undefined){
		docs.push(doc1);
	}else {
		var doc2 = iFrames[i].contentWindow.document;
		if (doc2 != null || doc2 != undefined){
			docs.push(doc2);
		}else {
			console.log('unresolved document in iframe id: ' + iFrames[i].id);
		}
	}
}
console.log('the number of documents: ' + docs.length);
for (var i = docs.length - 1; i >= 0; i--) {
	var inputs = docs[i].getElementsByTagName('INPUT');
	for (var i = inputs.length - 1; i >= 0; i--) {
		var input = inputs[i];
		var type = input.type;
		console.assert(typeof type == 'string', 'input type is not a string');
		console.log('input type ' + input.type + ' input id: ' + input.id);
		// add buttons to account id and password input elements
		if (type == 'password' || input.name == 'password') {
			input.style.border = "3px solid red";
			console.log('password input id ' + input.id);
		}
	}
}