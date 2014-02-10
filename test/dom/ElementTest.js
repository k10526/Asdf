module("Asdf.Element", {
    setup:function(){
        div = document.createElement('div');
    },
    teardown: function(){
        div = null;
    }
});
var div;
test("Asdf.Element.isWhitespace", function() {
	ok(Asdf.Element.isWhitespace(document.createElement('div'),'ok'));
});
test("Asdf.Element.addClass", function() {
	equal(Asdf.Element.addClass(div, 'aa').className, 'aa', '클래스 하나 넣을 경우');
	equal(Asdf.Element.addClass(div, 'aa bb').className, 'aa bb', '클래스를 두개 넣을 경우');
});
test("Asdf.Element.removeClass", function() {
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div, 'aa').className, 'bb cc', '클래스 하나 삭제할 경우');
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div, 'aa cc').className, 'bb', '클래스 두개를 삭제할 경우');
	div.className = 'aa bb cc';
	equal(Asdf.Element.removeClass(div).className, '', '클래스 전체 삭제할 경우');
});
test("Asdf.Element.toggleClass", function() {
	equal(Asdf.Element.toggleClass(div, 'aa').className, 'aa', '없는 클래스 토글 경우');
	equal(Asdf.Element.toggleClass(div, 'aa').className, '', '있는 클래스 토클 경우');
	div.className = 'aa';
	equal(Asdf.Element.toggleClass(div, 'aa bb').className, 'bb', '있고 없는 클래스를 토글한 경우');
});
test("Asdf.Element.walk", function(){
    div.innerHTML = 'aa<div>bb</div><div>cc</div>'
    equal(Asdf.Element.walk(div, Asdf.F.partial(Asdf.Element.addClass, undefined, '11')).innerHTML, 'aa<div class=\"11\">bb</div><div class=\"11\">cc</div>', 'walk ok')
});
test("Asdf.Element.visible", function(){
    ok(Asdf.Element.visible(div), 'show visible true');
    Asdf.Element.hide(div);
    ok(!Asdf.Element.visible(div), 'hide visible false');
});
test("Asdf.Element.toggle", function(){
    Asdf.Element.toggle(div);
    ok(!Asdf.Element.visible(div), 'toggle ok');
});
test("Asdf.Element.hide", function(){
    Asdf.Element.hide(div);
    ok(!Asdf.Element.visible(div), 'hide ok');
});
test("Asdf.Element.show", function(){
    Asdf.Element.hide(div);
    ok(!Asdf.Element.visible(div), 'show ok');
});
test("Asdf.Element.text", function(){
    equal(Asdf.Element.text(div, 'hi').innerHTML, 'hi', 'value가 있을 경우 ok');
    equal(Asdf.Element.text(div), 'hi', 'value가 없을 경우 ok');
});
test("Asdf.Element.value", function(){
    var input = document.createElement('input');
    equal(Asdf.Element.value(input, 'hi').value, 'hi', 'value가 있을 경우 ok');
    equal(Asdf.Element.value(input), 'hi', 'value가 없을 경우 ok');

});
test("Asdf.Element.html", function(){
    equal(Asdf.Element.html(div, 'hi').innerHTML, 'hi', 'html가 있을 경우 ok');
    equal(Asdf.Element.html(div), 'hi', 'html가 없을 경우 ok');

});
test("Asdf.Element.parent", function(){
    var c = document.createElement('div');
    div.appendChild(c);
    equal(Asdf.Element.parent(c), div, 'parent ok')
});
test("Asdf.Element.parents", function(){
    var p = document.createElement('div');
    var c = document.createElement('div');
    div.appendChild(p);
    p.appendChild(c);
    var parents = Asdf.Element.parents(c);
    var parentsUntil = Asdf.Element.parents(c, p);
    ok(Asdf.A.include(parents, div)&&Asdf.A.include(parents, p), 'parents ok')
    ok((!Asdf.A.include(parentsUntil, div))&&Asdf.A.include(parentsUntil, p), 'parents until ok')
});
test("Asdf.Element.next", function(){
    var c = document.createElement('div');
    var nc = document.createElement('div');
    div.appendChild(c);
    div.appendChild(nc);
    equal(Asdf.Element.next(c), nc, 'next ok');
});
test("Asdf.Element.prev", function(){
    var pc = document.createElement('div');
    var c = document.createElement('div');
    div.appendChild(pc);
    div.appendChild(c);
    equal(Asdf.Element.prev(c), pc, 'prev ok');
});
test("Asdf.Element.nexts", function(){
    var c = document.createElement('div');
    var nc1 = document.createElement('div');
    var nc2 = document.createElement('div');
    div.appendChild(c);
    div.appendChild(nc1);
    div.appendChild(nc2);
    var nexts = Asdf.Element.nexts(c);
    var nextsUtil = Asdf.Element.nexts(c, nc1);
    throws(function(){Asdf.Element.nexts('1')}, 'not Element throw Exceptions');
    ok(Asdf.A.include(nexts, nc1)&&Asdf.A.include(nexts, nc2), 'nexts ok');
    ok(Asdf.A.include(nextsUtil, nc1)&&!Asdf.A.include(nextsUtil, nc2), 'nexts util ok');
});
test("Asdf.Element.nexts", function(){
    var c = document.createElement('div');
    var pc1 = document.createElement('div');
    var pc2 = document.createElement('div');
    div.appendChild(pc1);
    div.appendChild(pc2);
    div.appendChild(c);

    var prevs = Asdf.Element.prevs(c);
    var prevsUtil = Asdf.Element.prevs(c, pc2);
    throws(function(){Asdf.Element.prevs('1')}, 'not Element throw Exceptions');
    ok(Asdf.A.include(prevs, pc1)&&Asdf.A.include(prevs, pc2), 'prevs ok');
    ok(Asdf.A.include(prevsUtil, pc2)&&!Asdf.A.include(prevsUtil, pc1), 'prevs util ok');
});
test("Asdf.Element.nexts", function(){
    var c = document.createElement('div');
    var pc = document.createElement('div');
    var nc = document.createElement('div');
    div.appendChild(pc);
    div.appendChild(c);
    div.appendChild(nc);

    var siblings = Asdf.Element.siblings(c);
    throws(function(){Asdf.Element.siblings('1')}, 'not Element throw Exceptions');
    ok(Asdf.A.include(siblings, pc)&&Asdf.A.include(siblings, nc), 'siblings ok');
});
test("Asdf.Element.children", function(){
    var text = document.createTextNode('aa');
    var c = document.createElement('div');
    var pc = document.createElement('div');
    var nc = document.createElement('div');
    div.appendChild(text);
    div.appendChild(pc);
    div.appendChild(c);
    div.appendChild(nc);

    var children = Asdf.Element.children(div);
    throws(function(){Asdf.Element.children('1')}, 'not Element throw Exceptions');
    ok(Asdf.A.include(children, pc)&&Asdf.A.include(children, nc)&&Asdf.A.include(children, c)&&Asdf.A.include(children, text), 'children ok');
});
test("Asdf.Element.contents", function(){
    var text = document.createTextNode('aa');
    var c = document.createElement('div');
    var pc = document.createElement('div');
    var nc = document.createElement('div');
    div.appendChild(text);
    div.appendChild(pc);
    div.appendChild(c);
    div.appendChild(nc);

    var contents = Asdf.Element.contents(div);
    throws(function(){Asdf.Element.contents('1')}, 'not Element throw Exceptions');
    ok(Asdf.A.include(contents, pc)&&Asdf.A.include(contents, nc)&&Asdf.A.include(contents, c)&&Asdf.A.include(contents, text), 'contents ok');
    var iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    var doc = Asdf.Element.contents(iframe);
    ok(doc.nodeType===9&&(document!=doc), 'iframe ok');
    Asdf.Element.remove(iframe);

});