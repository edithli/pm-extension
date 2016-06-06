// document.body.style.border = "5px solid black";
console.log('content script running!');

// Constants
var mydomain = "localhost";
var LOGIN_URL = "http://" + mydomain + ":8080/pm-server/login.html";
var REGISTER_URL = "http://" + mydomain + ":8080/pm-server/register.html";
var URL_QUERY_URL = "http://" + mydomain + ":8080/pm-server/QueryURLServlet";

var passwordId, usernameId, checksum;

if (!chrome.runtime) chrome.runtime = chrome.extension;

//check url - autofill
chrome.runtime.sendMessage({checkURL: true}, function(response){
	if (response.login){
		document.getElementById("submit").onclick = function(){
			var usernameInput = document.getElementById("username-input");
		    var cks = document.getElementById("cipher-checksum");
		    var xmlhttp = new XMLHttpRequest();
		    xmlhttp.onreadystatechange = function(){
		        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
		            if (xmlhttp.responseText == "invalid"){
		                usernameInput.style.border = "red";
		                usernameInput.value = "invalid username";
		                console.log("response invalid");
		            }else{
		                // usernameInput.style.border = "green";
		                // cks.value = xmlhttp.responseText;
		                // console.log("checksum: " + cks.value);
		                var username = document.getElementById("username-input").value;
						var mpw = document.getElementById("mpw-input").value;
						checksum = xmlhttp.responseText;
						console.log("read login form: " + username + " " + mpw + " " + checksum);
						chrome.runtime.sendMessage({
							login: true, username:username, mpwValue: mpw, 
							cipherChecksum: checksum, closeTab: true
						});
		            }
		        }
		    }
		    xmlhttp.open("GET", "/pm-server/LoginServlet?username=" + usernameInput.value);
		    xmlhttp.send();
		}
		document.getElementById("login-form").addEventListener('submit', function(){
			console.log("login form submitted!");
			var username = document.getElementById("username-input").value;
			var mpw = document.getElementById("mpw-input").value;
			var cipherchecksum = document.getElementById("cipher-checksum").value;
			console.log("read login form: " + username + " " + mpw + " " + cipherchecksum);
			chrome.runtime.sendMessage({login: true, username:username, mpwValue: mpw, cipherChecksum: cipherchecksum});
		});
	}else if (response.register){
		// retrieve mpw and checksum
		console.log("enter register page");
		// form checking required @TODO
		document.getElementById("register-submit").addEventListener('click', function(){
			var username = document.getElementById("username-input").value;
			var mpw = document.getElementById("password-input").value;
			checksum = document.getElementById("checksum-input").value;
			console.log("CS:read in register form : " + username + " " + mpw + " " + checksum);
			// send mpw and checksum to background for initialization
			chrome.runtime.sendMessage({register: true, username: username, 
				mpwValue: mpw, checksum: checksum}, 
				function(response){
					console.log("CS register receive cipher checksum: " + response.cipherChecksum);
					document.getElementById("cipher-checksum").value = response.cipherChecksum;
					document.getElementById("register-form").submit();
			});
		});
	} else if (response.userpage) {
		checksum = response.checksum;
		document.getElementById("checksum").textContent = checksum;
		var pwdholder = "********";
		var ctpwds = document.getElementsByClassName("password");
		var list = new Array(ctpwds.length), ptpwds;
		for (var i = 0; i < ctpwds.length; i++) {
			list[i] = ctpwds[i].innerText;
			ctpwds[i].innerText = pwdholder;
		}
		var status = 0;
		chrome.runtime.sendMessage({decryption: true, content: list}, function(response){
			ptpwds = response.content;
			document.getElementById("show-password").addEventListener('click', function(){
				status = 1;
				 for (var i = 0; i < ctpwds.length; i++){
				 	ctpwds[i].innerText = ptpwds[i];
				 }
			});
			document.getElementById("hide-password").addEventListener('click', function(){
				if (status == 1){
					for (var i = 0; i < ctpwds.length; i++)
						ctpwds[i].innerText = pwdholder;
					status = 0;
				}
			});
		});
	} else if (response.autofill){
		var username = response.username;
		var thisurl = response.url;
		detectLoginForm();
		// query server for entry
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200){
				var resp = JSON.parse(xhr.responseText);
				if (resp.hasEntry == true){
					console.log("user has entry in " + url);
					console.log('entry info: ' + xhr.responseText);
					var ctpwd = resp.password; 
					var thispwd = ctpwd;   // @TODO !!!!!!!!!!!!!!!!
					console.log("user password: " + thispwd);
					if (passwordId && usernameId){
						document.getElementById(usernameId).value = resp.nickname;
						document.getElementById(passwordId).value = thispwd;
						addPopup();
						dialogOpenerHandler();
					} else console.error("There should be a login form");
				}
			}
		}
		xhr.open("POST", URL_QUERY_URL);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(JSON.stringify({username: username, url: thisurl}));
	} else if (response.nothing) {
		checksum = response.checksum;
		handleNormalPage();
	} else {
		handleNormalPage();
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log("receiving msg");
	if (request.autofill){
		if (passwordId && usernameId){
			document.getElementById(usernameId).value = request.nickname;
			document.getElementById(passwordId).value = request.password;
		} else {
			console.error("There should be a complete login form");
		}
	}
});

