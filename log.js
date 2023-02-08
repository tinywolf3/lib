'use strict';

/* 로그 출력 모듈

시작, 모드 이름, 위치 등을 상세하게 출력

*/

//=============================================================================
// 모듈

const Util = require('node:util');
const Path = require('node:path');
const Str = require('./str.js');

//=============================================================================
// 구현

let LastDay = 0;
let LastHour = 0;

function getTime() {
	const now = new Date;
	if (now.getUTCDate() != LastDay || now.getUTCHours() != LastHour) {
		LastDay = now.getUTCDate();
		LastHour = now.getUTCHours();
		if (process.env.pm_id) console.error(now.toISOString());
		console.log(now.toISOString().ansiInvert);
	}
	let time = '';
	if (now.getUTCHours() < 10)
		time += '0';
	time += now.getUTCHours();
	time += ':';
	if (now.getUTCMinutes() < 10)
		time += '0';
	time += now.getUTCMinutes();
	time += ':';
	if (now.getUTCSeconds() < 10)
		time += '0';
	time += now.getUTCSeconds();
	return time;
}

function line(err = new Error()) {
    const regex = /\((.*):(\d+):(\d+)\)$/
    const match = regex.exec(err.stack.split("\n")[2]);
    const filepath = match[1];
    const fileName = Path.basename(filepath);
    const line = match[2];
    const column = match[3];
    return {
        filepath,
        fileName,
        line,
        column,
        str: `${fileName}:${line}:${column}`
    };
}

function inspect(mode, code, func, obj) {
	let type = typeof obj;
	if (Array.isArray(obj))
		type = 'array';
	console.log(getTime(), 'INSP'.ansiCyan
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|'
		+ ' "' + type + '"', Util.inspect(obj, true, null, true));
}

function log(...args) {
	getTime();
	console.log(...args);
}

function info(mode, code, func, ...args) {
	console.log(getTime(), 'INFO'.ansiBlue
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		...args);
}

function debug(mode, code, func, ...args) {
	console.log(getTime(), 'DEBG'.ansiBlueBack
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		...args);
}

function warn(mode, code, func, ...args) {
	const tt = getTime();
	if (process.env.pm_id) console.error(tt, 'WARN:' + mode + ':' + code + (func != null ? '.' + func : ''));
	console.log(tt, 'WARN'.ansiRed
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		...args);
}

function assert(check, mode, code, func, ...args) {
	if (check == true)
		return;
	const tt = getTime();
	if (process.env.pm_id) console.error(tt, 'ASST:' + mode + ':' + code + (func != null ? '.' + func : ''));
	console.log(tt, 'ASST'.ansiYellowBack
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		...args);
}

function error(mode, code, func, ...args) {
	const tt = getTime();
	if (process.env.pm_id) console.error(tt, 'ERRO:' + mode + ':' + code + (func != null ? '.' + func : ''));
	console.log(tt, 'ERRO'.ansiRedBack
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		...args);
}

const TimeLabels = {};

function begin(label, mode, code, func, ...args) {
	TimeLabels[label] = Date.now();
	console.log(getTime(), 'TIME'.ansiUnderline
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		'begin'.ansiGreen
		+ '("' + label + '")=' + '0'.ansiYellow.ansiBright + 'ms',
		...args);
}

const SECms = 1000;
const MINms = 60 * SECms;
const HORms = 60 * MINms;
const DAYms = 24 * HORms;
function fmt(ms) {
	ms = parseInt(ms);
	let str = '';

	if (ms > DAYms) {
		str += Math.floor(ms / DAYms) + 'd';
		ms %= DAYms;
		if (ms < 1) {
			str += '00:00:00.000';
			return str;
		}
	}
	else if (str.length > 0) {
		str += '0d';
	}

	if (ms > HORms) {
		const v = Math.floor(ms / HORms);
		str += (v < 10 ? '0' : '') + v + ':';
		ms %= HORms;
		if (ms < 1) {
			str += '00:00.000';
			return str;
		}
	}
	else if (str.length > 0) {
		str += '00:';
	}

	if (ms > MINms) {
		const v = Math.floor(ms / MINms);
		str += (v < 10 ? '0' : '') + v + ':';
		ms %= MINms;
		if (ms < 1) {
			str += '00.000';
			return str;
		}
	}
	else if (str.length > 0) {
		str += '00:';
	}

	if (ms > SECms) {
		const v = Math.floor(ms / SECms);
		str += (v < 10 ? '0' : '') + v + '.';
		ms %= SECms;
		if (ms < 1) {
			str += '000';
			return str;
		}
	}
	else if (str.length > 0) {
		str += '00.';
	}

	str += (ms < 100 ? '0' : '') + (ms < 10 ? '0' : '') + ms;
	return str;
}

function elapse(label, mode, code, func, ...args) {
	if (!TimeLabels.hasOwnProperty(label)) {
		console.log(getTime(), 'TIME'.ansiUnderline
			+ ':' + mode.ansiBlue.ansiBright
			+ ':' + code.ansiYellow.ansiBright
			+ (func != null ? '.' + func : '') + '|',
			'elapse'.ansiYellow
			+ '(invalid label "' + label + '")=' + '?'.ansiRed.ansiBright + 'ms',
			...args);
		return;
	}
	const diff = Date.now() - TimeLabels[label];
	console.log(getTime(), 'TIME'.ansiUnderline
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		'elapse'.ansiYellow
		+ '("' + label + '")=' + ('' + diff).ansiYellow.ansiBright + 'ms' + '(' + fmt(diff).ansiYellow + ')',
		...args);
}

function end(label, mode, code, func, ...args) {
	if (!TimeLabels.hasOwnProperty(label)) {
		console.log(getTime(), 'TIME'.ansiUnderline
			+ ':' + mode.ansiBlue.ansiBright
			+ ':' + code.ansiYellow.ansiBright
			+ (func != null ? '.' + func : '') + '|',
			'end'.ansiRed
			+ '(invalid label "' + label + '")=' + '?'.ansiRed.ansiBright + 'ms',
			...args);
		return;
	}
	const diff = Date.now() - TimeLabels[label];
	delete TimeLabels[label];
	console.log(getTime(), 'TIME'.ansiUnderline
		+ ':' + mode.ansiBlue.ansiBright
		+ ':' + code.ansiYellow.ansiBright
		+ (func != null ? '.' + func : '') + '|',
		'end'.ansiRed
		+ '("' + label + '")=' + ('' + diff).ansiYellow.ansiBright + 'ms' + '(' + fmt(diff).ansiYellow + ')',
		...args);
}

function br() {
	console.log('\t');
}

function hr(ch = '-') {
	if (typeof ch !== 'string')
		ch = '-';
	let col = 40;
	if (process.stdout?.columns && process.stdout.columns > 2)
		col = process.stdout.columns;
	console.log(ch.repeat((col - 2) / ch.length));
}

module.exports = {
	line: line,
	inspect: inspect,
	log: log,
	info: info,
	debug: debug,
	warn: warn,
	assert: assert,
	error: error,
	begin: begin,
	elapse: elapse,
	end: end,
	br: br,
	hr: hr,
};
