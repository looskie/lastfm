export const ERROR_CODES = {
  2: "Invalid service",
  3: "Invalid method",
  4: "Authentication failed",
  5: "Invalid format",
  6: "Invalid parameters",
  7: "Invalid resource",
  8: "Operation failed",
  9: "Invalid session key",
  10: "Invalid API key",
  11: "Service offline",
  13: "Invalid method signature",
  14: "Unauthorized token",
  16: "Service temporarily unavailable",
  17: "Login required",
  26: "API key suspended",
  27: "Deprecated",
  29: "Rate limit exceeded",
} as const;

export type LastFMErrorCode = keyof typeof ERROR_CODES;

export interface LastFMErrorResponse {
  error: number;
  message: string;
}

export class LastFMError extends Error {
  public readonly code: number;

  constructor(
    public readonly response: Response,
    public readonly body: LastFMErrorResponse,
  ) {
    super(body.message);
    this.code = body.error;
  }
}
