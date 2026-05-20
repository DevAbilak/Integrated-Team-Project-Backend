require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./config/passport");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.js");

const connectDB = require("./db/connectDB");

const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const userRoutes = require("./routes/user.routes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes");
const regionRoutes=require("./routes/regionRoutes.js");
const createTourRoutes=require("./routes/createTourRoutes.js");
const listTourRoutes=require("./routes/listToursRoutes.js");
const getTourRoutes=require("./routes/getTourRoutes.js")
const updateDeleteTour=require("./routes/updateDeleteTourRoutes.js");
const approveRejectTours=require("./routes/approveRejectTourRoutes.js")
const paymentsRoutes = require("./routes/payments.routes.js");
const loyaltyRoutes = require("./routes/loyalty.routes.js");
const referralsRoutes = require("./routes/referrals.routes.js");
const internalRoutes = require("./routes/internal.routes.js");
const hotelRoutes = require("./routes/hotel.routes.js");
const { handleStripeWebhook } = require("./controllers/payments.controller.js");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  process.env.CLIENT_URL, // production frontend URL
];

connectDB();
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Stripe webhooks require the raw body for signature verification
app.post(
  "/api/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

app.use(express.json()); // allow us to parse incoming requests: req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use(passport.initialize());

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Optional: JSON spec endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/region",regionRoutes);
app.use("/api/tours",createTourRoutes);
app.use("/api/tours",listTourRoutes);
app.use("/api.tours",getTourRoutes);
app.use("/api/tours",updateDeleteTour);
app.use("/api/admin/tours",approveRejectTours)
app.use("/api/payments", paymentsRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/referrals", referralsRoutes);
app.use("/internal", internalRoutes);
app.use("/api/hotels", hotelRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
