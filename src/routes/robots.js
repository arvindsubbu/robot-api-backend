const express = require("express");
const router = express.Router();

const robotsController = require('../controllers/robotsController');

// small helper to forward errors to express error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


/**
 * GET    /robots
 * List robots with pagination
 * Query params: ?page=1&limit=20
 */
router.get("/", asyncHandler(robotsController.list));

/**
 * GET    /robots/:id
 * Get robot details
 */
router.get("/:id", asyncHandler(robotsController.get));

/**
 * PATCH  /robots/:id/status
 * Update robot status (battery, location, mode, error)
 */
router.patch("/:id/status", asyncHandler(robotsController.updateStatus));

module.exports = router;
