
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
	initialize();
	// test
	console.log(trie.getSimilarKey("h3llow0rld"));
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

function parseWord(s) {
	var word = trie.getSimilarKey(s.toLowerCase());
	if (word) {
		var rule = new Rule(getWordGroup(word), word);

		return rule;
	}
	return null;
}

function getWordGroup(word) {
	if (word.length == 1){
		return "W1";
	}else if (word.length <= 8) {
		return "W".concat(word.length - 1);
	} else {
		return "W9";
	}
}

function initialize() {
	// build trie
	for (var i = 1; i <= 9; i++) {
		var words = grammar['W'.concat(i)];
		if (!words) { continue; }
		for (var key in words) {
			trie.insert(key);
		}
	}
	// add total attribute of grammar
	for (var key in grammar) {
		var pairs = grammar[key];
		var total = 0;
		for (var terminal in pairs) {
			total += pairs[terminal];
		}
		grammar[key]._total = total;
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
	this.getSimilarKey = function(s) {
		var chars = s.split("");
		var tmp = this.root;
		var similarKey = "";
		for (var i = 0; i < chars.length; i++) {
			var child = tmp.findChild(chars[i]);
			var replace = this._getReplace(chars[i]);
			if (replace){
				var repchild = tmp.findChild(replace);
			}
			if (!child && !repchild) {
				return null;
			} else {
				tmp = child ? child : repchild;
				similarKey.concat((child ? chars[i] : replace));
			}
		}
		var end = tmp.findChild('$');
		if (!end) {
			return null;
		} else {
			return similarKey;
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

function Rule(lhs, rhs) {
	this.lhs = lhs;
	this.rhs = rhs;
	this.prob = 0.0;
	this.extras = new Array();
	this.getProb = function() {
		var freq = grammar[lhs][rhs];
		console.log("get freq: " + freq);
		if (!freq) {
			return 0.0;
		} else {
			this.prob =  freq / grammar[lhs]._total;
			return this.prob;
		}
	}
}