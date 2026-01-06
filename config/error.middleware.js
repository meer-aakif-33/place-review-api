const errorHandler = (err, req, res, next) => {
  console.error({
  message: err.message,
  code: err.code,
  stack: err.stack
  });
  
    // Custom / explicit errors
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: {
          message: err.message
        }
      });
    }


  // Prisma unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      error: {
        message: "Resource already exists",
        code: "DUPLICATE_RESOURCE"
      }
    });
  }

  // Fallback
  return res.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
};

module.exports = errorHandler;
