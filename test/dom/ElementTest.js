test("Asdf.Element.isWhitespace", function() {
	ok(Asdf.Element.isWhitespace(document.createElement('div'),'ok'));
});
test("Asdf.Element.addClass", function() {
	var div = document.createElement('div');
	equal(Asdf.Element.addClass(div, 'aa').className, 'aa', '클래스 하나 넣을 경우');
	equal(Asdf.Element.addClass(div, 'aa bb').className, 'aa bb', '클래스를 두개 넣을 경우');
});
test("Asdf.Element.removeClass", function() {
	var div = document.createElement('div');
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div, 'aa').className, 'bb cc', '클래스 하나 삭제할 경우');
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div, 'aa cc').className, 'bb', '클래스 두개를 삭제할 경우');
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div).className, '', '클래스 전체 삭제할 경우');
});
test("Asdf.Element.toggleClass", function() {
	var div = document.createElement('div');
	equal(Asdf.Element.toggleClass(div, 'aa').className, 'aa', '없는 클래스 토글 경우');
	equal(Asdf.Element.toggleClass(div, 'aa').className, '', '있는 클래스 토클 경우');
	div.className = 'aa';
	equal(Asdf.Element.toggleClass(div, 'aa bb').className, 'bb', '있고 없는 클래스를 토글한 경우');
});