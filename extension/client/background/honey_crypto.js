honey.crypto = {
	grammar,
	vaultDist,
	replacementJson = { "3": "e", "4": "a", "1": "i", "$": "s", "0": "o", "@": "a", "z": "s" },
	trie = new Trie(replacementJson),
	initialize: function(){

	}
}

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
	test();
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

