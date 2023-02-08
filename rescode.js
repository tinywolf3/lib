'use strict';

/* 결과 코드 라이브러리

const ResCode = require('./lib/rescode.js');

*/

//=============================================================================
// 구현

const AppRes = {
	// 응답 코드의 메시지
	getDesc: (code) => {
		for (const res in AppRes) {
			if (AppRes[res].hasOwnProperty('code') && AppRes[res].code == code)
				return AppRes[res].desc;
		}
		let type = '';
		if (AppRes.isOK(code))
			type = ' ok';
		else if (AppRes.isError(code))
			type = ' error';
		else if (AppRes.isWarn(code))
			type = ' warning';
		return `Code ${code} is unknown${type}.`;
	},

	// 0 (성공적인 종료)
	isOK: (code) => (code == 0),
	OK: {
		code: 0,
		desc: 'Successful end.'
	},

	// -n (오류로 중단)
	isError: (code) => (code < 0),
	UnknownError: {
		code: -1,
		desc: 'Unknown error or unspecified error.'
	},

	ProcessError: {
		code: -100,
		desc: 'Unspecified error related to processing.'
	},
	WrongState: {
		code: -101,
		desc: 'Process state is wrong.'
	},
	MemoryError: {
		code: -110,
		desc: 'Unspecified error related to memory.'
	},
	InsufficientMemory: {
		code: -111,
		desc: 'Insufficient memory.'
	},
	DamagedMemory: {
		code: -112,
		desc: 'Memory data is damaged.'
	},
	FileError: {
		code: -120,
		desc: 'Unspecified error related to file.'
	},
	NoFile: {
		code: -121,
		desc: 'Cannot find a file.'
	},
	ReadFail: {
		code: -122,
		desc: 'Cannot read the file.'
	},
	WriteFail: {
		code: -123,
		desc: 'Cannot write to file.'
	},
	DirError: {
		code: -130,
		desc: 'Unspecified error related to directory.'
	},
	NoDir: {
		code: -131,
		desc: 'Cannot find a directory.'
	},
	OpenFail: {
		code: -132,
		desc: 'Cannot open the directory.'
	},

	NetworkError: {
		code: -200,
		desc: 'Unspecified error related to network.'
	},
	IncorrectAddress: {
		code: -201,
		desc: 'Network address is incorrect.'
	},
	IncorrectPort: {
		code: -202,
		desc: 'Target port is incorrect.'
	},
	UnknownHost: {
		code: -203,
		desc: 'Connot find target host.'
	},
	ConnectionError: {
		code: -210,
		desc: 'Unspecified error related to network connection.'
	},
	ConnectionTimeout: {
		code: -211,
		desc: 'Connection time-out.'
	},
	Disconnected: {
		code: -212,
		desc: 'Connection is dissconnected.'
	},
	ResponseError: {
		code: -213,
		desc: 'Response is incorrect.'
	},
	ClientError: {
		code: -220,
		desc: 'Unspecified error related to network client.'
	},
	ClientDisconnect: {
		code: -221,
		desc: 'Disconnected by client.'
	},
	ServerError: {
		code: -230,
		desc: 'Unspecified error related to network server.'
	},
	ServerDisconnect: {
		code: -221,
		desc: 'Disconnected by server.'
	},
	NotSupport: {
		code: -221,
		desc: 'Unsupported api is called.'
	},
	DatabaseError: {
		code: -240,
		desc: 'Unspecified error related to database.'
	},
	DatabaseNotFound: {
		code: -241,
		desc: 'Cannot find the database.'
	},
	CreateDatabaseFail: {
		code: -242,
		desc: 'Cannot create a database or a table.'
	},
	IncorrectSQL: {
		code: -243,
		desc: 'Query is incorrect syntax.'
	},
	NoResult: {
		code: -244,
		desc: 'Query result is empty.'
	},

	// n (경고를 남긴 종료)
	isWarn: (code) => (code > 0),
	UnspecifiedWarn: {
		code: 1,
		desc: 'Unknown warning or unspecified warning.'
	},

	ProcessWarn: {
		code: 100,
		desc: 'Unspecified warning related to processing.'
	},
	DebugStop: {
		code: 101,
		desc: 'Process stopped for debugging.'
	},
	UnexpectedStop: {
		code: 102,
		desc: 'Process stopped by unexpected warning.'
	},
	MemoryWarn: {
		code: 110,
		desc: 'Unspecified warning related to memory.'
	},
	FileWarn: {
		code: 120,
		desc: 'Unspecified warning related to file.'
	},
	DirWarn: {
		code: 130,
		desc: 'Unspecified warning related to directory.'
	},

	NetworkWarn: {
		code: 200,
		desc: 'Unspecified warning related to network.'
	},
	ConnectionWarn: {
		code: 210,
		desc: 'Unspecified warning related to network connection.'
	},
	UnexpectedResponse: {
		code: 213,
		desc: 'Unexpected response.'
	},
	ClientWarn: {
		code: 220,
		desc: 'Unspecified warning related to network client.'
	},
	ServerWarn: {
		code: 230,
		desc: 'Unspecified warning related to network server.'
	},
	DatabaseWarn: {
		code: 240,
		desc: 'Unspecified warning related to database.'
	},
	UnexpectedResult: {
		code: 244,
		desc: 'Unexpected query result.'
	},
	InsertFail: {
		code: 245,
		desc: 'Insert query is failed.'
	},
	UpdateFail: {
		code: 246,
		desc: 'Update query is failed.'
	},
};

