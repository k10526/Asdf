(function ($_) {
	$_.Template = {};
	var attrBind = function(element, attrs) {
		var hasAttribute =  function (node, attr) {
			if (node.hasAttribute)
				return node.hasAttribute(attr);
			else
				return node.getAttribute(attr);
		};
		for(var key in attrs){
			if(key.toLowerCase() === 'html'){
				htmlBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'text'){
				textBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'class'){
				element.className = attrs[key];
			}else if(key.toLowerCase() === 'value'){
				element.value = attrs[key];
			}else if(hasAttribute(element, key)) {
				element.setAttribute(key,attrs[key]);
			}
		}
	}
	,textBind = function(element, text) {
		$_.Element.text(element, text);
	}
	,htmlBind = function(element, html) {
		element.innerHTML = html;
	}
	,findElements = function(root,selector) {
		return $_.Element.find(root, selector);
	}
	,bind = function(element, obj) {
		var key, targets;
		var valiableNodeType = element.nodeType === 1 || element.nodeType === 11;
		// validate
		if (!valiableNodeType) throw new TypeError();
		if (!$_.O.isPlainObject(obj)) throw new TypeError();
		for (key in obj){
			targets = findElements(element, key);
			if(targets.length === 0) continue;
			$_.A.each(targets, function(value) {
				if($_.O.isString(obj[key])||$_.O.isNumber(obj[key])) {
					textBind(value, obj[key]);
				}
				else if($_.O.isPlainObject(obj[key])){
					attrBind(value, obj[key]);
				}
			});
			
		}
		return element;
		
	};
	$_.Template.bind = bind;
})(Asdf);