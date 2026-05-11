/**
 * Custom Error class to handle API-specific errors.
 * Extending the base Error class allows us to capture the stack trace
 * while adding custom properties like 'status' and 'info'.
 */
export class ApiError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Enterprise-grade Fetcher utility.
 * 
 * @template T - The expected shape of the JSON response
 * @param url - The endpoint to hit
 * @param config - Optional fetch configuration (headers, method, etc.)
 * @returns Promise<T>
 */
export async function fetcher<T>(
  url: string,
  config: RequestInit = {}
): Promise<T> {
  // Set default headers if not provided
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...config,
    headers: {
      ...defaultHeaders,
      ...config.headers,
    },
  });

  // If the response is not in the 200-299 range
  if (!response.ok) {
    let errorInfo;
    
    try {
      // Try to parse error details from the server (e.g., { message: "Unauthorized" })
      errorInfo = await response.json();
    } catch {
      errorInfo = { message: "Failed to parse error response" };
    }

    const message = errorInfo?.message || "An unexpected error occurred while fetching data.";
    
    // Throw our custom ApiError with the status and info
    throw new ApiError(message, response.status, errorInfo);
  }

  // Handle 204 No Content gracefully
  if (response.status === 204) {
    return {} as T;
  }

  // Return the type-casted JSON response
  return response.json() as Promise<T>;
}

/**
 * Best Practice: Use this fetcher with libraries like SWR or React Query.
 * Example: const { data } = useSWR<User>('/api/user', fetcher)
 */