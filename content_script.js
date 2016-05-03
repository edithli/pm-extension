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
// @TODO: problem remains for HTML iframe element because of same origin policy
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
var username, password;
for (var i = docs.length - 1; i >= 0; i--) {
	var inputs = docs[i].getElementsByTagName('INPUT');
	for (var i = inputs.length - 1; i >= 0; i--) {
		var input = inputs[i];
		var type = input.type;
		console.assert(typeof type == 'string', 'input type is not a string');
		// add buttons to account id and password input elements
		if (type == 'password' || input.name == 'password') {
			input.style.border = "3px solid red";
			addButton(input);
		}
	}
}

function addButton(input) {
	var btn = document.createElement("BUTTON");
	var t = document.createTextNode("+");
	btn.appendChild(t);
	var parent = input.parentNode;
	console.assert(parent != null, 'parent node of input ' + input.id + ' is null');
	parent.appendChild(btn);
}

function addPopup(){
	// popup a little frame to input domain, username, and password
	var container = document.createElement("DIV");
	var hint = document.createElement("P");
	hint.appendChild(document.createTextNode("保存该网站信息"));
	container.appendChild(hint);
	var nameLabel = document.createElement("LABEL");
	nameLabel.appendChild(document.createTextNode("名称"));
	container.appendChild(nameLabel);
	var nameInput = document.createElement("INPUT");
	nameInput.setAttribute("type", "text");
	nameInput.setAttribute("id", "accountName");
	container.appendChild(nameInput);
	var usernameLabel = document.createElement("LABEL");
	usernameLabel.appendChild(document.createTextNode("用户名"));
	container.appendChild(usernameLabel);
	var usernameInput = document.createElement("INPUT")；
	usernameInput.setAttribute("type", "text");
	usernameInput.setAttribute("id", "username");
	container.appendChild(usernameInput);
	var pwdLabel = document.createElement("LABEL");
	pwdLabel.appendChild(document.createTextNode("密码"));
	container.appendChild(pwdLabel);
	var pwd = document.createElement("INPUT");
	pwd.setAttribute("type", "password");
	pwd.setAttribute("id", "password");
	container.appendChild(pwd);
	var btnCancel = document.createElement("BUTTON");
	btnCancel.appendChild(document.createTextNode("取消"));
	container.appendChild(btnCancel);
	var btnSubmit = document.createElement("BUTTON");
	btnSubmit.appendChild(document.createTextNode("保存"));
	container.appendChild(btnSubmit);
}

function addButtonClicked() {
	console.log('inserted button clicked ');
}