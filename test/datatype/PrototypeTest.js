test("Asdf.P.mix", function(){
	var fn = function() {};
	var obj1 = {a:function(a){return a+2;}};
	var obj2 = {a:function(a){return a*2;}};
	Asdf.P.mix(fn, obj1);
	Asdf.P.mix(fn, obj2);
	var o = new fn();
	equal(o.a(2), 8, 'ok');
});