function handleNormalPage(){
	addPopup();
	detectLoginForm();
	if (passwordId || usernameId){
		dialogOpenerHandler();
	}
}

function detectLoginForm(){
	var hasPassword = false, hasUsername = false, count = 0;
	var inputs = document.getElementsByTagName('INPUT');
	for (var i = inputs.length - 1; i >= 0; i--) {
		var input = inputs[i];
		// add buttons to account id and password input elements
		if ( (input.type == 'password' || input.name == 'password') && input.id != '__popup_new_password_id' ){
			hasPassword = true;
			hasUsername = false;
			passwordId = input.id;
			if (!passwordId){
				passwordId = "__my_pm_pwd_id_" + (count++);
				input.id = passwordId;
			}
			console.log('find password id: ' + passwordId);
			addPopupOpener(input);
		} else if ( (input.type == 'text' || input.type == 'email') && input.id != '__popup_new_username_id'  && hasPassword && !hasUsername) {
			hasPassword = false;
			hasUsername = true;
			usernameId = input.id;
			if (!usernameId){
				usernameId = "__my_pm_username_id_" + (count++);
				input.id = usernameId;
			}
			console.log('find username id: ' + usernameId);
			addPopupOpener(input);
		} 
	}
}

function dialogOpenerHandler(){
	document.addEventListener('click', function(e){
		if (e.target.name == 'popupOpenerDiv' || e.target.name == 'popupOpenerImg'){
			chrome.runtime.sendMessage({checkLogin: true}, function(response){
				if (response.loginState == true){
					console.log("logged in!");
					popupClickHandler(e);
				} else if (response.loginState == false){
					console.log("not log in yet");
					chrome.runtime.sendMessage({openLogin: true});
				} else console.error("unexpected response in checkLogin");
			});
		}else popupClickHandler(e);
	});

	function popupClickHandler(e){
		if (e.target.name == 'popupOpenerDiv' || e.target.name == 'popupOpenerImg'){
			showPopup();
		} else if (e.target.id == '__popup_cancel_btn') {
			closePopup();
		} else if (e.target.id == '__popup_submit_btn') {
			console.log('save button clicked');
			var name = document.getElementById('__popup_account_name_id');
			var u = document.getElementById('__popup_new_username_id');
			var p = document.getElementById('__popup_new_password_id');
			if (!name || !u || !p){
				console.log('element in popup not found');
				return;
			}
			function hintNoInput(e) {
				e.style.border = "2px solid red";
			}
			if (name.value == "") {
				hintNoInput(name);
				return;
			} else if (u.value == "") {
				hintNoInput(u);
				return;
			} else if (p.value == "") {
				hintNoInput(p);
				return;
			}
			var msg = {
				addEntry: true,
				aValue: name.value,
				uValue: u.value,
				pValue: p.value
			}
			chrome.runtime.sendMessage(msg, function(response){
				console.log(response.done);
			});
			closePopup();
			window.location.reload();
		}
	}
}

