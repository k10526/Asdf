test("Asdf.Template.bind", function(){
	var el = document.createElement('div');
	var d = document.createElement('div');
	d.id = 'a';
	d.className = 'b';
	el.appendChild(d);
	Asdf.Template.bind(el, {'#a':1});
	equal(d.innerHTML, '1', 'template id test');
	var el = document.createElement('div');
	var d = document.createElement('div');
	d.id = 'a';
	d.className = 'b';
	el.appendChild(d);
	Asdf.Template.bind(el, {'.b':'hello world!'});
	equal(d.innerHTML, 'hello world!', 'template class test');
});
