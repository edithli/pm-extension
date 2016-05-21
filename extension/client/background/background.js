/*===================================================
 *            		  Main Process 
 *===================================================*/

// with symmetric key: (neccessarity to be considered!)
// 1. exchange symmetric key with server with AJAX request
//		if no network yet, wait until user enter login 
//		upon receiving login request, exchange key with server
// 2. only with the key can the login info be parsed

// lifecycle -- session & mpw should be cleaned after browser exit

// without key:
// login page send mpw for background to initialize

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
	// console.log(CryptoJS.AES.encrypt("hello", "password"));
	test();

	// var ct = encryptPwd("mpw", "helloworld");
	// console.log("encryptPwd: " + ct);
	// var pt = decryptPwd("mpw", ct);
	// console.log("decryptPwd: " + pt);

	// var ctr = sjcl.mode.ctr;
	// console.log(!ctr);
	// derive(pt);
	// var arr = encodePwd("helloworld"); //@TODO: debug !!!!!!!!!!!!!!!!!!!!!!!!!!! for "checksum"
	// decodePwd(arr);
	// var pt = encrypt("pwd", arr);
	// decodePwd(decrypt("pwd", pt));
	// decodePwd(decrypt("pwd123", pt));
	// decodePwd(decrypt("lsdkjfe32", pt));
	// decodePwd(decrypt("pwD", pt));
	// var test = new Uint32Array(ARR_LEN * MAX_PT_LEN);
	// window.crypto.getRandomValues(test);
	// decodePwd(test);
});
loadJSON('data/vault_dist.cfg', function(text) {
	vaultDist = JSON.parse(text);
	// handle vaultDist
	for (var key in vaultDist){
		var total = 0;
		for (var n in vaultDist[key]){
			total += vaultDist[key][n];
		}
		vaultDist[key]._total = total;
	}
	console.log('vault dist done');
	// @TODO!
	// // test
	// var pt = parse("alaama777$rte_");
	// var pt2 = parse("aslife323234$@");
	// var sg = new SubGrammar(pt.concat(pt2));
	// var arr = sg.encodeSubGrammar();
	// sg.decodeSubGrammar(arr);
});

function closeCurrentTab(){
	chrome.tabs.query({active:true, currentWindow: true, url: LOGIN_URL, title: "Welcome Login"}, 
		function(tabs){
			chrome.tabs.remove(tabs[0].id);
	});
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	// console.log("enter listener");
	if (sender.tab) {
		var url = sender.tab.url;
		var domain = getDomain(url);
		if (url == LOGIN_URL){
			if (request.checkURL){
				// console.log("request from login page: " + url);
				sendResponse({login: true});
			}else if (request.login){
				console.log("request from login page: " + url);
				username = request.username;
				mpw = request.mpwValue;
				var cipherChecksum = String(request.cipherChecksum);
				checksum = decryptPwd(mpw, cipherChecksum);
				console.log("bk: got login info: " + username + " " + mpw + " " + checksum);
				if (request.closeTab){
					closeCurrentTab();
				}
			}
		} else if (url == REGISTER_URL){
			if (request.checkURL){
				sendResponse({register: true});
			}else if (request.register) {
				console.log("request to initialize from " + url);
				username = request.username;
				mpw = request.mpwValue;
				checksum = request.checksum;
				console.log("bk: get register info: " + username + " " + mpw + " " + checksum);
				// encrypt checksum for server to store
				// var cipherChecksum = sjcl.codec.hex.fromBits(encrypt(mpw, encodePwd())) @TODO
				var cipherChecksum = encryptPwd(mpw, checksum);
				console.log("cipherChecksum: " + cipherChecksum);
				sendResponse({cipherChecksum: cipherChecksum});
			}
		} else if (url == ){

		} else if (request.checkURL){
			// check login first !!!!!!!!!!
			if (!username || !mpw){
				sendResponse({nothing: true});
			} else {
				// check for auto-completion
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(){
					if (xhr.readyState == 4 && xhr.status == 200){
						var resp = JSON.parse(xhr.responseText);
						if (resp.hasEntry){
							console.log("user has entry in " + url);
							console.log('entry info: ' + xhr.responseText);
							var ctpwd = String(resp.password); 
							var thispwd = decryptPwd(mpw, ctpwd);
							chrome.tabs.sendMessage(sender.tab.id, {autofill: true, nickname: resp.nickname, password: thispwd}, function(response){});
							// sendResponse({autofill: true, nickname: resp.nickname, password: ctpwd});
						}
						// else 
							// sendResponse({normalPage: true});
					}
				}
				xhr.open("POST", URL_QUERY_URL);
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr.send(JSON.stringify({
					username: username,
					domain: domain
					// url: url
				}));
				sendResponse({nothing: true});
			}

			// sendResponse({normalPage: true});
		} else if (request.checkLogin){
			if (!mpw)
				sendResponse({loginState: false});
			else sendResponse({loginState: true});
		} else if (request.openLogin){
			chrome.tabs.create({url:LOGIN_URL});
		} else  if (request.addEntry){
			if (!mpw){
				sendResponse({error: "no_mpw"});
			}else{
				var a = request.aValue;
				var u = request.uValue;
				var p = request.pValue;
				var ctpwd = encryptPwd(mpw, p);
				console.log("receive from normal page: " + url + ": " + a + " " + u + " " + p);
				console.log("encrypt pwd: " + p + " get : " + ctpwd);
				sendResponse({done: "done"});
				// send encrypted data back to server
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(){
					if (xhr.readyState == 4 && xhr.status == 200){
						if (xhr.responseText.match("done"))
							console.log("entry stored!");
						else console.error("something wrong with entry store! \n\t" + xhr.responseText);
					}
				}
				xhr.open("POST", DATA_SERVER_URL);
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr.send(JSON.stringify({
					username: username,
					// domain:url, 
					domain: domain,
					ac_name:a,
					nickname:u,
					ctpwd:ctpwd
				}));
			}
		}else console.log("unexpected request: \n" + request);
	} 
});

