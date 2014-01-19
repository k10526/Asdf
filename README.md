Asdf
====

### Asdf.js 란?
* javascript library 입니다.
* functional programming을 지향합니다.
* 앱스 헝가리안 표기법을 지향합니다.
* 라이브러리의 쉬운 확장과 분리가 가능 합니다.

### Asdf.js 목적
* 개발자들간의 보편함수를 정리.
* 함수간 종속을 최소화.
* 표현 계층과 핵심 계층을 분리.

즉, **순수 함수** 형태를 통해서 자바스크립트 개발자들 간에 아이디어를 효과적으로 **교류**

### Asdf.js 계층 구조
* 핵심 계층 : 필수 함수 모음.
* 표현 계층 : 사용자의 사용성을 향상.

`
Asdf.Selector : jQuery처럼 사용 가능.
`
`
Asdf.Alias : prototype처럼 사용 가능.
`

Asdf.js는 개발자들끼리 순수 함수를 만들어서 공유하는 장소 입니다. 이것들을 정제하여 필요한 라이브러리 제작이 할수 있습니다. 또한 표현 계층을 통해서 다양한 사용성을 제공할 수 있습니다.

### 순수 함수란
* 부작용이 없는 함수, 즉 함수의 실행이 외부에 영향을 끼치지 않는다.
* 예) sin(x), length(s) ... 
<http://en.wikipedia.org/wiki/Pure_function>

##### 순수 함수 
1. undercore.js : var evens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
2. Asdf.js : var evens = Asdf.A.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
 
##### 비 순수 함수
1. prototype.js : [1,2, 3, 4, 5].filter(function(num){ return num % 2 == 0; });
2. jQuery.js : $('div').filter('.aa');


##### 고차 함수 합성
* 하나 이상의 함수를 인자로 받고, 새 함수를 반환한은 함수.
<http://ko.wikipedia.org/wiki/%ED%95%A9%EC%84%B1%ED%95%A8%EC%88%98>

##### 합성 기본 예제
```
var nativeSlice = Array.prototype.slice;

function curry (fn) {
    var args = nativeSlice.call(arguments, 1);
	return function () {
		return fn.apply(this, args.concat(nativeSlice.call(arguments)));
	};
}

inc = curry(function(a,b){return a+b}, 1);
inc(2); // return 3

function partial(fn) {
    var args = nativeSlice.call(arguments, 1);
	return function () {
		var arg = 0;
		var a = args.slice();
		for ( var i = 0; i < args.length && arg < arguments.length; i++ )
			if(args[i] === undefined)
				a[i] = arguments[arg++];
		return fn.apply(this, a);
	};
}

half = partial(function(a,b){return a/b}, undefined, 2);
half(4); //return 2;
quater = partial(function(a,b){return a/b}, undefined, 4);
quater(4); //return 4;

function extract(fn, n) {
    n==null && (n=1);
    return function () {
        return fn.apply(this, nativeSlice.call(arguments, n));
    }
}
f = extract(function(a,b){return a+b;}, 2);
f(1,2,3,4) // return 7

```

##### 합성 고급 예제
```
function memoizer(fn, memo){
memo = memo||{};
    return function (key, nouse) {
		var res = memo[key];
		if(res == null || nouse){
			res = fn.call(this,key);
			memo[key] = res;
		}
		return res;
	};
}

function fibo(n){
	if(n<0)
		throw new typeError();
	else if(n<=2)
		return 1;
	else if(n==3)
		return 2;
	else return fibo(n-1) + fibo(n-2);
}
mfibo = memoizer(fibo);
mfibo(43);
```
> **순수 함수**일 경우, 성능을 위해서 처음 결과값을 저장한 후 이후 함수를 부를 시에 연산 없이 저장 값을 반환하도록 하는 경우 (메모이제이션) 기존의 함수 변경 없이 합성을 통해서 문제를 해결 할 수 있다.
> fibo(45)일 경우 (컴퓨터 사항에 따라 다름) 대략 10초 정도 걸리는데 두번째 세번째 함수를 부를 때도 같은 시간이 소요된다. 그러나 mfibo(45)로 memo라는 함수와 fibo를 합성하여 처음엔 10초 걸리지만 두번째 부터는 연산 없이 바로 값을 반환한다.


### Asdf.js 함수 합성 예제
```
function compose(f1, f2){
    return function () {
		return f1.call(this, (f2.apply(this, arguments)));
	}
}
var not = curry(compose, function(a) {return !a;});
var isNumber = not(isNaN);
isNumber(1); //return true;
isNumber('aa'); // return false;
var sum = Asdf.F.compose(Asdf.Arg.toArray, partial(Asdf.A.filter, undefined, isNotNaN), partial(Asdf.A.reduce, undefined, function(a,b){return a+b}, 0));
var div = Asdf.F.compose(Asdf.Arg.toArray, partial(Asdf.A.filter, undefined, isNotNaN), partial(Asdf.A.reduce, undefined, function(a,b){return a/b}));
var mul= Asdf.F.compose(Asdf.Arg.toArray, partial(Asdf.A.filter, undefined, isNotNaN), partial(Asdf.A.reduce, undefined, function(a,b){return a*b}, 1));
var mod = Asdf.F.compose(Asdf.Arg.toArray, partial(Asdf.A.filter, undefined, isNotNaN), partial(Asdf.A.reduce, undefined, function(a,b){return a%b}, 100));
var sub = Asdf.F.compose(Asdf.Arg.toArray, partial(Asdf.A.filter, undefined, isNotNaN), partial(Asdf.A.reduce, undefined, function(a,b){return a-b}, 0));
```

### Asdf.js 개발 예제
```
var uniqueAdd = Asdf.F.composeRight(Asdf.A.unique, add);

function add(array, item) {
    array.push(item);
	return array;
}
uniqueAdd([1,2,3,4],1); //return [1,2,3,4]
uniqueAdd([1,2,3,4],5); //return [1, 2, 3, 4, 5]
```
> Asdf.js 기존에 함수를 사용 또는 신규 메소드를 개발하여 위의 방법 처럼 함수 합성을 통해서 빠로고 간단하게 함수 생성이 가능하다.

### Asdf.js 실제 소스
```
...
    var is =  $_.Core.returnType.is, compose = $_.Core.behavior.compose, iterate = $_.Core.behavior.iterate;
	var curry = $_.Core.combine.curry;
	var partial = $_.Core.combine.partial;
	var not = curry(compose, $_.Core.op["!"]);
	var isNotNaN = not(isNaN);
...
    var sum = $_.F.compose($_.Arg.toArray, partial($_.A.filter, undefined, isNotNaN), partial($_.A.reduce, undefined, $_.Core.op["+"], 0));
	var isRange = is(function (n,a,b) { return a<=n && n<=b; });
	var isNotRange = not(isRange);
	var isZero = is(function (n) { return n === 0;});
	var isNotZero = not(isZero);
	var isSame = is(function (n, a) { return a === b;});
	var isNotSame = not(isSame);
	var isGreaterThan = is(function (n, a){ return n > a;});
	var isNotGreaterThan = not(isGreaterThan);
	var isLessThan = is(function (n, a){ return n < a;});
	var isNotLessThan = not(isLessThan);
...

```

API 문서 : http://www.asdfjs.com/asdf/docs/
## 이것이 바로 Asdf.js 입니다.
