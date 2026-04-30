require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./config/passport");
const passport = require("passport");

const connectDB = require("./db/connectDB");

const authRoutes = require("./routes/auth.routes.js");
const adminRoutes = require("./routes/admin.routes.js");

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json()); // allow us to parse incoming requests: req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
