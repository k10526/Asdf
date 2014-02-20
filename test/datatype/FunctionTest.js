module("Asdf.F")
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
	equal(Asdf.F.after(function(a){return false}, function(res){ return !res}, true)(), false, 'stop ok');
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
test("Asdf.F.partial", function(){
	function f(a,b){
		return a/b;
	}
	equal(Asdf.F.partial(f, undefined, 2)(4), 2, 'partial');
});
test("Asdf.F.orElse", function(){
	function fn(i){
		return i-1;
	}
	function elseFn(i){
		return i+1;
	}
	equal(Asdf.F.orElse(fn, elseFn)(1), 2, 'orElse ok');
});
test("Asdf.F.guarder", function(){
    var fibo = Asdf.F.guarded([
        {
            test: function(n){return n==0},
            fn: function(){return 1}
        },
        {
            test: function(n){return n==1},
            fn: function(){return 1}
        }, {
            test:function(n){return n>1},
            fn: function(n){return fibo(n-2)+fibo(n-1)}
        }
    ]);
    equal(fibo(1), 1, 'fibo 1 ok');
    equal(fibo(2), 2, 'fibo 2 ok');
    equal(fibo(10), 89, 'fibo 89 ok');
});
test("Asdf.F.sequence", function(){
    var f = Asdf.F.sequence(function(){return 1;}, function(){return 2});
    equal(f(), 2, 'sequence ok');
});
test("Asdf.F.overload", function(){
    var add = Asdf.F.overload(function(a,b){return a.length+b.length}, function(a,b){ return Asdf.O.isArray(a) && Asdf.O.isArray(b)});
    add = Asdf.F.overload(function(a,b){return a+b}, function(a,b){ return Asdf.O.isNumber(a) && Asdf.O.isNumber(b)}, add);
    equal(add(1,2), 3, 'ok');
    equal(add([],[]), 0, 'ok');
    throws(function(){add(1,[])}, 'throws');
});