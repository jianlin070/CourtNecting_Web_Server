paginator = (req, res, next) => {
  let page = +req.query.page || 1
  let limit = +req.query.limit || 5
  let skip = +req.query.skip || (page - 1) * limit
  let q = req.query.q || ''
  let context
  context = { page, limit, skip, q }
  req.context = context;
  next();
};

module.exports = paginator;