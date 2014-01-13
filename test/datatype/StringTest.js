test("Asdf.S.template", function(){
	var t = Asdf.S.template('aa ? bb ? cc ?', /\?/g);
	t.set(1, 'bbb');
	t.set(2, 'ccc');
	t.set(3, 'ddd');
	equal(t.toString(), 'aa bbb bb ccc cc ddd', 'number template');
	
	var t1 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	t1.set('AA', 'bbb');
	t1.set('BB', 'ccc');
	//t1.set('CC', 'ddd');
	t1.set(3, 'ddd');
	equal(t1.toString(), 'aa bbb bb ccc cc ddd', 'string template');
	var t2 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	var obj = {AA: 'bbb', BB:'ccc', CC: 'ddd'};
	t2.set(obj);
	equal(t2.toString(), 'aa bbb bb ccc cc ddd', 'object template');
	var t3 = Asdf.S.template('aa <?AA?> bb <?BB?> cc <?CC?>', /\<\?([\s\S]+?)\?\>/g);
	t3.set(1, 'bbb');
	t3.set(2, 'ccc');
	t3.set(3, 'ddd');
	equal(t3.toString(), 'aa bbb bb ccc cc ddd', '1number template');
	var t4 = Asdf.S.template('aa {{AA}} bb {{AA}} cc {{AA}}');
	var obj = {AA: 'bbb'};
	t4.set(obj);
	equal(t4.toString(), 'aa bbb bb bbb cc bbb', '같은 키가 있을때');
});
test("Asdf.S.isBlank", function() {
	ok(Asdf.S.isBlank(' '), 'space is blank');
});
test("Asdf.S.isEmpty", function() {
	ok(Asdf.S.isEmpty(''), '"" is empty');
});
test("Asdf.S.toQueryParams", function(){
	deepEqual(Asdf.S.toQueryParams('a=1&a=2&b=3&c=4'), {a:[1,2],b:3,c:4}, 'toQueryParams');
});
