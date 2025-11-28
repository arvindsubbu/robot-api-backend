// Simple 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ error: "Route not found" });
};

// Simple global error handler
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  // Document not found
  if (err.status === 404) {
    return res.status(404).json({ error: err.message || "Not found" });
  }

  // Default - Internal Server Error
  res.status(500).json({ error: "Something went wrong" });
};

module.exports = { notFound, errorHandler };
