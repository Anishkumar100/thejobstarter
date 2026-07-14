/*
 * Global error handler middleware
 * Catches unhandled errors and returns a consistent JSON response
 */
export function errorHandler(err, req, res, next) {
  console.error('[ERROR] Unhandled error:', err.message);
  console.error('[ERROR] Stack:', err.stack);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export default errorHandler;
