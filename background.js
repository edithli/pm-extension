/*===================================================
 *            		  Main Process 
 *===================================================*/
console.log('background script running!');
// load grammar file
var grammar, vaultDist;
var replacementJson = {
	"3": "e",
	"4": "a",
	"1": "i",
	"$": "s",
	"0": "o",
	"@": "a",
	"z": "s"
}
var trie = new Trie(replacementJson);
loadJSON('data/grammar.cfg', function(text){
	grammar = JSON.parse(text); 
	console.log('grammar done');
	initialize();
	// test
	// var pt = parse("alaama777$rte_");
	// derive(pt);
	var arr = encodePwd("8802667aafb");
	decodePwd(arr);
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


/*===================================================
 *            			Tests 
 *===================================================*/
// var arr = encodeProb(17,29039);
// decodeProb(arr, 29039);

/*===================================================
 *            			Constants 
 *===================================================*/
 var MAX_PT_LEN = 50; // max number of rules in a parse tree
 var ARR_LEN = 4; // the number of elements in an encoding of Uint32Array

/*===================================================
 *            			Methods 
 *===================================================*/
function encodePwd(pwd){
 	var pt = parse(pwd);
 	if (pt.length > MAX_PT_LEN){
 		console.error("parse tree length overflow for : " + pwd + " with parse tree: \n" + pt.toString());
 		return;
 	}
 	var arr = new Uint32Array(ARR_LEN * MAX_PT_LEN);
 	window.crypto.getRandomValues(arr);
 	for (var i = 0; i < pt.length; i++){
 		var tmp = encodeProb(pt[i].getCumulativeFreq(), grammar[pt[i].lhs]._total);
 		for (var j = 0; j < ARR_LEN; j++)
 			arr[i * ARR_LEN + j] = tmp[j];
 	}
 	return arr;
}

function decodePwd(arr){
 	var index = 0;
 	var pt = new Array();
 	// start with G rule
 	var stack = new Array(), pt = new Array();
 	stack.push("G");
 	while (stack.length > 0 && index < arr.length){
 		var lhs = stack.pop();
 		var codeArr = new Uint32Array(ARR_LEN);
 		for (var i = 0; i < ARR_LEN; i++, index++)
 			codeArr[i] = arr[index];
 		var p = decodeProb(codeArr, grammar[lhs]._total);
 		var rhs; 
 		// find corresponding rhs
 		for (var key in grammar[lhs]){
 			if (key == "_total")
				continue;
 			if (p < grammar[lhs][key]){
 				rhs = key;
 				break;
 			} else p -= grammar[lhs][key];
 		}
 		var rule = new Rule(lhs, rhs);
 		console.log("get rule: " + rule.toString());
		pt.push(rule);
 		// get right hand side non-terminals
 		var nonTList = new Array();
 		if (lhs == "G" && rhs.includes(",")) {
			nonTList = rhs.split(",");
			nonTList.reverse();
		} else if (lhs.charAt(0) == "W") {
			for (var i = 0; i < rhs.length; i++)
				nonTList.push("L_" + rhs.charAt(i));
			nonTList.reverse();
		} else if (lhs == "T") {
			for (var i = 0; i < rhs.length; i++)
				nonTList.push("T_" + rhs.charAt(i));
			nonTList.reverse();
		}
		stack = stack.concat(nonTList);
 	}
 	return derive(pt);
}

function parse(s) {
	var pi = new Array(s.length), rules;
	for (var i = 0; i < pi.length; i++)
		pi[i] = new Array(s.length);
	for (var l = 0; l < s.length; l++) {
		for (var i = 0; i < s.length - l; i++) {
			var j = i + l;
			var seg = s.substring(i, j+1);
			// console.log("parse " + seg);
			rules = getAllMatches(seg);
			for (var k = i; k < j; k++) {
				if (pi[i][k] && pi[k+1][j]){
					// combine the two rules
					var tmp = new Rule(pi[i][k].lhs + "," + pi[k+1][j].lhs, pi[i][k].rhs + "," + pi[k+1][j].rhs);
					// tmp.extras.concat(pi[i][k].extras, pi[k+1][j].extras);
					tmp.addExtraList(pi[i][k].extras);
					tmp.addExtraList(pi[k+1][j].extras);
					tmp.setProb(pi[i][k].getProb() * pi[k+1][j].getProb());
					rules.push(tmp);
				}
			}
			pi[i][j] = findBest(rules);
		}
	}
	// build a parse tree base on the rules
	var base = pi[0][s.length-1];
	console.log("parse string " + s + " with rule: \n" + base.toString());
	var pt = new Array();
	var topRule = new Rule("G", base.lhs);
	if (topRule.getProb() == 0.0){
		// build a default catch all rules tree
		for (var i = 0; i < s.length; i++){
			if (s.charAt(i).match("[0-9]")){
				pt.push(new Rule("G", "D1,G"));
				pt.push(new Rule("D1", s.charAt(i)));
			} else if (s.charAt(i).match("[a-zA-Z]")){
				pt.push(new Rule("G", "W1,G"));
				pt.push(new Rule("W1", s.charAt(i)));
				pt.push(new Rule("L_" + s.charAt(i).toLowerCase(), s.charAt(i)));
			} else if (s.charAt(i).match("[\!\#\$\&\*\.\;\@\_]")) {
				pt.push(new Rule("G", "Y1,G"));
				pt.push(new Rule("Y1", s.charAt(i)));
			} else console.err("illegal character - " + s.charAt(i) + " - in string: " + s);
		}
		pt.push(new Rule("G", "|_|"));
	}else { // build a leftmost parse tree
		pt.push(topRule);
		var lhsList = base.lhs.split(","),
			rhsList = base.rhs.split(",");
		for (var i = 0; i < lhsList.length; i++) {
			var r = new Rule(lhsList[i], rhsList[i]);
			pt.push(r);
			if (r.lhs.charAt(0) == "W" || r.lhs == "T") {
				for (var j = 0; j < r.rhs.length; j++){
					pt.push(base.extras.shift());
				}
			}
		}
	}
	console.log("parse tree of " + s + "\n" + pt.toString());
	return pt;
}

function derive(pt) {
	var str = "";
	for (var i = 0; i < pt.length; i++) {
		if (pt[i].lhs.charAt(0).startsWith("L_")){
			str += pt[i].rhs;
		} else if (pt[i].lhs.startsWith("T_")){
			str += pt[i].rhs;
		} else if (pt[i].lhs == "G" || pt[i].lhs.startsWith("W") || pt[i].lhs == "T"){
			continue;
		} else {
			str += pt[i].rhs;
		}
	}
	console.log("derive get string: " + str);
	return str;
}

function getAllMatches(seg) {
	var rules = new Array();
	var r;
	if (r = parseWord(seg))
		rules.push(r);
	if (r = parseDate(seg)) 
		rules.push(r);
	for (var lhs in grammar) {
		if (lhs.charAt(0) != "T" && lhs.charAt(0) != "W" && lhs.charAt(0) != "L" && grammar[lhs][seg]) 
			rules.push(new Rule(lhs, seg));
	}
	return rules;
}

function findBest(rules) {
	// find the best according to probability
	var bestRule = null, max = 0.0, p;
	// console.log("all possible rules: ");
	for (var i = 0; i < rules.length; i++) {
		if ((p = rules[i].getProb()) && p > max) {
			bestRule = rules[i];
			max = p;
		}
		// console.log(rules[i].toString());
	}
	// console.log("best rule : " + bestRule);
	return bestRule;	
}

function parseWord(s) {
	var word = trie.getSimilarKey(s.toLowerCase());
	if (word) {
		var rule = new Rule(getWordGroup(word), word);
		for (var i = 0; i < word.length; i++) 
			rule.addExtra(new Rule("L_" + word.charAt(i), s.charAt(i)));
		return rule;
	}
	return null;
}

function parseDate(s) {
	var Y = '(19[0-9][0-9]|20[0-9][0-9])',
		y = '([0-9][0-9])',
    	m = '(0[0-9]|1[0-2])',
    	d = '([0-2][0-9]|3[01])';
    var pattern = {
    	"ymd" : `${y+m+d}`,
    	"Ymd" : `${Y+m+d}`,
		"mdy" : `${m+d+y}`,
		"mdY" : `${m+d+Y}`,
		"dmy" : `${d+m+y}`,
		"dmY" : `${d+m+Y}`,
		"md"  : `${m+d}`,
		"y"   : `${y}`,
		"Y"   : `${Y}`
    }
	var re;
    for (var pp in pattern) {
    	if ((re = s.match(pattern[pp])) && re[0] == s){
    		return buildRule(pp);
    	}
    }
    return null;
	function buildRule(rhs) {
		if (re == null || re == undefined)
			return null;
		var rule = new Rule("T", rhs);
		for (var i = 0 ; i < rhs.length; i++) 
			rule.addExtra(new Rule("T_" + rhs.charAt(i), re[i+1]));
		return rule;
	}
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
	// modify the G rules to compact default catch all rules
	grammar["G"]["|_|"] = 1;
	grammar["G"]["W1,G"] = 1;
	grammar["G"]["D1,G"] = 1;
	grammar["G"]["Y1,G"] = 1;
	grammar["G"]._total += 4;
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

function encodeProb(p, q) {
	console.log("encode prob: p - " + p + " q - " + q);
	// 128-bits secure random value
	// compute x + p - (x mod q)
	// x = arr[3] * 2^96 + arr[2] * 2^64 + arr[1] * 2^32 + arr[0]
	// get random x by get random arr
	var arr = new Uint32Array(ARR_LEN);
	window.crypto.getRandomValues(arr);
	// compute x mod q
	var ut = Math.pow(2, 32) % q;
	var sum = 0;
	for (var i = 0; i < arr.length; i++) {
		sum += ((arr[i] % q) * (Math.pow(ut, i) % q)) % q;
	}
	var xmodq = sum % q;
	// t = p - (x mod q) compute x + t
	var t = p - xmodq;
	if (t < 0 && arr[0] < -t){
		arr[0] = arr[0] + Math.pow(2, 32) + t;
		arr[1] -= 1;
	} else if (t < 0) {
		arr[0] += t;
	} else {
		if (arr[0] > arr[0] + t){
			if (arr[1] > arr[1] + 1){
				if (arr[2] > arr[2] + 1){
					if (arr[3] > arr[3] + 1){
						t -= q;
						if (t < 0 && arr[0] < -t){
							arr[0] = arr[0] + Math.pow(2, 32) + t;
							arr[1] -= 1;
						} else arr[0] += t;
					} else {
						arr[3] += 1;
						arr[2] += 1;
						arr[1] += 1;
						arr[0] += t;
					}
				} else arr[2] += 1;
			} else arr[1] += 1;
		} else arr[0] += t;
	}
	// now arr represents the final result
	return arr;
}

function decodeProb(arr, q) {
	// p = r mod q
	var sum = 0;
	var ut = Math.pow(2, 32) % q;
	for (var i = 0; i < arr.length; i++) {
		sum += ((arr[i] % q) * (Math.pow(ut, i) % q)) % q;
	}
	var p = sum % q;
	console.log("decode result: " + p);
	return p;
}

/*===================================================
 *            			Objects 
 *===================================================*/
 

function Trie(replacementJson) {
	// start with # and end with $
	this.root = new Node('#', (new Array()));
	this.replacements = replacementJson;
	this._getReplace = function(char) {
		return this.replacements[char];
	}
	this.getSimilarKey = function(s) {
		var chars = s.split("");
		var tmp = this.root;
		var similarKey = "";
		for (var i = 0; i < chars.length; i++) {
			var child = tmp.findChild(chars[i]);
			var repchild, replace;
			if (child) {
				tmp = child;
				similarKey += chars[i];
			} else if ((replace = this._getReplace(chars[i])) && (repchild = tmp.findChild(replace))){
				tmp = repchild;
				similarKey += replace;
			} else return null;
		}
		if (!tmp.findChild('$')) {
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
	this.extras = new Array();
	this.getProb = function() {
		if (this.type && this.type == "composite_rule"){
			return this.prob;
		}
		var freq = grammar[lhs][rhs];
		if (!freq) {
			this.prob = 0.0;
			return this.prob;
		} else if (this.lhs == "T") {
			var p  = freq / grammar[lhs]._total;
			this.prob = p;
			for (var i = 0; i < this.extras.length; i++) {
				p *= this.extras[i].getProb();
			}
			return p;
		} else {
			this.prob =  freq / grammar[lhs]._total;
			return this.prob;
		}
	}
	this.setProb = function(p){
		this.prob = p;
		this.type = "composite_rule";
	}
	this.addExtra = function(rule) {
		if (rule)
			this.extras.push(rule);
	}
	this.addExtraList = function(extras) {
		if (!extras) return;
		for (var i = 0; i < extras.length; i++){
			this.extras.push(extras[i]);
		}
	}
	this.toString = function() {
		var s = this.lhs + " -> " + this.rhs + " : " + this.prob + "\n";
		for (var i = 0; i < this.extras.length; i++) {
			s += "\t" + this.extras[i].toString();
		}
		return s;
	}
	this.getFreq = function() {
		return grammar[lhs][rhs];
	}
	this.getCumulativeFreq = function(){
		var cf = 0;
		for (var key in grammar[lhs]){
			if (key == "_total")
				continue;
			if (key != rhs){
				cf += grammar[lhs][key];
			}
			else break;
		}
		var p = parseInt(""+(Math.random() * this.getFreq())) + cf;
		return p;
	}
}

function HoneyVault(){
	this.pwdList = new Array();
}