(function($_) {
	var nativeSlice = Array.prototype.slice, extend = $_.O.extend,
		isElement = $_.O.isElement, isString = $_.O.isString, trim = $_.S.trim;
	var tempParent = document.createElement('div');
	$_.Element = {};
	function recursivelyCollect(element, property, until) {
		var elements = [];
		while (element = element[property]) {
			if (element.nodeType == 1)
				elements.push(element);
			if (element == until)
				break;
		}
		return elements;
	}
	function recursively( element, property ) {
		do {
			element = element[ property ];
		} while ( element && element.nodeType !== 1 );
		return element;
	}
	function walk(element, fun, context) {
		context = context || this;
		var i, childNodes = $_.A.toArray(element.childNodes);
		fun.call(context, element);
		for (i = 0; i < childNodes.length ; i++) {
			walk(childNodes[i], fun);
		}
		return element;
	}
	function visible(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return element.style.display !='none';
	}
	function toggle(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
	    visible(element) ? hide(element) : show(element);
	    return element;
	}
	function hide(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.style.display = 'none';
	    return element;
	}
	function show(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 element.style.display = '';
		 return element;
	}
	function text(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var ret = '';
		if( value == null ){
			if ( typeof element.textContent === "string" ) {
				return element.textContent;
			} else {
				walk(element, function(e) {
					var nodeType = e.nodeType;
					if( nodeType === 3 || nodeType === 4 ) {
						ret += e.nodeValue;
					}
					return false;
				});
				return ret;
			}
		}else {
			append(empty(element), (element.ownerDocument || document ).createTextNode( value ) );
		}
	}
	function value(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (value==null)? element.value : element.value = value;
	}
	function html(element, html) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (!html)? element.innerHTML: element.innerHTML = html;
	}
	function parent(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'parentNode');
	}
	function parents(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 return recursivelyCollect(element, 'parentNode', until);
	}
	function next(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'nextSibling');
	}
	function prev(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'previousSibling');
	}
	function nexts(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'nextSibling', until);
	}
	function prevs(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'previousSibling', until);
	}
	function siblings(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.A.without($_.A.toArray(element.parentNode.childNodes), element);
	}
	function children(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return nexts(element.firstChild, 'nextSibling');
	}
	function contents(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (element.nodeName === 'IFRAM')?element.contentDocument||element.contentWindow.document : element.childNodes ;
	}
	function wrap(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.replaceChild(newContent, element);
		newContent.appendChild(element);
		return newContent;
	}
	function unwrap(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var bin = document.createDocumentFragment();
		var parentNode = element.parentNode;
		bin.appendChild(element);
		parentNode.parentNode.replaceChild(element, parentNode);
		return element;
	}
	function append(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.appendChild( newContent );
		}
		return element;
	}
	function prepend(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.insertBefore( newContent, element.firstChild );
		}
		return element;
	}
	function before(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element);
		return element;
	}
	function after(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element.nextSibling);
		return element;		
	}
	function empty(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.innerHTML = '';
		return element;
	}
	function remove(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.parentNode.removeChild(element);
	}
	function attr(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var result, key;
		if(!name || !isString(name)){
			return null;
		}
		if(element.nodeType !== 1){
			return null;
		}
		if(value == null){
			if(name === 'value' && element.nodeName === 'INPUT' ){
				return element.value;
			}
			return (!(result = element.getAttribute(name)) && name in element) ? element[name] : result;
		}else {
			if (typeof name === 'object'){
				for (key in name)
					element.setAttribute(key, name[key]);
			}else {
				element.setAttribute(name, value);
			}
			return element;
		}
	}
	function removeAttr(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element.nodeType === 1)
			element.removeAttribute(name);
		return element;
	}
	function prop(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if( value == null){
			return element[name];
		} else {
			element[name] = value;
			return element;
		}
	}
	function removeProp(element, name){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element[name])
			delete element[name];
		return element;
	}
	function relatedOffset(element, target) {
		if(!$_.O.isNode(element)||!$_.O.isNode(target))
			throw new TypeError();
		var offsetEl = offset(element);
		var offsetTar = offset(target);
		return {left: offsetEl.left - offsetTar.left, 
				top: offsetEl.top - offsetTar.top,
				height:offsetEl.height,
				width:offsetEl.width,
				right: offsetEl.right - offsetTar.left,
				bottom: offsetEl.bottom - offsetTar.top
			};
	}
	function offset(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		// IE 경우 document.documentElement.scrollTop 그 외 document.body.scrollTop
		var width = 0,
			height = 0,
			rect = element.getBoundingClientRect(),
			top = rect.top + (document.body.scrollTop || document.documentElement.scrollTop),
			bottom = rect.bottom + (document.body.scrollTop || document.documentElement.scrollTop),
			right = rect.right + (document.body.scrollLeft || document.documentElement.scrollLeft),
			left = rect.left + (document.body.scrollLeft || document.documentElement.scrollLeft);
		if (rect.height) {
			height = rect.height;
			width = rect.width;
		} else {
			height = element.offsetHeight || bottom - top;
			width = element.offsetWidth || right - left;
		}
		return {
			height : height,
			width : width,
			top : top,
			bottom : bottom,
			right : right,
			left : left
		};
	};
	function addClass(element, name){
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(!hasClass(element, name))		
				element.className += (element.className? ' ':'') + name;
		});
		return element;
	};
	function removeClass(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!name)
			element.className = '';
		else {
			var nms = name.replace(/\s+/g,' ').split(' ');
			$_.A.each(nms, function(name) {
				element.className = $_.S.trim(element.className.replace(new RegExp("(^|\\s+)" + name + "(\\s+|$)"), ' '));
			});
		}
		return element;
	}
	function toggleClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(hasClass(element, name)){
				return removeClass(element, name);
			}
			return addClass(element, name);
		});
		return element;
	}
	function hasClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		return element.className && new RegExp("(^|\\s)" + name + "(\\s|$)").test(element.className);
	}
	function find(element, selector, results, seed){
		if(!$_.O.isNode(element))
			throw new TypeError();
		results = results||[];
		return $_.A.toArray(querySelectorAll(element, selector)).concat(results);
	}
	function querySelectorAll(element, selector) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(window.Sizzle){
			return Sizzle(selector, element);
		}
		else if(element.querySelectorAll) {
			return element.querySelectorAll(selector);
		}else {
			var a=element.all, c=[], selector = selector.replace(/\[for\b/gi, '[htmlFor').split(','), i, j,s=document.createStyleSheet();
			for (i=selector.length; i--;) {
				s.addRule(selector[i], 'k:v');
				for (j=a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
				s.removeRule(0);
			}
			return c;
		}
	}
	function closest(element, selector, context){
		if(!$_.O.isNode(element))
			throw new TypeError();
		while (element && !matchesSelector(element, selector))
			element = element !== context && element !== document && element.parentNode;
	    return element;
	}
	function matchesSelector(element, selector){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if (!element || element.nodeType !== 1) return false
	    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
	                          element.oMatchesSelector || element.matchesSelector;
	    if (matchesSelector) return matchesSelector.call(element, selector);
	    var match, parent = element.parentNode, temp = !parent;
	    if (temp) (parent = tempParent).appendChild(element);
	    var match =  $_.A.indexOf( find(parent, selector), element);
	    temp && tempParent.removeChild(element);
	    return match===-1? false: true;
	}
	function css(element, name, value){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(value!=null){
			var elementStyle = element.style;
			elementStyle[name] =  value;
		}else {
			var cssStyle, res, i;
			// IE
			if (element.currentStyle) {
				cssStyle = element.currentStyle;
			} else if (document.defaultView &&
					document.defaultView.getComputedStyle) {
				cssStyle = document.defaultView.getComputedStyle(element, null);
			} else {
				return TypeError();
			}
			var styleVal = $_.O.extend({},element.style);
			$_.O.each(styleVal, function(value, key, obj) {
				if(!value || value == 'auto')
					obj[key] = cssStyle[key] && cssStyle[key] != 'auto'?  cssStyle[key]: '';
			});
			if(!name) {
				return styleVal;
			}
			else if (isString(name)) {
				res = styleVal[name];
			} else if($_.O.isArray(name)){
				res = {};
				for (i = 0; i < name.length; i++) {
					res[name[i]] = styleVal[name[i]];
				}
			} else 
				throw TypeError();
			return res;
		}
	}
	function toHTML(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!element) throw new TypeError;
		var d = document.createElement('div');
		if($_.O.isNode(element))
			element = element.cloneNode(true);
		d.appendChild(element);
		return d.innerHTML;
	}
	function isWhitespace(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.S.isBlank(element.innerHTML);
	}
	extend($_.Element,  {
		walk: walk,
		visible: visible,
		toggle: toggle,
		hide: hide,
		show: show,
		remove: remove,
		text: text,
		value: value,
		html: html,
		parent: parent,
		parents: parents,
		next: next,
		prev: prev,
		nexts: nexts,
		prevs: prevs,
		siblings: siblings,
		children: children,
		contents: contents,
		wrap: wrap,
		unwrap: unwrap,
		append: append,
		prepend: prepend,
		before: before,
		after: after,
		empty: empty,
		attr: attr,
		removeAttr: removeAttr,
		prop: prop,
		removeProp: removeProp,
		relatedOffset:relatedOffset,
		offset: offset,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		hasClass: hasClass,
		find: find,
		querySelectorAll: querySelectorAll,
		matchesSelector:matchesSelector,
		is: matchesSelector,
		closest:closest,
		css:css,
		toHTML: toHTML,
		isWhitespace: isWhitespace
	});
})(Asdf);