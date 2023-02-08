# lib

간단하게 자주 사용하는 node.js 라이브러리 모음



## flowrun.js

순차적인 처리를 setTimer를 통해서 쉽게 하는 도구

```javascript
const FlowRun = require('./lib/flowrun.js');
```

```javascript
// 파라메터 전달과 흐름 제어
const flow1 = new FlowRun(
	[
		function(flow) {
			console.log('func 0');
			if (flow.getParams().hasOwnProperty('test'))
				console.info('test ok');
			else {
				flow.error('no test param');	// 에러가 있으면 실행 종료
				return;
			}
			flow.params({ text:'flow', count:0 });	// 다음 파라메터 설정
		},
		function(flow) {
			console.log('func 1');
			const params = flow.getParams();	// 파라메터 확인
			console.info(params.text);
			params.count++;
			flow.delay(500);	// ms동안 지연한 후 다음 함수 실행
		},
		function(flow) {
			console.log('func 2');
			const params = flow.getParams();	// 파라메터 확인
			console.log(params.count);	// 카운트 출력
			if (params.count == 1) {
				console.log('go prev');
				flow.next(-1);	// 이전 함수로 복귀
				return;
			}
			params.count++;
			if (params.count < 10) {
				flow.next(0);	// 카운트가 다 찰 때까지 현재 위치 반복 수행
			}
		},
		function(flow) {
			console.log('func 3');
			const params = flow.getParams();	// 파라메터 확인
			params.msg = 'test';
			flow.next(2);	// 다음 함수를 건너뛰고 진행
		},
		function(flow) {
			console.log('func 4');
		},
		function(flow) {
			console.log('func 5');
			const params = flow.getParams();	// 파라메터 확인
			flow.pause();	// io가 마칠 때까지 진행을 일시정지
			console.log('paused...');
			setTimeout(
				function() {
					console.info(params.msg);
					flow.resume();	// io를 마치고 계속 진행
					console.log('resuming.');
				},
				5000
			);
		},
		function(flow) {
			console.log('func 6');
			flow.result('done');	// 결과값이 있으면 실행 종료
		},
	],
	function(err, params) {
		console.error('error! ' + err);
	},
	function(ret, params) {
		console.info('finish. ' + ret);
	},
	true, 'test'	// 디버깅 출력
);
//flow1.run();
flow1.run({ test:'FlowRun' });
```

```javascript
// 라벨을 통한 흐름 제어
const flow2 = new FlowRun(
	[
		'initialize',
		function(flow) {
			console.log('00');
		},
		function(flow) {
			console.log('01');
		},

		'outter loop',
		function(flow) {
			console.log('10');
			flow.getParams().outIndex = 0;
		},
			'outter loop next',
			function(flow) {
				console.log('11', 'outter', flow.getParams().outIndex);
			},

			'inner loop',
			function(flow) {
				console.log('11-1');
				flow.getParams().inIndex = 0;
			},
				'inner loop next',
				function(flow) {
					console.log('11-2', 'inner', flow.getParams().inIndex);
				},
				function(flow) {
					console.log('11-3');
					flow.getParams().inIndex += 1;
					if (flow.getParams().inIndex >= flow.getParams().outIndex) {
						flow.nextLabel('outter loop continue');
						return;
					}
					flow.nextLabel('inner loop next');
				},

			'outter loop continue',
			function(flow) {
				console.log('12');
				flow.getParams().outIndex += 1;
				if (flow.getParams().outIndex >= 5) {
					flow.nextLabel('end');
					return;
				}
			},
			function(flow) {
				console.log('13');
				flow.nextLabel('outter loop next');
			},

		'end',
		function(flow) {
			console.log('90');
		},
		function(flow) {
			console.log('91');
			flow.result('--- end ---');
		},
	],

	null,
	null,
	true,	// 디버깅 출력
);
flow2.run();
```



## str.js

문자열에 ESC색상 및 몇가지 기능을 추가하는 도구

```javascript
const Str = require('./lib/str.js');
```

```javascript
// 숫자로 파싱
console.log('0b10'.parseNumber());	// 2진수 2
console.log('0o10'.parseNumber());	// 8진수 8
console.log('010'.parseNumber());	// 8진수 8
console.log('0d10'.parseNumber());	// 10진수 10
console.log('10'.parseNumber());	// 10진수 10
console.log('0x10'.parseNumber());	// 16진수 16
```

```javascript
// 특정 문자열 전부 교체
const org = '내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 잘 못 그린 기린 그림이다.';
const chg = org.replaceAll('기린', '구름');
console.log(org);
console.log(chg);
```

