const Robot = require("../models/Robot");

/**
 * Middleware to authenticate robot requests using x-api-key header.
 * Expects robot id to be in req.params.id (or req.body.id).
 */
module.exports = async (req, res, next) => {
  try {
    const providedKey = req.headers["x-api-key"] || null;
    const robotId = req.params.id || (req.body && req.body.id);

    if (!robotId) {
      return res.status(400).json({ error: "Robot id required in path or body" });
    }
    if (!providedKey) {
      return res.status(401).json({ error: "Missing x-api-key header" });
    }

    // Need to select apiKey because schema has select:false
    const robot = await Robot.findById(robotId).select("+apiKey").lean();
    if (!robot) return res.status(404).json({ error: "Robot not found" });

    if (!robot.apiKey || robot.apiKey !== providedKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // attach robot info (without apiKey) for controller convenience
    const { apiKey, ...robotSafe } = robot;
    req.robot = robotSafe;

    next();
  } catch (err) {
    next(err);
  }
};