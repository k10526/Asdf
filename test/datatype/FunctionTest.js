test("Asdf.F.identity", function(){
	equal(Asdf.F.identity('abc'), 'abc', 'indentity ok');
});
test("Asdf.F.bind", function() {
	function fn(){
		return this;
	}
	var obj = {};
	equal(Asdf.F.bind(fn, obj)(), obj, 'bind ok');
});
test("Asdf.F.curry", function() {
	function fn(a,b) {
		return a+b;
	}
	equal(Asdf.F.curry(fn,1,2)(), 3, 'curry ok');
});
test("Asdf.F.wrap", function() {
	function fn(a) {
		return -a;
	}
	equal(Asdf.F.wrap(fn, function(fn, a){ return -fn(a);})(2), 2, 'wrap ok');
});
test("Asdf.F.before", function() {
	function b(a){
		return !a;
	}
	function fn(a){
		return a;
	}
	equal(Asdf.F.before(fn, b)(true), true, 'before ok');
	equal(Asdf.F.before(fn, b, true)(true), false, 'stop ok');
});
test("Asdf.F.after", function() {
	function a(res, a){
		return res *a;
	}
	function fn(a) {
		return a*a;
	}
	equal(Asdf.F.after(fn, a)(2), 8, 'after ok');
});
test("Asdf.F.methodize", function() {
	var obj = {};
	function fn(obj) {
		return obj;
	};
	obj.f = Asdf.F.methodize(fn,  obj);
	equal(obj.f(), obj, 'methodize ok');
});
test("Asdf.F.composeRight", function() {
	function fn(a){
		return a*2;
	}
	function fn2(a){
		return a+2;
	}
	equal(Asdf.F.composeRight(fn, fn2)(2), 8, 'composeRight ok');
});
test("Asdf.F.compose", function() {
	function fn(a){
		return a*2;
	}
	function fn2(a){
		return a+2;
	}
	equal(Asdf.F.compose(fn, fn2)(2), 6, 'compose ok');
});
test("Asdf.F.or", function() {
	ok(Asdf.F.or(Asdf.O.isString, Asdf.O.isFunction, Asdf.O.isArray)('string'), 'string');
});

test("Asdf.F.and", function() {
	function fn(a){
		return a<10;
	}
	function fn1(a){
		return a<15;
	}
	function fn2(a){
		return a<20;
	}
	ok(Asdf.F.and(fn, fn1, fn2)(9), 'all true');
});