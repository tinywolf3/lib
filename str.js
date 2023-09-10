'use strict';

/* 문자열 모듈

String에 추가 기능을 주입


const Str = require('./lib/str.js');

// 숫자로 파싱
console.log('0b10'.parseNumber());	// 2진수 2
console.log('0o10'.parseNumber());	// 8진수 8
console.log('010'.parseNumber());	// 8진수 8
console.log('0d10'.parseNumber());	// 10진수 10
console.log('10'.parseNumber());	// 10진수 10
console.log('0x10'.parseNumber());	// 16진수 16
console.log();

// 특정 문자열 전부 교체
const org = '내가 그린 기린 그림은 잘 그린 기린 그림이고 네가 그린 기린 그림은 잘 못 그린 기린 그림이다.';
const chg = org.replaceAll('기린', '구름');
console.log(org);
console.log(chg);
console.log();

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
console.log();

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

// ANSI 코드 RGB 색상
console.log('rgb(250,128,114)'.ansiRGB(250,128,114));
console.log('rgb(250,128,114)'.ansiRGBback(250,128,114));
console.log('rgb(173,255,47)'.ansiRGB(173,255,47));
console.log('rgb(173,255,47)'.ansiRGBback(173,255,47).ansiBlack);
console.log('rgb(147,112,219)'.ansiRGB(147,112,219));
console.log('rgb(147,112,219)'.ansiRGBback(147,112,219));


*/

//=============================================================================
// 구현

function padLeft(src, len = 2, ch = '0') {
	src = '' + src;
	if (src.length >= len) return src;
	src = ch.repeat(len) + src;
	return src.substring(src.length - len);
}
module.exports.padLeft = padLeft;

function dateToSqlTime(date) {
	const d = new Date(date);
	return `${d.getUTCFullYear()}-${padLeft(d.getUTCMonth() + 1)}-${padLeft(d.getUTCDate())} ${padLeft(d.getUTCHours())}:${padLeft(d.getUTCMinutes())}:${padLeft(d.getUTCSeconds())}.${padLeft(d.getUTCMilliseconds(), 3)}`;
}
module.exports.dateToSqlTime = dateToSqlTime;

/**
 * 특정 문자열 전부 교체하기.
 * 	사용> const ret = 'a boy has a book.'.replaceAll('a', 'the');
 * 
 * @param {string | string array} searchStr  - 찾을 문자열 혹은 문자열 배열.
 * @param {string} replaceStr - 교체할 문자열.
 * 
 * @return {string} 모두 교체된 문자열.
 */
String.prototype.replaceAll = function(_searchStr, _replaceStr) {
	_replaceStr = '' + _replaceStr;
	if (Array.isArray(_searchStr)) {
		let out = this.toString();
		for (const str of _searchStr) {
			out = out.split(str).join(_replaceStr);
		}
		return out;
	}
	_searchStr = '' + _searchStr;
	return this.split(_searchStr).join(_replaceStr);
}

/**
 * 숫자로 변경하기.
 * '0'으로 시작하는 문자는 진법에 맞게 정수로 변환한다.
 * 그 외는 실수로 변환한다.
 * 	예> '0b1101' : 2진수 1101,
 * 		'0o765'='0765' : 8진수 765,
 * 		'0d987'='987' : 10진수 987,
 * 		'0xFC9' : 16진수 FC9
 * 	사용> const ret = '0x9653'.parseNumber();
 * 
 * @return {number} 변환된 숫자.
 */
String.prototype.parseNumber = function() {
	if (this.length > 1 && this[0] === '0') {
		switch (this[1]) {
			case 'b':
				return parseInt(this.slice(2), 2);
			case 'o':
				return parseInt(this.slice(2), 8);
			case 'd':
				return parseInt(this.slice(2), 10);
			case 'x':
				return parseInt(this.slice(2), 16);
			default:
				const code = this.charCodeAt(1);
				if (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0))
					return parseInt(this, 8);
		}
	}
	return parseFloat(this);
}

