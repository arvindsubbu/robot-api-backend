const Robot = require("../models/Robot");
const Log = require("../models/Log");
const crypto = require("crypto");

/**
 * Register a new robot.
 * Expects body: { id, name, type, status? }
 * - id is client-provided and used as _id in DB
 */
exports.register = async (req, res, next) => {
  try {
    const { id, name, type, status } = req.body;
    const apiKey = crypto.randomBytes(24).toString("hex"); // 48 hex chars

    // Basic validation
    if (!id || !name || !type) {
      return res.status(400).json({ error: "id, name and type are required" });
    }

    // Idempotency / duplicate handling: if robot exists, return 409 Conflict
    const existing = await Robot.findById(id).lean();
    if (existing) {
      return res
        .status(409)
        .json({ error: "Robot with this ID already exists", robot: existing });
    }

    const robot = await Robot.create({
      _id: id,
      name,
      type,
      status: status || undefined,
      apiKey,
    });

    return res
      .status(201)
      .json({ message: "Robot registered successfully", robot, apiKey});
  } catch (err) {
    next(err); // forwarded to global error handler
  }
};

/**
 * List robots with simple pagination.
 * Query params: ?page=1&limit=20
 */
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [robots, total] = await Promise.all([
      Robot.find().skip(skip).limit(limit).lean().sort({ updatedAt: -1 }),
      Robot.countDocuments(),]);

    return res.json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: robots,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single robot by id
 */
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const robot = await Robot.findById(id).lean();
    if (!robot) return res.status(404).json({ error: "Robot not found" });
    return res.json(robot);
  } catch (err) {
    next(err);
  }
};

/**
 * Update robot status (battery, location, mode/status, error)
 * Accepts partial body. Example:
 * { battery: 85, location: {x:1,y:2}, mode: 'active', error: null }
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { battery, location, mode, error } = req.body;

    // Validate values simply
    if (battery !== undefined) {
      if (typeof battery !== "number" || battery < 0 || battery > 100) {
        return res
          .status(400)
          .json({ error: "battery must be a number between 0 and 100" });
      }
    }

    const update = {};
    if (battery !== undefined) update.battery = battery;
    if (location !== undefined) update.location = location;
    if (mode !== undefined) update.status = mode; // mode is mapped to status in DB
    if (error !== undefined) {
      // if error is truthy, mark status as error
      update.error = error === null ? null : String(error);
      if (error) update.status = "error";
    }

    // Ensure there is at least one field to update
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const robot = await Robot.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!robot) return res.status(404).json({ error: "Robot not found" });

    // Create a log entry for the status update
    const messageParts = [];
    if (battery !== undefined) messageParts.push(`battery=${battery}%`);
    if (mode !== undefined) messageParts.push(`mode=${mode}`);
    if (location !== undefined)
      messageParts.push(`location=${JSON.stringify(location)}`);
    if (error !== undefined) messageParts.push(`error=${error}`);
    const message =
      `Status update: ${messageParts.join(", ")}` || "Status updated";

    await Log.create({
      robotId: robot._id,
      message,
      level: error ? "error" : "info",
      meta: { update },
    });

    return res.json({ message: "Status updated", robot });
  } catch (err) {
    // If validation error from mongoose, make it a 400
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};
