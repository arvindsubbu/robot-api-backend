const Log = require("../models/Log");
const Robot = require("../models/Robot");

/**
 * Create a log manually
 * Body: { message, level, meta }
 */
exports.createLog = async (req, res, next) => {
  try {
    const { id } = req.params; // robot id
    const { message, level, meta } = req.body;

    // Validate robot exists
    const robot = await Robot.findById(id).lean();
    if (!robot) return res.status(404).json({ error: "Robot not found" });

    if (!message) {
      return res.status(400).json({ error: "message is required for logs" });
    }

    const log = await Log.create({
      robotId: id,
      message,
      level: level || "info",
      meta: meta || null,
    });

    return res.status(201).json({ message: "Log created", log });
  } catch (err) {
    next(err);
  }
};

/**
 * Get logs for a robot, newest first.
 * Query params: ?limit=20
 */
exports.getLogs = async (req, res, next) => {
  try {
    const { id } = req.params;

    const robot = await Robot.findById(id).lean();
    if (!robot) return res.status(404).json({ error: "Robot not found" });

    const limit = Math.min(100, parseInt(req.query.limit) || 20);

    const logs = await Log.find({ robotId: id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      robotId: id,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};