const HttpRes = {
	// 응답 코드의 메시지
	getDesc: (code) => {
		for (const res in HttpRes) {
			if (HttpRes[res].hasOwnProperty('code') && HttpRes[res].code == code)
				return HttpRes[res].desc;
		}
		let type = '';
		if (HttpRes.isInformational(code))
			type = ' informational';
		else if (HttpRes.isSuccess(code))
			type = ' success';
		else if (HttpRes.isRedirection(code))
			type = ' redirection';
		else if (HttpRes.isClientError(code))
			type = ' client error';
		else if (HttpRes.isServerError(code))
			type = ' server error';
		else if (HttpRes.isError(code))
			type = ' error';
		return `Code ${code} is unknown${type}.`;
	},

	// 1xx (조건부 응답: 요청을 받았으며 프로세스를 계속한다)
	isInformational: (code) => (code >= 100 && code < 200),
	Continue: {
		code: 100,
		desc: 'The server has received the request headers and the client should proceed to send the request body.'
	},
	SwitchingProtocols: {
		code: 101,
		desc: 'The requester has asked the server to switch protocols and the server has agreed to do so.'
	},
	Processing: {
		code: 102,
		desc: 'A WebDAV request may contain many sub-requests involving file operations, requiring a long time to complete the request.'
	},
	EarlyHints: {
		code: 103,
		desc: 'Used to return some response headers before final HTTP message.'
	},
	ResponseStale: {
		code: 110,
		desc: 'The response provided by a cache is stale.'
	},
	RevalidationFailed: {
		code: 111,
		desc: 'The cache was unable to validate the response, due to an inability to reach the origin server.'
	},
	DisconnectedOperation: {
		code: 112,
		desc: 'The cache is intentionally disconnected from the rest of the network.'
	},
	HeuristicExpiration: {
		code: 113,
		desc: 'The cache heuristically chose a freshness lifetime greater than 24 hours and the response\'s age is greater than 24 hours.'
	},
	MiscellaneousWarning: {
		code: 199,
		desc: 'Arbitrary, non-specific warning.'
	},

	// 2xx (성공: 요청을 성공적으로 받았으며 인식했고 수용하였다)
	isSuccess: (code) => (code >= 200 && code < 300),
	OK: {
		code: 200,
		desc: 'Standard response for successful HTTP requests.'
	},
	Created: {
		code: 201,
		desc: 'The request has been fulfilled, resulting in the creation of a new resource.'
	},
	Accepted: {
		code: 202,
		desc: 'The request has been accepted for processing, but the processing has not been completed.'
	},
	NonAuthoritativeInformation: {
		code: 203,
		desc: 'The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified version of the origin\'s response.'
	},
	NoContent: {
		code: 204,
		desc: 'The server successfully processed the request, and is not returning any content.'
	},
	ResetContent: {
		code: 205,
		desc: 'The server successfully processed the request, asks that the requester reset its document view, and is not returning any content.'
	},
	PartialContent: {
		code: 206,
		desc: 'The server is delivering only part of the resource due to a range header sent by the client.'
	},
	MultiStatus: {
		code: 207,
		desc: 'The message body that follows is by default an XML message and can contain a number of separate response codes, depending on how many sub-requests were made.'
	},
	AlreadyReported: {
		code: 208,
		desc: 'The members of a DAV binding have already been enumerated in a preceding part of the response, and are not being included again.'
	},
	TransformationApplied: {
		code: 214,
		desc: 'Added by a proxy if it applies any transformation to the representation, such as changing the content encoding, media type or the like.'
	},
	IMUsed: {
		code: 226,
		desc: 'The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.'
	},
	MiscellaneousPersistentWarning: {
		code: 299,
		desc: 'Same as 199, but indicating a persistent warning.'
	},

	// 3xx (리다이렉션: 요청 완료를 위해 추가 작업 조치가 필요하다)
	isRedirection: (code) => (code >= 300 && code < 400),
	MultipleChoices: {
		code: 300,
		desc: 'Indicates multiple options for the resource from which the client may choose.'
	},
	MovedPermanently: {
		code: 301,
		desc: 'This and all future requests should be directed to the given URI.'
	},
	Found: {
		code: 302,
		desc: 'Tells the client to look at another URL.'
	},
	SeeOther: {
		code: 303,
		desc: 'The response to the request can be found under another URI using the GET method.'
	},
	NotModified: {
		code: 304,
		desc: 'Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.'
	},
	UseProxy: {
		code: 305,
		desc: 'The requested resource is available only through a proxy, the address for which is provided in the response.'
	},
	SwitchProxy: {
		code: 306,
		desc: 'Subsequent requests should use the specified proxy.'
	},
	TemporaryRedirect: {
		code: 307,
		desc: 'In this case, the request should be repeated with another URI; however, future requests should still use the original URI.'
	},
	PermanentRedirect: {
		code: 308,
		desc: 'This and all future requests should be directed to the given URI.'
	},

	// 4xx (클라이언트 오류: 요청의 문법이 잘못되었거나 요청을 처리할 수 없다)
	isClientError: (code) => (code >= 400 && code < 500),
	BadRequest: {
		code: 400,
		desc: 'The server cannot or will not process the request due to an apparent client error.'
	},
	Unauthorized: {
		code: 401,
		desc: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.'
	},
	PaymentRequired: {
		code: 402,
		desc: 'This code might be used as part of some form of digital cash or micropayment scheme.'
	},
	Forbidden: {
		code: 403,
		desc: 'The request contained valid data and was understood by the server, but the server is refusing action.'
	},
	NotFound: {
		code: 404,
		desc: 'The requested resource could not be found but may be available in the future.'
	},
	MethodNotAllowed: {
		code: 405,
		desc: 'A request method is not supported for the requested resource.'
	},
	NotAcceptable: {
		code: 406,
		desc: 'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.'
	},
	ProxyAuthenticationRequired: {
		code: 407,
		desc: 'The client must first authenticate itself with the proxy.'
	},
	RequestTimeout: {
		code: 408,
		desc: 'The server timed out waiting for the request.'
	},
	Conflict: {
		code: 409,
		desc: 'Indicates that the request could not be processed because of conflict in the current state of the resource, such as an edit conflict between multiple simultaneous updates.'
	},
	Gone: {
		code: 410,
		desc: 'Indicates that the resource requested was previously in use but is no longer available and will not be available again.'
	},
	LengthRequired: {
		code: 411,
		desc: 'The request did not specify the length of its content, which is required by the requested resource.'
	},
	PreconditionFailed: {
		code: 412,
		desc: 'The server does not meet one of the preconditions that the requester put on the request header fields.'
	},
	PayloadTooLarge: {
		code: 413,
		desc: 'The request is larger than the server is willing or able to process.'
	},
	URITooLong: {
		code: 414,
		desc: 'The URI provided was too long for the server to process.'
	},
	UnsupportedMediaType: {
		code: 415,
		desc: 'The request entity has a media type which the server or resource does not support.'
	},
	RangeNotSatisfiable: {
		code: 416,
		desc: 'The client has asked for a portion of the file, but the server cannot supply that portion.'
	},
	ExpectationFailed: {
		code: 417,
		desc: 'The server cannot meet the requirements of the Expect request-header field.'
	},
	ImaTeapot: {
		code: 418,
		desc: 'This code was defined in 1998 as one of the traditional IETF April Fools\' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers.'
	},
	PageExpired: {
		code: 419,
		desc: 'Used by the Laravel Framework when a CSRF Token is missing or expired.'
	},
	MethodFailure: {
		code: 420,
		desc: 'The Spring Framework method has failed.'
	},
	MisdirectedRequest: {
		code: 421,
		desc: 'The request was directed at a server that is not able to produce a response.'
	},
	UnprocessableEntity: {
		code: 422,
		desc: 'The request was well-formed but was unable to be followed due to semantic errors.'
	},
	Locked: {
		code: 423,
		desc: 'The resource that is being accessed is locked.'
	},
	FailedDependency: {
		code: 424,
		desc: 'The request failed because it depended on another request and that request failed.'
	},
	TooEarly: {
		code: 425,
		desc: 'Indicates that the server is unwilling to risk processing a request that might be replayed.'
	},
	UpgradeRequired: {
		code: 426,
		desc: 'The client should switch to a different protocol such as TLS/1.3, given in the Upgrade header field.'
	},
	PreconditionRequired: {
		code: 428,
		desc: 'The origin server requires the request to be conditional.'
	},
	TooManyRequests: {
		code: 429,
		desc: 'The user has sent too many requests in a given amount of time.'
	},
	RequestHeaderFieldsTooLarge: {
		code: 430,
		desc: 'Too many URLs are requested within a certain time frame.'
	},
	RequestHeaderFieldsTooLarge: {
		code: 431,
		desc: 'The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.'
	},
	LoginTimeout: {
		code: 440,
		desc: 'The client\'s session has expired and must log in again.'
	},
	NoResponse: {
		code: 444,
		desc: 'The server to return no information to the client and close the connection immediately.'
	},
	RetryWith: {
		code: 449,
		desc: 'The server cannot honour the request because the user has not provided the required information.'
	},
	BlockedWindowsParentalControls: {
		code: 450,
		desc: 'The Microsoft extension code indicated when Windows Parental Controls are turned on and are blocking access to the requested webpage.'
	},
	UnavailableLegalReasons: {
		code: 451,
		desc: 'A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.'
	},
	LoadBalancerTimeout: {
		code: 460,
		desc: 'The load balancer before the idle timeout period elapsed.'
	},
	LoadBalancerTooManyIP: {
		code: 463,
		desc: 'The load balancer received an X-Forwarded-For request header with more than 30 IP addresses.'
	},
	RequestHeaderTooLarge: {
		code: 494,
		desc: 'Client sent too large request or too long header line.'
	},
	SSLCertificateError: {
		code: 495,
		desc: 'The client has provided an invalid client certificate.'
	},
	SSLCertificateRequired: {
		code: 496,
		desc: 'A client certificate is required but not provided.'
	},
	HTTPRequestSentHTTPS: {
		code: 497,
		desc: 'The client has made a HTTP request to a port listening for HTTPS requests.'
	},
	InvalidToken: {
		code: 498,
		desc: 'An expired or otherwise invalid token.'
	},
	ClientClosedRequest: {
		code: 499,
		desc: 'The client has closed the request before the server could send a response.'
	},

	// 5xx (서버 오류: 서버가 명백히 유효한 요청에 대해 충족을 실패했다)
	isServerError: (code) => (code >= 500 && code < 600),
	InternalServerError: {
		code: 500,
		desc: 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.'
	},
	NotImplemented: {
		code: 501,
		desc: 'The server either does not recognize the request method, or it lacks the ability to fulfil the request.'
	},
	BadGateway: {
		code: 502,
		desc: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.'
	},
	ServiceUnavailable: {
		code: 503,
		desc: 'The server cannot handle the request.'
	},
	GatewayTimeout: {
		code: 504,
		desc: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.'
	},
	VersionNotSupported: {
		code: 505,
		desc: 'The server does not support the HTTP protocol version used in the request.'
	},
	VariantAlsoNegotiates: {
		code: 506,
		desc: 'Transparent content negotiation for the request results in a circular reference.'
	},
	InsufficientStorage: {
		code: 507,
		desc: 'The server is unable to store the representation needed to complete the request.'
	},
	LoopDetected: {
		code: 508,
		desc: 'The server detected an infinite loop while processing the request.'
	},
	BandwidthLimitExceeded: {
		code: 509,
		desc: 'The server has exceeded the bandwidth specified by the server administrator.'
	},
	NotExtended: {
		code: 510,
		desc: 'The request are required for the server to fulfil it.'
	},
	NetworkAuthenticationRequired: {
		code: 511,
		desc: 'The client needs to authenticate to gain network access.'
	},
	ServerUnknownError: {
		code: 520,
		desc: 'The origin server returned an empty, unknown, or unexpected response to Cloudflare.'
	},
	ServerDown: {
		code: 521,
		desc: 'The origin server refused connections from Cloudflare.'
	},
	ConnectionTimeout: {
		code: 522,
		desc: 'Cloudflare timed out contacting the origin server.'
	},
	OriginUnreachable: {
		code: 523,
		desc: 'Cloudflare could not reach the origin server.'
	},
	TimeoutOccurred: {
		code: 524,
		desc: 'Cloudflare was able to complete a TCP connection to the origin server, but did not receive a timely HTTP response.'
	},
	SSLHandshakeFailed: {
		code: 525,
		desc: 'Cloudflare could not negotiate a SSL/TLS handshake with the origin server.'
	},
	InvalidSSLCertificate: {
		code: 526,
		desc: 'Cloudflare could not validate the SSL certificate on the origin web server.'
	},
	RailgunError: {
		code: 527,
		desc: 'An interrupted connection between Cloudflare and the origin server\'s Railgun server.'
	},
	SiteOverloaded: {
		code: 529,
		desc: 'The site can\'t process the request.'
	},
	SiteFrozen: {
		code: 530,
		desc: 'A site that has been frozen due to inactivity.'
	},
	LoadBalancerUnauthorized: {
		code: 561,
		desc: 'An error around authentication returned by a server registered with a load balancer.'
	},
	NetworkReadTimeout: {
		code: 598,
		desc: 'A network read timeout behind the proxy to a client in front of the proxy.'
	},
	NetworkConnectTimeout: {
		code: 599,
		desc: 'A network connect timeout behind the proxy to a client in front of the proxy.'
	},

	isError: (code) => (code >= 400 && code < 600)
};

module.exports = {
	app : AppRes,
	http: HttpRes,
	0: null
};
