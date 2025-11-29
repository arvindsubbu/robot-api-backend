const Log = require("../models/Log");
const Robot = require("../models/Robot");

/**
 * Create a log manually
 * Body: { message, level, meta }
 */
const allowedSources = new Set(["robot", "manual", "system", "operator"]);
const allowedLevels = new Set(["info", "warn", "error"]);
exports.createLog = async (req, res, next) => {
  try {
    const { id } = req.params; // robot id
    const { message, level, meta, source} = req.body;

    // Validate robot exists
    const robot = await Robot.findById(id).lean();
    if (!robot) return res.status(404).json({ error: "Robot not found" });

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "message is required for logs" });
    }
    message = message.trim();

    if (source && typeof source === "string") {
      source = source.toLocaleLowerCase();
      if (!allowedSources.has(source)) {
         return res.status(400).json({ error: "Invalid source value" });
        }
    }
    if (source === "robot") {
      return res.status(403).json({ error: "Direct robot-sourced logs not allowed from clients" });
    }
    const src = source || "manual";

    // Normalize level and validate
    if (level && typeof level === "string") level = level.toLowerCase();
    if (level && !allowedLevels.has(level)) {
      return res.status(400).json({ error: "Invalid level value" });
    }
    const lvl = level || "info";

    const metaObj = meta || null;

    const log = await Log.create({
      robotId: id,
      message,
      level: lvl,
      meta: metaObj,
      source : src,
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
