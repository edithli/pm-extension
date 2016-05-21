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