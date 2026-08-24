// Unified JSON error shape and HTTP status text helpers.

const KNOWN_STATUS_TEXT: Record<number, string> = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  413: 'Payload Too Large',
  418: "I'm a teapot",
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
}

export function statusText(code: number): string {
  return KNOWN_STATUS_TEXT[code] ?? `Status ${code}`
}

export interface ErrorBody {
  success: false
  error: string
  message: string
  path: string
}

// Every non-2xx response on this service uses this shape so clients can
// parse errors uniformly.
export function errorBody(
  status: number,
  message: string,
  path: string,
  error?: string,
): ErrorBody {
  return { success: false, error: error ?? statusText(status), message, path }
}
