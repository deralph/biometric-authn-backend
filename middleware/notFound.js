const notFound = async (req, res) => {
  return res.send("route not found");
};

module.exports = notFound;
