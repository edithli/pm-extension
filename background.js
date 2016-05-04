
console.log('background script running!');
// load grammar file
var grammar, vaultDist;
var replacementJson = {
	"3": "e",
	"1": "l",
	"2": "z",
	"$": "s",
	"0": "o",
	"@": "a",
	"8": "b",
	"6": "b"
}
var trie = new Trie(replacementJson);
loadJSON('data/grammar.cfg', function(text){ 	
	grammar = JSON.parse(text); 
	console.log('grammar done');
	buildTrie();
});
loadJSON('data/vault_dist.cfg', function(text) { 	
	vaultDist = JSON.parse(text); 	
	
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (sender.tab) {
		var url = sender.tab.url;
		var a = request.aValue;
		var u = request.uValue;
		var p = request.pValue;
		console.log(url + ": " + a + " " + u + " " + p);
		sendResponse({done: "done"});
	} 
});

function parseString(s) {

}

function parseWord(word) {
	if (trie.contain(word.toLowerCase())) {
		
	}
}

function buildTrie(){
	// var wordList = new Array();
	for (var i = 1; i <= 9; i++) {
		// console.log(grammar['W'.concat(i)]);
		var words = grammar['W'.concat(i)];
		if (!words) { continue; }
		for (var key in words) {
			// wordList.push(key);
			trie.insert(key);
		}
	}
}

function loadJSON(path, callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType('application/json');
	xobj.open('GET', path, true);
	xobj.onreadystatechange = function() {
		if (xobj.readyState == 4 && xobj.status == "200") {
			callback(xobj.responseText);
		}
	}
	xobj.send(null);
}

function Trie(replacementJson) {
	// start with # and end with $
	this.root = new Node('#', (new Array()));
	this.replacements = replacementJson;
	this._getReplace = function(char) {
		for (var key in this.replacements){
			if (key == char){
				return this.replacements[key];
			}
		}
		return null;
	}
	this.contain = function(s) {
		var chars = s.split("");
		var tmp = this.root;
		for (var i = 0; i < chars.length; i++) {
			var child = tmp.findChild(chars[i]);
			var replace = this._getReplace(chars[i]);
			if (replace){
				var repchild = tmp.findChild(replace);
			}
			if (!child && !repchild) {
				return false;
			} else {
				tmp = child ? child : repchild;
			}
		}
		var end = tmp.findChild('$');
		if (!end) {
			return false;
		} else {
			return true;
		}
	}
	this.insert = function(s) {
		var chars = s.split("");
		var tmp = this.root;
		for (var i = 0; i < chars.length; i++) {
			var child = tmp.findChild(chars[i]);
			if (!child) {
				var newNode = new Node(chars[i], (new Array()));
				tmp.children.push(newNode);
				tmp = newNode;
			} else {
				tmp = child;
			}
		}
		var end = tmp.findChild('$');
		if (!end){
			var newEnd = new Node('$', (new Array()));
			tmp.children.push(newEnd);
		}
	}

	function Node(char, childrenArray) {
		this.char = char;
		this.children = childrenArray;
		this.findChild = function(c) {
			for (var i = this.children.length - 1; i >= 0; i--) {
				if (this.children[i].char == c){
					return this.children[i];
				}
			}
			return null;
		}
		this.isEnd = function() {
			return this.char == '$';
		}
	}
}