console.log("TEST content script running!");

window.onload = function(){
	console.log("ready state changed");
	if(document.readyState == "complete"){
	    console.log("document finish loading");
	}
}	

var iframes = document.getElementsByTagName("IFRAME");
console.log("GET " + iframes.length + " iframes");
var docs = new Array();
for (var i = iframes.length - 1; i >= 0; i--) {
	var ifr = iframes[i];
	docs[i] = ifr.contentDocument || ifr.contentWindow.document;
}
for (var i = 0; i < docs.length; i++) {
	docs[i].html.style.border = "3px solid black";
}