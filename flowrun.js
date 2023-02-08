'use strict';

/* 순차실행 모듈

	넘겨받은 함수들을 순차적으로 실행한다.
	각 함수들은 넘겨받은 FlowPack 클래스를 적절히 설정하여 흐름을 조절한다.

const FlowRun = require('./lib/flowrun.js');


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


*/

//=============================================================================
// 구현

/**
 * 순차적 실행을 수행.
 * @class
 * @member [function] funcList       - 실행할 함수 목록.
 * @member {function} errorCallback  - 도중에 오류가 발생하면 실행될 콜백.
 * @member {function} finishCallback - 실행을 모두 마치면 실행될 콜백.
 * @member {number}   pos            - 다음 실행할 위치.
 * @member {FlowPack} pack           - 실행 내용을 담고 있는 클래스.
 */
module.exports = class FlowRun {
	/**
	 * 생성자.
	 * @constructor
	 * @param [function] funcList       - 실행할 함수 목록.
	 * @param {function} errorCallback  - 도중에 오류가 발생하면 실행될 콜백.
	 * @param {function} finishCallback - 실행을 모두 마치면 실행될 콜백.
	 * @param {bool}     debug          - 디버깅 로그 출력 여부. (기본은 false)
	 * @param {string}   id             - 디버깅 구분자. (기본은 null)
	 */
	constructor(funcList, errorCallback = null, finishCallback = null, debug = false, id = null) {
		const uid = (new Date()).getTime().toString(16).split('').sort(() => 0.5 - Math.random()).join('');
		if (id)
			this.id_ = id + ':' + uid;
		else
			this.id_ = uid;
		this.debug_ = debug;

		this.labelList_ = {};
		if (Array.isArray(funcList)) {
			this.funcList_ = funcList;
			for (const i in this.funcList_) {
				const idx = parseInt(i);
				if (typeof this.funcList_[idx] !== 'function') {
					const label = '' + this.funcList_[idx];
					if (this.labelList_.hasOwnProperty(label))
						console.warn('FlowRun(' + this.id_ + '):WARN: label(' + label + ') is duplicated.');
					this.labelList_[label] = idx;
					if (this.debug_)
						this.funcList_[idx] = Function('"use strict"; return (function(flow) { console.debug(\'FlowRun(' + this.id_ + '):DEBUG: label "' + label + '"\'); });')();
					else
						this.funcList_[idx] = function(flow){};
				}
			}
			if (this.debug_) {
				console.debug('FlowRun(' + this.id_ + '):DEBUG: labelList', this.labelList_);
				console.debug('FlowRun(' + this.id_ + '):DEBUG: Starting with funcList(' + this.funcList_.length + ').');
			}
		}
		else {
			this.funcList_ = [
				function(pack) {
					console.warn('FlowRun(' + this.id_ + '):WARN: funcList is empty. ', res.getParams());
				}
			];
		}
		if (typeof errorCallback === 'function') {
			this.errorCallback_ = errorCallback;
		}
		else {
			this.errorCallback_ = function(err) {
				console.error('FlowRun(' + this.id_ + '):ERROR: ', err);
			};
		}
		if (typeof finishCallback === 'function') {
			this.finishCallback_ = finishCallback;
		}
		else {
			this.finishCallback_ = function(res) {
				console.warn('FlowRun(' + this.id_ + '):WARN: null finished: ', res);
			};
		}
		this.pos_ = 0;
		this.pack_ = new FlowPack(this);

		if (this.debug_)
			console.debug('FlowRun(' + this.id_ + '):DEBUG: created.');
	}

	/**
	 * 라벨의 위치 얻기.
	 * @param {string} label - 특정 라벨.
	 */
	getIndex4Label(label) {
		return (this.labelList_[label] ?? -1);
	}

	/**
	 * 실행.
	 * @param {object} initParams - 초기 파라메터.
	 */
	run(initParams = null) {
		if (initParams)
			this.pack_.params_ = initParams;

		if (this.pack_.block_ == true) {
			if (this.pack_.error_ != null) {
				if (this.debug_)
					console.debug('FlowRun(' + this.id_ + '):DEBUG: error!');
				this.errorCallback_(this.pack_.error_, this.pack_.getParams());
				return;
			}
			if (this.pack_.result_ != null) {
				if (this.debug_)
					console.debug('FlowRun(' + this.id_ + '):DEBUG: finished.');
				this.finishCallback_(this.pack_.result_, this.pack_.getParams());
				return;
			}
		}

		setTimeout( flowrun => {
			if (flowrun.pos_ < 0 || flowrun.pos_ >= flowrun.funcList_.length) {
				if (this.debug_)
					console.debug('FlowRun(' + this.id_ + '):DEBUG: Out of index.');
				flowrun.errorCallback_('FlowRun(' + flowrun.id_ + '): Out of index. ' + flowrun.pos_ + '/' + (flowrun.funcList_.length - 1));
				return;
			}

			flowrun.pack_.step_ = 1;
			flowrun.pack_.block_ = false;
			flowrun.pack_.delay_ = 0;
			flowrun.pack_.error_ = null;
			flowrun.pack_.result_ = null;
			if (flowrun.debug_)
				console.debug('FlowRun(' + flowrun.id_ + '):DEBUG: run ' + flowrun.pos_ + '/' + (flowrun.funcList_.length - 1));
			flowrun.funcList_[flowrun.pos_](flowrun.pack_);
			if (flowrun.pack_.error_ != null) {
				if (flowrun.debug_)
					console.debug('FlowRun(' + flowrun.id_ + '):DEBUG: error!');
				flowrun.errorCallback_(flowrun.pack_.error_, this.pack_.getParams());
				return;
			}
			if (flowrun.pack_.result_ != null) {
				if (flowrun.debug_)
					console.debug('FlowRun(' + flowrun.id_ + '):DEBUG: finished.');
				flowrun.finishCallback_(flowrun.pack_.result_, this.pack_.getParams());
				return;
			}
			if (flowrun.pack_.block_ == false) {
				flowrun.pos_ += flowrun.pack_.step_;
				if (flowrun.debug_)
					console.debug('FlowRun(' + flowrun.id_ + '):DEBUG: step ' + flowrun.pack_.step_ + ', next ' + flowrun.pos_);
				flowrun.run();
			}
		}, this.pack_.delay_, this);
	}
}

