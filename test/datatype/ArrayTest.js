module("Asdf.A")
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
test("Asdf.A.concat", function(){
    var a1 = [1,2,3];
    var a2 = [4,5,6];
    deepEqual(Asdf.A.concat(a1,a2), [1,2,3,4,5,6], 'concat ok');
});
test("Asdf.A.count", function(){
    var a = [1,2,3,4,5,6,7];
    equal(Asdf.A.count(a, function(v){return v>3;}), 4, 'count ok');
});
test("Asdf.A.repeat", function(){
    var fn = Asdf.Core.behavior.iterate(Asdf.Core.op.inc, 0);
    deepEqual(Asdf.A.repeat(fn, 10), [0,1,2,3,4,5,6,7,8,9], 'repeat fn ok');
    deepEqual(Asdf.A.repeat(fn, 10, 0), [0,0,0,0,0,0,0,0,0,0], 'repeat fn with arg ok');
});
test("Asdf.A.rotate", function(){
    var arr = [1,2,3,4,5];
    deepEqual(Asdf.A.rotate(arr, 2), [4,5,1,2,3], '2 rotate ok');
    arr = [1,2,3,4,5];
    deepEqual(Asdf.A.rotate(arr, -2), [3,4,5,1,2], '-2 rotate ok');
});