var mpw, username, checksum;

/*===================================================
 *            			Constants 
 *===================================================*/
 var MAX_PT_LEN = 50; // max number of rules in a parse tree ------------ this cannot be too long for database to keep
 var MAX_SG_LEN = 50;
 var ARR_LEN = 4; // the number of elements in an encoding of Uint32Array
 var AES_ITER = 10000; // iteration count of aes encryption
 var KEY_LEN = 256;
 var SALT_WORD_LEN = 4; // 128-bit salt length
 var IV_WORD_LEN = 4;
 var SALT_BIT_LEN = 128;
 var IV_BIT_LEN = 128;
 var LOGIN_URL = "http://localhost:8080/pm-server/login.html";
 var REGISTER_URL = "http://localhost:8080/pm-server/register.html";
 var DATA_SERVER_URL = "http://localhost:8080/pm-server/AddAccountServlet";
 var URL_QUERY_URL = "http://localhost:8080/pm-server/QueryURLServlet";


/*===================================================
 *            			Methods 
 *===================================================*/

function getDomain(url){
	var domain;
	if (url.indexOf("://") > -1)
		domain = url.split("/")[2];
	else domain = domain.split("/")[0];
	domain = domain.split(":")[0];
	// domain = domain.substring(domain.indexOf(".")+1);
	console.log("domain: " + domain + " of url: " + url);
	return domain;
}

