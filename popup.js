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

// retrieve user's checksum
var checksum = document.getElementById("checksum");
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function(){
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
		if (xmlhttp.responseText == "no_user"){
			checksum.value = "请登录";
		}else checksum.value = xmlhttp.responseText;
	}
}
xmlhttp.open("GET", "/ChecksumServlet");
xmlhttp.send();

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
});