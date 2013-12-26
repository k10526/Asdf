test("Asdf.A.batch", function(){
	function not(t) {
		return !t;
	}
	var arr = Asdf.A.batch([true, false, true], [not, not, not]);
	deepEqual(arr, [false, true, false], 'batch ok');
});
test("Asdf.A.toArguments", function() {
	var arr = [1,2,3];
	deepEqual(Asdf.A.toArguments(arr, Asdf.Arg.toArray), [1,2,3], 'toArguments ok');
});