function test() {
	// decryptPwd("pwd", encryptPwd("pwd", "password12"));
	// var pwd = "password";
	// var codes = encodePwd("helloworld");
	// // decodePwd(codes);
	// var ct = encrypt(pwd, codes);

	// var ctstr = sjcl.codec.hex.fromBits(ct);
	// console.log("str ct: " + ctstr);
	// console.log(sjcl.codec.base64.fromBits(ct));
	// console.log(sjcl.codec.base32.fromBits(ct));
	// var ctbits = sjcl.codec.hex.toBits(ctstr);
	// // console.log("after: " + sjcl.codec.hex.fromBits(ctbits));

	// var ptarr = decrypt("password", ctbits);
	// var str = decodePwd(ptarr);

	// var password = "password";
	// var wpwd = "wrongpwd";
	// var plaintext = sjcl.codec.hex.toBits("23047ADBDEF23");
	// var count = 10000;
	// var length = 256;
	// var salt = sjcl.random.randomWords(4, 0);
	// console.log("salt: " + sjcl.codec.hex.fromBits(salt));
	// var iv = sjcl.random.randomWords(4, 0);
	// console.log("iv: " + sjcl.codec.hex.fromBits(iv));
	// var key = sjcl.misc.pbkdf2(password, salt, count, length);
	// console.log("key: " + sjcl.codec.hex.fromBits(key));
	// var aes = new sjcl.cipher.aes(key);
	// var enc = sjcl.mode.ctr.encrypt(aes, plaintext, iv);
	// console.log(sjcl.codec.hex.fromBits(enc));

	// var prf = new sjcl.cipher.aes(sjcl.misc.pbkdf2("wrongpwd", salt, count, length));
	// var dec = sjcl.mode.ctr.decrypt(prf, enc, iv);
	// console.log(sjcl.codec.hex.fromBits(dec));
}

function encryptPwd(mpw, plaintext){ // @TODO: debug!!!!!!!!!!!!!!!!
	var arr = encodePwd(plaintext);
	var ctbits = encrypt(mpw, arr);
	return sjcl.codec.base64.fromBits(ctbits);
	// return ctbits;
}

function decryptPwd(mpw, ciphertext){
	// var arr = decrypt(mpw, ciphertext);
	var arr = decrypt(mpw, sjcl.codec.base64.toBits(ciphertext));
	return decodePwd(arr);
}

// encrypt a Uint32Array
// return a bitArray
function encrypt(password, arr){
	// console.log("encrypt + arr len: " + arr.length);
	var str = "";
	for (var i = 0; i < arr.length; i++){
		var tmp = arr[i].toString(16);
		for (var j = tmp.length; j < 8; j++)
			str += "0";
		str += arr[i].toString(16);
		// console.log("arr " + i + " : " + arr[i].toString(16));
	}
	// console.log("plaintext: " + str);
	// compute aes key
	var salt = sjcl.random.randomWords(SALT_WORD_LEN, 0);
	// console.log("salt: " + sjcl.codec.hex.fromBits(salt));
	var key = sjcl.misc.pbkdf2(password, salt, AES_ITER, KEY_LEN);
	// console.log("key: " + sjcl.codec.hex.fromBits(key));
	var plaintext = sjcl.codec.hex.toBits(str);
	var aes = new sjcl.cipher.aes(key);
	var iv = sjcl.random.randomWords(IV_WORD_LEN, 0);
	// console.log("iv: " + sjcl.codec.hex.fromBits(iv));
	var ctbits = sjcl.mode.ctr.encrypt(aes, plaintext, iv);
	var ctstr = sjcl.codec.base64.fromBits(ctbits);
	// console.log("ciphertext: " + ctstr);
	// append the salt and iv into the ciphertext
	var ct = sjcl.bitArray.concat(salt, iv);
	ct = sjcl.bitArray.concat(ct, ctbits);
	// console.log("final ct: " + sjcl.codec.hex.fromBits(ct));

	// var ct = sjcl.encrypt(password, str, {iter:10000, ks:256, adata:ADATA});
	// return ct.match(/"ct":"([^"]*)"/)[1];
	// console.log("ct length: " + sjcl.bitArray.bitLength(ct));
	return ct;
}

