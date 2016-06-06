function getCurrentURL(callback) {
	var queryInfo = {
		active: true,
		currentWindow: true
	};
	chrome.tabs.query(queryInfo, function(tabs){
		var tab = tabs[0];
		var url = tab.url;
		console.assert(typeof url == 'string', 'type of url should be a string');
		callback(url);
	});
}

function getChecksum(){
	// retrieve user's checksum
	var checksum = document.getElementById("checksum");
	checksum.textContent = "test";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			if (xmlhttp.responseText.match("no_user")){
				checksum.textContent = "请登录";
			}else checksum.textContent = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", "http://localhost:8080/pm-server/ChecksumServlet");
	xmlhttp.send();
}

document.addEventListener('DOMContentLoaded', function() {
	getCurrentURL(function(url){
		document.getElementById('url').textContent = url;
	});
	var links = document.getElementsByTagName("a");
	for (var i = links.length - 1; i >= 0; i--) {
		(function() {
			var ln = links[i];
			var dst = ln.href;
			ln.onclick = function(){
				// need to check whether user has logged in
				console.log('link clicked - jump to : ' + dst);
				chrome.tabs.create({active: true, url: dst});
			};
		})();
	}
	// getChecksum();
});

var port1 = chrome.extension.connect({name: "getchecksum"});
port1.postMessage("getchecksum");
port1.onMessage.addListener(function(msg){
	document.getElementById("checksum").textContent = (msg == "__TOLOGIN" ? "请登录" : msg);
});

function logout(){
	var port2 = chrome.extension.connect({name: "logout"});
	port2.postMessage("logout");
}

document.getElementById("logout").addEventListener("click", function(){
	var port2 = chrome.extension.connect({name: "logout"});
	port2.postMessage("logout");
});