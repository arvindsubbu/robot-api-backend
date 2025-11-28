const express = require("express");
const router = express.Router();

const logsController = require("../controllers/logsController");

// Async wrapper to forward errors properly
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * POST /robots/:id/logs
 * Create a log entry for a robot
 */
router.post("/:id/logs", asyncHandler(logsController.createLog));

/**
 * GET /robots/:id/logs?limit=20
 * Retrieve logs for a robot, newest first
 */
router.get("/:id/logs", asyncHandler(logsController.getLogs));

module.exports = router;