function decrypt(password, ct){
	// var rp = {};
	// var pt = sjcl.decrypt(password, ct, {}, rp);
	// var adata = sjcl.codec.utf8String.fromBits(rp.adata);
	// if (adata != ADATA)
	// 	throw new sjcl.exception.invalid("adata not correct!!");
	// console.log("decrypt");

	var salt = sjcl.bitArray.bitSlice(ct, 0, SALT_BIT_LEN);
	var iv = sjcl.bitArray.bitSlice(ct, SALT_BIT_LEN, SALT_BIT_LEN + IV_BIT_LEN);
	var ciphertext = sjcl.bitArray.bitSlice(ct, SALT_BIT_LEN + IV_BIT_LEN);
	// console.log("salt: " + sjcl.codec.hex.fromBits(salt));
	// console.log("iv: " + sjcl.codec.hex.fromBits(iv));
	// console.log("ciphertext: " + sjcl.codec.base64.fromBits(ciphertext));
	var key = sjcl.misc.pbkdf2(password, salt, AES_ITER, KEY_LEN);
	// console.log("key: " + sjcl.codec.hex.fromBits(key));
	var aes = new sjcl.cipher.aes(key);
	var ptbits = sjcl.mode.ctr.decrypt(aes, ciphertext, iv);
	var pt = sjcl.codec.hex.fromBits(ptbits);
	// console.log("plaintext: " + pt);

	// split the string into arr
	var arr = new Array(MAX_PT_LEN * ARR_LEN); 
	for (var i = 0; i < arr.length; i++){
		arr[i] = parseInt(pt.substring(8 * i, 8 * (i + 1)), 16);
		// console.log("arr " + i + " : " + arr[i].toString(16));
	}
	return arr;
}

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
 		// decode a new rule
 		var codeArr = new Uint32Array(ARR_LEN);
 		for (var i = 0; i < ARR_LEN; i++, index++)
 			codeArr[i] = arr[index];
 		var rule = decodeRule(codeArr, lhs);
 		var rhs = rule.rhs;
 		// console.log("get rule: " + rule.toString());
		pt.push(rule);
 		// get right hand side non-terminals
 		var nonTList = new Array();
 		if (lhs == "G" && rhs != "|_|") {
			nonTList = rhs.split(",");
			nonTList.reverse();
		} else if (lhs.startsWith("W")) { //--------------------------------------------
			// decode next L rule and L_ rules
			for (var i = 0; i < ARR_LEN; i++, index++)
				codeArr[i] = arr[index];
			rule = decodeRule(codeArr, "L");
			pt.push(rule);
			switch (rule.rhs){
				case "lower": 
				case "UPPER":
				case "Caps":
					break;
				case "l33t":
					for (var i = 0; i < rhs.length; i++)
						nonTList.push("L_" + rhs.charAt(i));
					nonTList.reverse();
					break;
			}
			// for (var i = 0; i < rhs.length; i++)
			// 	nonTList.push("L_" + rhs.charAt(i));
			// nonTList.reverse();
		} else if (lhs == "T") {
			for (var i = 0; i < rhs.length; i++)
				nonTList.push("T_" + rhs.charAt(i));
			nonTList.reverse();
		}
		stack = stack.concat(nonTList);
 	}
 	return derive(pt);
}

function decodeRule(arr, lhs){
	var p = decodeProb(arr, grammar[lhs]._total);
	var rhs; 
	for (var key in grammar[lhs]){
		if (key == "_total")
			continue;
		if (p < grammar[lhs][key]){
			rhs = key;
			break;
		} else p -= grammar[lhs][key];
	}
	return new Rule(lhs, rhs);
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
	// console.log("parse string " + s + " with rule: \n" + base.toString());
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
				pt.push(new Rule("W1", s.charAt(i).toLowerCase()));
				if (s.charAt(i).match("[a-z]")){
					pt.push(new Rule("L", "lower"));
				} else {
					pt.push(new Rule("L", "UPPER"));
				}
				// pt.push(new Rule("L_" + s.charAt(i).toLowerCase(), s.charAt(i)));
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
			if (r.lhs == "T") {
				for (var j = 0; j < r.rhs.length; j++){
					pt.push(base.extras.shift());
				}
			} else if (r.lhs.startsWith("W")){
				var lrule = base.extras.shift();
				switch (lrule.rhs) {
					case "lower":
					case "UPPER":
					case "Caps":
						pt.push(lrule);
						break;
					case "l33t":
						pt.push(lrule);
						for (var j = 0; j < r.rhs.length; j++)
							pt.push(base.extras.shift());
						break;
				}
			}
		}
	}
	console.log("parse tree of " + s + "\n" + pt.toString());
	return pt;
}

