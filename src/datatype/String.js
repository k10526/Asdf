/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name S
 */
(function($_) {
	$_.S = {};
	var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {number} [length=30] 축약할 글자 수
	 * @param {string} [truncation=...] 축약 시 추가될 문자열 
	 * @returns {string} 대상 문자열을 특정 크기로 자른 후 결과를 반환한다.
	 * @desc 문자열을 크기가 length보다 클 경우 문자열을 해당 length 크기로 맞춘다. 
	 * @example
	 * Asdf.S.truncate('abcdefghijkl', 5, '...'); // return 'ab...'
	 * 
	 */
	function truncate(str, length, truncation) {
		if(!$_.O.isString(str)) throw new TypeError();
		length = length || 30;
		truncation = $_.O.isUndefined(truncation) ? '...' : truncation;
		return str.length > length ?
		str.slice(0, length - truncation.length) + truncation : str;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str 앞뒤 공백 문자를 제거한다.
	 * @desc str 앞 뒤 공백 문자를 제거한다. 
	 * @example
	 * Asdf.S.trim('  ab c   '); // return 'ab c'
	 * 
	 */
	function trim(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 태그를 제거한다. 
	 * @desc str에 태그를 제거한다.  
	 * @example
	 * Asdf.S.stripTags('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a linkalert("hello world!");'
	 * 
	 */
	function stripTags(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 script태그를 제거한다. 
	 * @desc str에 script태그를 제거한다.  
	 * @example
	 * Asdf.S.stripScripts('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function stripScripts(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(new RegExp(ScriptFragment, 'img'), '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} html에 출력 가능한 문자로 변경하여 반환한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 화면에 출력 가능하게 변경한다.  
	 * @example
	 * Asdf.S.escapeHTML('a <a href="#">link</a>'); // return 'a &lt;a href="#"&gt;link&lt;/a&gt;'
	 * 
	 */
	function escapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str문자를 html 문자로 변경한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 html문자로 변경한다. escapeHTML와 반대.  
	 * @example
	 * Asdf.S.unescapeHTML('a &lt;a href="#"&gt;link&lt;/a&gt;'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function unescapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return stripTags(str).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
	}
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string} [separator=&] 값들 간의 구분자
	 * @param {string} [sepKV==] key value 구분자
	 * @returns {object} 대상 문자열을 object로 변환한다.
	 * @desc 대상 문자열을 object로 변환한다.  
	 * @example
	 * Asdf.S.toQueryParams('a=1&a=2&b=3&c=4'); // return {a:[1,2],b:3,c:4};
	 * 
	 */
	function toQueryParams(str,separator, sepKV) {
		if(!$_.O.isString(str)) throw new TypeError();
		var reduce = $_.A.reduce;
		var match = trim(str).match(/([^?#]*)(#.*)?$/);
		if (!match)
			return {};
		return reduce(match[1].split(separator || '&'),	function(hash, pair) {
			if ((pair = pair.split(sepKV || '='))[0]) {
				var key = decodeURIComponent(pair.shift()), value = pair.length > 1 ? pair.join('='): pair[0];
				if (value != undefined)
					value = decodeURIComponent(value);
				if (key in hash) {
					if (!$_.O.isArray(hash[key])){
						hash[key] = [ hash[key] ];
					}
					hash[key].push(value);
				} else
					hash[key] = value;
				}
			return hash;
		}, {});
	}
	function toArray(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.split('');
	}
	function succ(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.slice(0, str.length - 1) +
	      String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
	}
	function times(str, count) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return count < 1 ? '' : new Array(count + 1).join(str);
	}
	function camelize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/-+(.)?/g, function(match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	}
	function capitalize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}
	function underscore(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/::/g, '/')
	               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	               .replace(/-/g, '_')
	               .toLowerCase();
	}
	function dasherize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/_/g, '-');
	}
	function include(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.indexOf(pattern) > -1;
	}
	function startsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.lastIndexOf(pattern, 0) === 0;
	}
	function endsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    var d = str.length - pattern.length;
	    return d >= 0 && str.indexOf(pattern, d) === d;
	}
	function isEmpty(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str == '';
	}
	function isBlank(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return /^\s*$/.test(str);
	}
	function toElement(str){
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div');
		el.innerHTML = str;
		return el.firstChild;
	}
	function toDocumentFragment(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div'), frg = document.createDocumentFragment();
		el.innerHTML = str;
		while(el.childNodes.length) frg.appendChild(el.childNodes[0]);
		return frg;	
	}
	function lpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (new Array(length+1).join(padStr)+str).slice(-length);
	}
	function rpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (str + new Array(length+1).join(padStr)).slice(0,length);
	}
	function template(str, reg){
		if (!$_.O.isString(str))
			throw new TypeError();
		reg = reg || /\{\{([\s\S]+?)\}\}/g;
		var data = [];
		var parse = function(str) {
			var i =0;
			var pos = 0;
			data[i] = str;
			str.replace(reg, function(m, key, index) {
				if($_.O.isNumber(key)) {
					index = key;
					key = undefined;
				}
				data[i] = str.substring(pos, index);
				data[++i] = {key:key, text:undefined, toString : function(){return this.text;}};
				pos = index + m.length;
				if(pos<str.length)
					data[++i] = str.substring(pos);
			});
		};
		var getIndexs = function(key){
			var res = [];
			$_.A.each($_.A.pluck(data, 'key'), function(value, i){
				if(value === key)
					res.push(i);
			});
			return res;
		};
		var set = function(index, str) {
			if($_.O.isNumber(index)){
				if (index < 1)
					throw new Error("index is great than 0");
				if (data.length <= index * 2 - 1)
					throw new Error("index is less than ?s");
				data[index * 2 - 1].text = str;
			}
			else if($_.O.isString(index)){
				var ins = getIndexs(index);
				if(ins.lenght == 0) throw new Error("index is wrong");
				$_.A.each(ins, function(value) {
					data[value].text = str;
				});
			}else if($_.O.isPlainObject(index)){
				$_.O.each(index, function(value, key) {
					set(key, value);
				});
			}else {
				throw new Error();
			}
		};
		var toString = function() {
			var i;
			for (i = 0; i < data.length; i++) {
				if (data[i].toString() === undefined)
					throw new Error(((i + 1) / 2) + " undefined");
			}
			return data.join('');
		};
		parse(str);
		return {
			set : set,
			toString : toString
		};
	}
	$_.O.extend($_.S, {
		truncate: truncate,
		trim: trim,
		stripTags: stripTags,
		stripScripts: stripScripts,
		escapeHTML: escapeHTML,
		unescapeHTML: unescapeHTML,
		toQueryParams: toQueryParams,
		toArray: toArray,
		succ: succ,
		times: times,
		camelize: camelize,
		capitalize: capitalize,
		underscore: underscore,
		dasherize: dasherize,
		include: include,
		startsWith: startsWith,
		endsWith: endsWith,
		isEmpty: isEmpty,
		isBlank: isBlank,
		toDocumentFragment:toDocumentFragment,
		toElement: toElement,
		lpad: lpad,
		rpad: rpad,
		template:template
	});
})(Asdf);