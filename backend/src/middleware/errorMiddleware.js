const { StatusCodes } = require("http-status-codes");

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (error.code === 11000) {
    return res.status(StatusCodes.CONFLICT).json({
      message: "A record with that value already exists"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(", ")
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid token"
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Session expired"
    });
  }

  return res.status(statusCode).json({
    message: error.message || "Something went wrong"
  });
};

module.exports = {
  notFound,
  errorHandler
};
