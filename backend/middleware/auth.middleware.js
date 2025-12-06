const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No Token Provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
exports.verifyAdminAndUser = (req, res, next) => {
  console.log(req.user);
  console.log("====================================");
  // console.log();

  console.log(req.params.id);
  console.log("====================================");
  console.log(req.user._id);
  console.log("====================================");

  if (req.user._id === req.params.id || req.user.isAdmin === true) {
    next();
  } else {
    console.log(req.user);
    console.log(requestedUserId);
    return res.status(403).json({ message: "You are not allowed " });
  }
};
exports.verifyAdmin = (req, res, next) => {
  try {
    console.log(req.user);

    if (req.user.isAdmin === true) {
      return next();
    }
    return res.status(403).json({ message: "You are not allowed " });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