Object.defineProperty(String.prototype, 'ansiBright', {
	get: function() {
		return '\x1b[1m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiDark', {
	get: function() {
		return '\x1b[2m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiItalic', {
	get: function() {
		return '\x1b[3m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiUnderline', {
	get: function() {
		return '\x1b[4m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiBlink', {
	get: function() {
		return '\x1b[5m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiRapid', {
	get: function() {
		return '\x1b[6m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiInvert', {
	get: function() {
		return '\x1b[7m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiHide', {
	get: function() {
		return '\x1b[8m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiStrike', {
	get: function() {
		return '\x1b[9m' + this + '\x1b[0m';
	},
});


Object.defineProperty(String.prototype, 'ansiBlack', {
	get: function() {
		return '\x1b[30m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiBlackBack', {
	get: function() {
		return '\x1b[40m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiRed', {
	get: function() {
		return '\x1b[31m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiRedBack', {
	get: function() {
		return '\x1b[41m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiGreen', {
	get: function() {
		return '\x1b[32m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiGreenBack', {
	get: function() {
		return '\x1b[42m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiYellow', {
	get: function() {
		return '\x1b[33m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiYellowBack', {
	get: function() {
		return '\x1b[43m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiBlue', {
	get: function() {
		return '\x1b[34m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiBlueBack', {
	get: function() {
		return '\x1b[44m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiMagenta', {
	get: function() {
		return '\x1b[35m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiMagentaBack', {
	get: function() {
		return '\x1b[45m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiCyan', {
	get: function() {
		return '\x1b[36m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiCyanBack', {
	get: function() {
		return '\x1b[46m' + this + '\x1b[0m';
	},
});

Object.defineProperty(String.prototype, 'ansiWhite', {
	get: function() {
		return '\x1b[37m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiWhiteBack', {
	get: function() {
		return '\x1b[47m' + this + '\x1b[0m';
	},
});

String.prototype.ansiColor = function(_code8bit) {
	const code = parseInt('' + _code8bit);
	if (isNaN(code) || code < 0 || code >= 256)
		return this;
	return '\x1b[38;5;' + code + 'm' + this + '\x1b[0m';
}

String.prototype.ansiColorBack = function(_code8bit) {
	const code = parseInt('' + _code8bit);
	if (isNaN(code) || code < 0 || code >= 256)
		return this;
	return '\x1b[48;5;' + code + 'm' + this + '\x1b[0m';
}

String.prototype.ansiRGB = function(_red8bit, _green8bit, _blue8bit) {
	const r = parseInt('' + _red8bit);
	const g = parseInt('' + _green8bit);
	const b = parseInt('' + _blue8bit);
	if (   isNaN(r) || r < 0 || r >= 256
	    || isNaN(g) || g < 0 || g >= 256
	    || isNaN(b) || b < 0 || b >= 256 )
		return this;
	return '\x1b[38;2;' + r + ';' + g + ';' + b + 'm' + this + '\x1b[0m';
}

String.prototype.ansiRGBback = function(_red8bit, _green8bit, _blue8bit) {
	const r = parseInt('' + _red8bit);
	const g = parseInt('' + _green8bit);
	const b = parseInt('' + _blue8bit);
	if (   isNaN(r) || r < 0 || r >= 256
	    || isNaN(g) || g < 0 || g >= 256
	    || isNaN(b) || b < 0 || b >= 256 )
		return this;
	return '\x1b[48;2;' + r + ';' + g + ';' + b + 'm' + this + '\x1b[0m';
}

Object.defineProperty(String.prototype, 'ansiDefaultColor', {
	get: function() {
		return '\x1b[39m' + this + '\x1b[0m';
	},
});
Object.defineProperty(String.prototype, 'ansiDefaultBack', {
	get: function() {
		return '\x1b[49m' + this + '\x1b[0m';
	},
});