function normalPage(){
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

	// add a popup div to body
	addPopup();
	var usernameId, passwordId;
	var hasPassword = false;
	for (var i = docs.length - 1; i >= 0; i--) {
		var inputs = docs[i].getElementsByTagName('INPUT');
		for (var i = inputs.length - 1; i >= 0; i--) {
			var input = inputs[i];
			// add buttons to account id and password input elements
			if ( (input.type == 'password' || input.name == 'password') && input.id != '__popup_new_password_id' ){
				// input.style.border = "3px solid red";
				// addButton(input);
				hasPassword = true;
				passwordId = input.id;
				console.log('find password id: ' + passwordId);
				addPopupOpener(input);
			} else if ( (input.type == 'text' || input.type == 'email') && input.id != '__popup_new_username_id'  && hasPassword) {
				// input.style.border = "3px solid yellow";
				hasPassword = false;
				usernameId = input.id;
				console.log('find username id: ' + usernameId);
				addPopupOpener(input);
			} 
		}
	}

	// add event listener
	document.addEventListener('click', function(e){
		if (e.target.name == 'popupOpenerDiv' || e.target.name == 'popupOpenerImg'){
			chrome.runtime.sendMessage({checkLogin: true}, function(response){
				if (response.loginState == true){
					console.log("logged in!");
					popupClickHandler(e);
				} else if (response.loginState == false){
					console.log("not log in yet");
					chrome.runtime.sendMessage({openLogin: true});
				} else console.error("unexpected response in checkLogin");
			});
		}else popupClickHandler(e);
	});

	function popupClickHandler(e){
		// console.log(e.target.name + ' was clicked');
		if (e.target.name == 'popupOpenerDiv' || e.target.name == 'popupOpenerImg'){
			showPopup();
		} else if (e.target.id == '__popup_cancel_btn') {
			closePopup();
		} else if (e.target.id == '__popup_submit_btn') {
			console.log('save button clicked');
			var name = document.getElementById('__popup_account_name_id');
			var u = document.getElementById('__popup_new_username_id');
			var p = document.getElementById('__popup_new_password_id');
			if (!name || !u || !p){
				console.log('element in popup not found');
				return;
			}
			function hintNoInput(e) {
				e.style.border = "2px solid red";
			}
			if (name.value == "") {
				hintNoInput(name);
				return;
			} else if (u.value == "") {
				hintNoInput(u);
				return;
			} else if (p.value == "") {
				hintNoInput(p);
				return;
			}
			var msg = {
				addEntry: true,
				aValue: name.value,
				uValue: u.value,
				pValue: p.value
			}
			chrome.runtime.sendMessage(msg, function(response){
				console.log(response.done);
			});
			closePopup();
		}
	}
}

function addPopupOpener(input) {
	if (!input.style.display || input.style.display == "inline-block")
		input.style.display = "block";

	var inputStyle = input.currentStyle || window.getComputedStyle(input);
	console.log("input border: " + inputStyle.borderBottomWidth);
	var bottomMargin = inputStyle.marginBottom.toString();
	var bottomBorder = inputStyle.borderBottomWidth.toString();
	var inputHeight = input.scrollHeight;
	var rightMargin = inputStyle.marginRight.toString();
	console.log("bottomMargin: " + bottomMargin + "\t" + "input height: " + inputHeight + "\t" + "border: " + bottomBorder + "\t" + "right margin: " + rightMargin);

	var marginMeasure = bottomMargin.substr(-2);
	var heightMeasure = bottomBorder.substr(-2);
	var imgMargin = 8;
	if (marginMeasure != heightMeasure){
		console.error("measure of margin and height distinct: margin: " + bottomMargin + " height: " + inputHeight);
		imgMargin = "0px";
	} else {
		if (bottomMargin.match("\.")){
			imgMargin += parseFloat(bottomMargin);
		} else imgMargin += parseInt(bottomMargin);
		if (bottomBorder.match("\."))
			imgMargin += parseFloat(bottomBorder);
		else imgMargin += parseInt(bottomBorder);
		if (inputHeight.toString().match("\."))
			imgMargin += (parseFloat(inputHeight) / 2);
		else imgMargin += (parseInt(inputHeight) / 2);
		imgMargin = "-" + imgMargin + marginMeasure;
	}
	console.log("img margin: " + imgMargin);

	var inputRect = input.getBoundingClientRect();
	var openerDiv = document.createElement("div");
	openerDiv.setAttribute("name", "popupOpenerDiv");
	openerDiv.style.width = "16px";
	openerDiv.style.height = "16px";
	openerDiv.style.display = "block";
	openerDiv.style.float = "right";
	openerDiv.style.marginTop = imgMargin;
	openerDiv.style.marginRight = rightMargin;
	openerDiv.style.zIndex = "999";
	openerDiv.style.position = "relative";
	var openerImg = document.createElement("img");
	openerImg.setAttribute("src", chrome.extension.getURL("icons/icon.png"));
	openerImg.setAttribute("name", "popupOpenerImg");
	openerImg.onmouseover = function() { openerImg.style.cursor = "pointer"; }
	openerImg.onmouseout = function() { openerImg.style.cursor = "default"; }
	openerDiv.appendChild(openerImg);
	var parent = input.parentNode;
	parent.insertBefore(openerDiv, input.nextSibling);
}

