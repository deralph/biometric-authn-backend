const errorHandler = async (err, req, res, next) => {
  return res.status(err.statusCode).json(err);
};

module.exports = errorHandler;
