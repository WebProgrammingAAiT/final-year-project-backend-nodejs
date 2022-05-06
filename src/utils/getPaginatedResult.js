export function getPaginatedResult(req, res, length) {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  if (!page || !limit) throw new Error("Please provide a page and limit");
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (endIndex < length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  results.startIndex = startIndex;
  results.limit = limit;
  return results;
}