function addPopup(){
	// popup a little frame to input domain, username, and password
	var container = document.createElement("DIV");
	container.setAttribute("id", "__popup_container_id");
	var hint = document.createElement("P");
	hint.appendChild(document.createTextNode("保存该网站信息"));
	hint.style.clear = "left";
	container.appendChild(hint);
	var ckshint = document.createElement("P");
	ckshint.appendChild(document.createTextNode("校验码:  " + (checksum == null ? "请登录" : checksum)));
	ckshint.setAttribute("id", "__popup_checksum");
	ckshint.style.clear = "left";
	container.appendChild(ckshint);
	var nameLabel = document.createElement("LABEL");
	nameLabel.appendChild(document.createTextNode("名称:"));
	nameLabel.style.float = "left";
	nameLabel.style.width = "100%";
	container.appendChild(nameLabel);
	var nameInput = document.createElement('input');
	nameInput.style.border = "1px solid black";
	nameInput.setAttribute("type", "text");
	nameInput.setAttribute("id", "__popup_account_name_id");
	nameInput.style.float = "left";
	nameInput.style.width = "100%";
	container.appendChild(nameInput);
	var usernameLabel = document.createElement("LABEL");
	usernameLabel.appendChild(document.createTextNode("用户名:"));
	usernameLabel.style.float = "left";
	usernameLabel.style.width = "100%";
	container.appendChild(usernameLabel);
	var usernameInput = document.createElement('input');
	usernameInput.type = "text";
	usernameInput.id = "__popup_new_username_id";
	usernameInput.style.float = "left";
	usernameInput.style.width = "100%";
	usernameInput.style.border = "1px solid black";
	container.appendChild(usernameInput);
	var pwdLabel = document.createElement("LABEL");
	pwdLabel.appendChild(document.createTextNode("密码:"));
	pwdLabel.style.float = "left";
	pwdLabel.style.width = "100%";
	container.appendChild(pwdLabel);
	var pwd = document.createElement("input");
	pwd.type = "password";
	pwd.id = "__popup_new_password_id";
	pwd.style.float = "left";
	pwd.style.width = "100%";
	pwd.style.border = "1px solid black";
	container.appendChild(pwd);
	var btnCancel = document.createElement("BUTTON");
	btnCancel.appendChild(document.createTextNode("取消"));
	btnCancel.setAttribute("id", "__popup_cancel_btn");
	btnCancel.style.display = "inline";
	container.appendChild(btnCancel);
	var btnSubmit = document.createElement("BUTTON");
	btnSubmit.appendChild(document.createTextNode("保存"));
	btnSubmit.setAttribute("id", "__popup_submit_btn");
	btnSubmit.style.display = "inline";
	container.appendChild(btnSubmit);
	// set style of container
	container.style.border="4px solid green";
	container.style.width = "300px";
	container.style.height = "300px";
	container.style.display = "none";
	container.style.verticalAlign = "center";
	container.style.position = "absolute";
	container.style.top = "15%";
	container.style.left = "45%";
	container.style.background = "white";
	container.style.zIndex = "1000";
	container.style.opacity = "1";
	document.body.appendChild(container);

	var hideBack = document.createElement("div");
	hideBack.setAttribute("id", "__popup_hide_background_id");
	hideBack.style.display = "none";
	hideBack.style.position = "fixed";
	hideBack.style.top = 0;
	hideBack.style.left = 0;
	hideBack.style.width = "100%";
	hideBack.style.height = "100%";
	hideBack.style.opacity = "0.6";
	hideBack.style.background = "black";
	document.body.appendChild(hideBack);
}

function showPopup() {
	console.log('show pop up invoked');
	var popup = document.getElementById("__popup_container_id");
	var back = document.getElementById("__popup_hide_background_id");
	if (!back || !popup || !passwordId || !usernameId){
		console.log((back == null) + ' ' + (popup == null) + ' ' + (passwordId == null) + ' ' + (usernameId == null));
		return;
	}else {
		back.style.display = "block";
		popup.style.display = "block";
		document.getElementById('__popup_new_username_id').value = document.getElementById(usernameId).value;
		document.getElementById('__popup_new_password_id').value = document.getElementById(passwordId).value;
		document.getElementById('__popup_account_name_id').value = document.title;
		document.getElementById('__popup_checksum').innerText =  "校验码:  " + (checksum == null ? "请登录" : checksum);
	}
}

function closePopup() {
	var popup = document.getElementById("__popup_container_id");
	var back = document.getElementById("__popup_hide_background_id");
	if (popup && back) {
		document.getElementById('__popup_account_name_id').value = "";
		document.getElementById('__popup_new_username_id').value = "";
		document.getElementById('__popup_new_password_id').value = "";
		popup.style.display = "none";
		back.style.display = "none";
	}
}