function derive(pt) {
	// console.log("derive parse tree: " + pt.toString());
	var str = "";
	var buff = "";
	for (var i = 0; i < pt.length; i++) {
		if (pt[i].lhs.startsWith("W")) {
			buff = pt[i].rhs;
		} else if (pt[i].lhs == "L") {
			switch (pt[i].rhs) {
				case "lower": 
					str += buff;
					buff = "";
					break;
				case "UPPER":
					str += buff.toUpperCase();
					buff = "";
					break;
				case "Caps":
					str += buff.charAt(0).toUpperCase() + buff.substring(1);
					buff = "";
					break;
				default: break;
			}
		} else if (pt[i].lhs.startsWith("L_") && buff != "") {
			str += pt[i].rhs;
		} else if (pt[i].lhs == "G" || pt[i].lhs == "T") {
			continue;
		} else {
			str += pt[i].rhs;
		}

		// if (pt[i].lhs.charAt(0).startsWith("L_")){
		// 	str += pt[i].rhs;
		// } else if (pt[i].lhs.startsWith("T_")){
		// 	str += pt[i].rhs;
		// } else if (pt[i].lhs == "G" || pt[i].lhs.startsWith("W") || pt[i].lhs == "T"){
		// 	continue;
		// } else {
		// 	str += pt[i].rhs;
		// }
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
		// there should be L rules
		var re;
		if ((re = s.match("[A-Z]+")) && re[0] == s){
			rule.addExtra(new Rule("L", "UPPER"));
		} else if ((re = s.match("[a-z]+")) && re[0] == s){
			rule.addExtra(new Rule("L", "lower"));
		} else if ((re = s.match("[A-Z][a-z]+")) && re[0] == s){
			rule.addExtra(new Rule("L", "Caps"));
		} else {
			rule.addExtra(new Rule("L", "l33t"));
			for (var i = 0; i < word.length; i++){
				rule.addExtra(new Rule("L_" + word.charAt(i), s.charAt(i)));
			}
		}

		// for (var i = 0; i < word.length; i++) 
		// 	rule.addExtra(new Rule("L_" + word.charAt(i), s.charAt(i)));
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
	// console.log("encode prob: p - " + p + " q - " + q);
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

	// var str = "";
	// for (var i = 0; i < arr.length; i++){
	// 	var tmp = arr[i].toString(16);
	// 	for (var j = tmp.length; j < 8; j++)
	// 		str += "0";
	// 	str += arr[i].toString(16);
	// 	// console.log("arr " + i + " : " + arr[i].toString(16));
	// }
	// console.log("arr: " + str);

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
	// console.log("decode result: " + p);
	return p;
}

function contain(arr,e){
	for (var i = 0; i < arr.length; i++)
		if (arr[i] == e)
			return true;
	return false;
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
		} else if (this.lhs.startsWith("W")){
			this.prob =  freq / grammar[lhs]._total;
			for (var i = 0; i < this.extras.length; i++) {
				if (this.extras[i].getProb() == 0.0)
					return 0.0;
			}
			return this.prob;
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

// unfinished
function HoneyVault(checksome, pwdList){
	this.pwdList = pwdList;
	this.checksome = checksome;
	this.encodeVault = function(){

	}
}

// untested
function SubGrammar(rules) {
	this.__subgrammar = {};
	this._buildSubGrammar = function(rules){
		if (!rules){
			console.log("encode subgrammar without rules");
			return;
		}
		for (var i = 0; i < rules; i++){
			var lhs = rules[i].lhs,
				rhs = rules[i].rhs;
			if (lhs.startsWith("L"))
				continue;
			if (!this.__subgrammar[lhs]){
				this.__subgrammar[lhs] = {};
				this.__subgrammar[lhs]._count = 0;
			}
			if (!this.__subgrammar[lhs][rhs]){
				this.__subgrammar[lhs][rhs] = 1;
				this.__subgrammar[lhs][rhs]._count++;
			}
		}
		console.log("build subgrammar: \n" + this.__subgrammar.toString());
	}
	this.encodeSubGrammar = function(){
		this._buildSubGrammar(rules);
		// for (var i = 0; i < this.pwdList.length; i++){
		// 	var pt = parse(this.pwdList[i]);
		// 	for (var j = 0; j < pt.length; j++){
		// 		if (pt[j].lhs.startsWith("L"))
		// 			continue;
		// 		if (!this.__subgrammar[pt[j].lhs]){
		// 			this.__subgrammar[pt[j].lhs] = {};
		// 			this.__subgrammar[pt[j].lhs]._count = 0;
		// 		}
		// 		if (!this.__subgrammar[pt[j].lhs][pt[j].rhs]){
		// 			this.__subgrammar[pt[j].lhs][pt[j].rhs] = 1;
		// 			this.__subgrammar[pt[j].lhs]._count++;
		// 		}
		// 	}
		// }
		var sgarr = new Uint32Array(ARR_LEN * MAX_SG_LEN);
		window.crypto.getRandomValues(sgarr);
		var index = 0;
		var stack = new Array(), done = new Array();
		stack.push("G");
		while (stack.length > 0 && index < sgarr.length){
			var lhs = stack.pop();
			done.push(lhs);
			// encode rule size first
			var size = this.__subgrammar[lhs]._count;
			if (!vaultDist[lhs][size])
				console.err("rule size exceed max length for " + lhs);
			// get cumulative frequency
			var cf;
			for (var sn in vaultDist[lhs]){
				if (size != parseInt(sn))
					cf += vaultDist[lhs][sn];
				else break;
			}
			var p = parseInt(""+(Math.random() * vaultDist[lhs][size])) + cf;
			var arr = encodeProb(p, vaultDist[lhs]._total);
			for (var i = 0; i < arr.length; i++, index++)
				sgarr[index] = arr[i];
			// encode each grammar with lhs and get the nonTList
			var nonTList = new Array();
			for (var rhs in this.__subgrammar[lhs]){
				var r = new Rule(lhs, rhs);
				arr = encodeProb(r.getCumulativeFreq(), grammar[lhs]._total);
				for (var i = 0; i < arr.length; i++, index++)
					sgarr[index] = arr[i];
				// parse rhs and get the non terminals
				if (lhs == "G") {
					nonTList = nonTList.concat(rhs.split(","));
				} else if (lhs == "T") {
					for (var i = 0; i < rhs.length; i++)
						nonTList.push("T_" + rhs.charAt(i));
				}
			}
			for (var i = nonTList.length - 1; i >= 0; i--) {
				if (!contain(done, nonTList[i]) && !contain(stack, nonTList[i]))
					stack.push(nonTList[i]);
			}
		}
		return sgarr;
	}
	this.decodeSubGrammar = function(sgarr){
		var stack = new Array(), done = new Array();
		var sgrules = new Array();
		stack.push("G");
		var index = 0;
		while (stack.length > 0 && index < sgarr.length){
			var lhs = stack.pop();
			done.push(lhs);
			// decode size
			var tmparr = new Uint32Array();
			for (var i = 0; i < ARR_LEN; i++, index++)
				tmparr[i] = sgarr[index];
			var p = decodeProb(tmparr, vaultDist[lhs]._total);
			var size;
			for (var sn in vaultDist[lhs]){
				if (p < vaultDist[lhs][sn])
					size = parseInt(sn);
				else p -= vaultDist[lhs][sn];
			}
			// decode rules
			var nonTList = new Array();
			for (var i = 0; i < size; i++){
				for (var j = 0; j < ARR_LEN; j++, index++)
					tmparr[i] = sgarr[index];
				var rule = decodeRule(tmparr, lhs);
				// console.log("decode get rule: " + rule.toString());
				sgrules.push(rule);
				// get nonTList
				if (lhs == "G") {
					nonTList = nonTList.concat(rule.rhs.split(","));
				} else if (lhs == "T") {
					for (var i = 0; i < rule.rhs.length; i++)
						nonTList.push("T_" + rule.rhs.charAt(i));
				}
			}
			for (var i = nonTList.length - 1; i >= 0; i--) {
				if (!contain(done, nonTList[i]) && !contain(stack, nonTList[i]))
					stack.push(nonTList[i]);
			}
		}
		this._buildSubGrammar(sgrules);
	}

}

/*=======================================================================================
 * Things to mention: 
 *		the random function in cumulative frequency is Math.random() which is not secure
 *=======================================================================================*/