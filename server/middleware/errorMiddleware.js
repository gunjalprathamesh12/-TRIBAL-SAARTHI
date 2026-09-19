export const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    errorCode: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR'),
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
