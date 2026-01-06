const express = require("express");
const authMiddleware = require("./middlewares/auth.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const errorHandler = require("./middlewares/error.middleware");
const reviewRoutes = require("./modules/reviews/review.routes");
const placeRoutes = require("./modules/places/place.routes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use(authMiddleware);

app.use("/reviews", reviewRoutes);

app.use("/places", placeRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", user: req.user });
});


app.use(errorHandler);
module.exports = app;