```javascript
// ANSI 코드 16 색상 및 효과
console.log('[' + 'black'.ansiBlack + ']');
console.log('[' + 'black'.ansiBlack.ansiBright + ']');
console.log('[' + 'black'.ansiBlackBack + ']');
console.log('[' + 'black'.ansiBlackBack.ansiBright + ']');
console.log('[' + 'red'.ansiRed + ']');
console.log('[' + 'red'.ansiRedBack + ']');
console.log('[' + 'red'.ansiRed.ansiBright + ']');
console.log('[' + 'Dark'.ansiDark + ']');
console.log('[' + 'Italic'.ansiItalic + ']');
console.log('[' + 'Underline'.ansiUnderline + ']');
console.log('[' + 'Blink'.ansiBlink + ']');
console.log('[' + 'Rapid'.ansiRapid + ']');
console.log('[' + 'Invert'.ansiInvert + ']');
console.log('[' + 'Hide'.ansiHide + ']');
console.log('[' + 'Strike'.ansiStrike + ']');
console.log('[' + 'bright green strike underline italic blue back'.ansiBright.ansiGreen.ansiStrike.ansiUnderline.ansiItalic.ansiBlueBack + ']');
```

```javascript
// ANSI 코드 256 색상
let colored = '';
for (let r = 0; r < 16; ++r) {
	for (let c = 0; c < 16; ++c) {
		const code = r * 16 + c;
		colored += ' ';
		colored += String(code).padStart(3, '*').ansiColor(code);
	}
	colored += '\n';
}
console.log(colored);
```

```javascript
// ANSI 코드 256 배경색상
colored = '';
for (let r = 0; r < 16; ++r) {
	for (let c = 0; c < 16; ++c) {
		const code = r * 16 + c;
		colored += ' ';
		colored += String(code).padStart(3, '*').ansiColorBack(code);
	}
	colored += '\n';
}
console.log(colored);
```

```javascript
// ANSI 코드 RGB 색상
console.log('rgb(250,128,114)'.ansiRGB(250,128,114));
console.log('rgb(250,128,114)'.ansiRGBback(250,128,114));
console.log('rgb(173,255,47)'.ansiRGB(173,255,47));
console.log('rgb(173,255,47)'.ansiRGBback(173,255,47).ansiBlack);
console.log('rgb(147,112,219)'.ansiRGB(147,112,219));
console.log('rgb(147,112,219)'.ansiRGBback(147,112,219));
```



## log.js

콘솔로 로그를 출력해주는 도구

```javascript
const Log = require('./lib/log.js');
```

```javascript
const _MODE = 'mode';
// ...
async function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

const _CODE = 'code';
// ...
	async function test(param) {
		const _FUNC = 'test';
		Log.info(_MODE, _CODE, _FUNC, param);
		Log.begin('time_check', _MODE, _CODE, null, 'start');

		Log.log('normal log', 1, 2, 3);
		Log.info(_MODE, _CODE, _FUNC, 'info log');
		Log.debug(_MODE, _CODE, _FUNC, 'debug log');
		Log.warn(_MODE, _CODE, _FUNC, 'warning log');
		Log.assert(false, _MODE, _CODE, _FUNC, 'assert log');
		Log.error(_MODE, _CODE, _FUNC, 'error log');

		Log.elapse('time_check', _MODE, _CODE, _FUNC, 'waiting...');
		await sleep(1000);
		Log.elapse('time_check', _MODE, _CODE, _FUNC, 'resumed');

		Log.inspect(_MODE, _CODE, _FUNC, [ 1, 2, 3 ]);
		Log.inspect(_MODE, _CODE, _FUNC, {
			name: 'test',
			index: 123,
			comment: 'inspect object',
		});

		Log.end('time_check', _MODE, _CODE, null);
	}
// ...
test('tinywolf');
```



## rescode.js

에러 코드 관리 도구

```javascript
const ResCode = require('./lib/rescode.js');
```

```javascript
	// 자식 프로세스가 리턴한 코드에 문제가 없는지 확인
	if (ResCode.app.isOK(code)) {
		console.log('성공');
	}
	else if (ResCode.app.isError(code)) {
		console.log('오류', ResCode.app.getDesc(code));
	}
	else {
		console.log(ResCode.app.getDesc(code));
	}

	// 파일 읽기 실패로 종료
	process.exit(ResCode.app.ReadFail.code);
```

```javascript
let ret, status;

// process exit code
console.log(ResCode.app.OK.desc);
// error
ret = ResCode.app.WrongState.code;
console.log(ret, ResCode.app.getDesc(ret));
ret = -1000;
console.log(ret, ResCode.app.getDesc(ret));
// warning
ret = ResCode.app.InsertFail.code;
console.log(ret, ResCode.app.getDesc(ret));
ret = 1000;
console.log(ret, ResCode.app.getDesc(ret));

// http status
console.log(ResCode.http.OK.desc);
status = ResCode.http.OK.code;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
status = ResCode.http.Accepted.code;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
status = ResCode.http.Found.code;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
status = ResCode.http.NotFound.code;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
status = ResCode.http.NotImplemented.code;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
status = 543;
console.log(ResCode.http.isSuccess(status), status, ResCode.http.getDesc(status));
```