/**
 * 실행 컨트롤 팩.
 * @class
 * @member {FlowRun} flowrun - 소유자 객체.
 * @member {number}  step    - 다음으로 넘어갈 개수. 기본값은 1. 0이면 현재 위치 반복, 음수면 앞으로 이동.
 * @member {object}  params  - 다음 함수에게 넘겨줄 파라메터.
 * @member {bool}    block   - 연속성을 대기할지 여부를 설정.
 * @member {number}  delay   - 다음 실행 때까지 지연할 시간 ms.
 * @member {object}  error   - 오류가 발생했을 경우 실행을 중단.
 * @member {object}  result  - 결과가 결정되었을 경우 실행을 마침.
 */
class FlowPack {
	/**
	 * 생성자.
	 * @constructor
	 */
	constructor(flowrun) {
		this.flowrun_ = flowrun;
		this.step_ = 0;
		this.params_ = {};
		this.block_ = false;
		this.resumed_ = false;
		this.delay_ = 0;
		this.error_ = null;
		this.result_ = null;
	}

	/**
	 * 다음 실행 위치.
	 * @param {number} move - 이동할 개수.
	 */
	next(move = 1) {
		this.step_ = move;
	}

	/**
	 * 다음 실행 라벨.
	 * @param {string} label - 이동할 라벨.
	 */
	nextLabel(label) {
		const next = this.flowrun_.getIndex4Label(label);
		if (next < 0) {
			console.warn('FlowRun(' + this.flowrun_.id_ + '):WARN: nextLabel(' + label + ') cannot found.');
			console.trace('FlowRun(' + this.flowrun_.id_ + ').nextLabel()');
			this.step_ = 1;
			return;
		}
		this.step_ = next - this.flowrun_.pos_;
	}

	/**
	 * 다음 파라메터 설정.
	 * @param {object} par - 파라메터 객체.
	 */
	params(par = {}) {
		this.params_ = par;
	}

	/**
	 * 파라메터 확인.
	 * @return {object} 현재 파라메터 객체.
	 */
	getParams() {
		if (this.params_) {
			return this.params_;
		}
		return {};
	}

	/**
	 * 다음 실행을 일시정지.
	 */
	pause() {
		this.block_ = true;
		this.resumed_ = false;
		if (this.flowrun_.debug_)
			console.debug('FlowRun(' + this.flowrun_.id_ + '):DEBUG: pause');
	}
	/**
	 * 다음 실행을 계속.
	 */
	resume() {
		if (this.flowrun_.debug_)
			console.debug('FlowRun(' + this.flowrun_.id_ + '):DEBUG: resume');
		if (this.block_) {
			if (this.resumed_) {
				console.warn('FlowRun(' + this.flowrun_.id_ + '):WARN: resume() must call only one time.');
				console.trace('FlowRun(' + this.flowrun_.id_ + ').resume()');
				return;
			}
			this.resumed_ = true;
			this.flowrun_.pos_ += this.step_;
			if (this.flowrun_.debug_)
				console.debug('FlowRun(' + this.flowrun_.id_ + '):DEBUG: step ' + this.step_ + ', next ' + this.flowrun_.pos_);
			this.flowrun_.run();
		}
	}

	/**
	 * 다음 실행을 지연시키기.
	 * @param {number} ms - 지연시킬 시간 ms.
	 */
	delay(ms = 0) {
		this.delay_ = ms;
	}

	/**
	 * 오류 발생으로 종료시키기.
	 * @param {object} err - 오류 객체.
	 */
	error(err = 'unknown') {
		this.error_ = err;
	}

	/**
	 * 오류 발생 여부 확인하기.
	 */
	hasError() {
		return (this.error_ != null);
	}

	/**
	 * 실행 완료로 종료시키기.
	 * @param {object} ret - 수행 결과 객체.
	 */
	result(ret = '') {
		this.result_ = ret;
	}
}
