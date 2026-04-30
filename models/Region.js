const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  zone: { type: String, required: true, trim: true },
  alertLevel: {
    type: String,
    enum: ["green", "yellow", "red"],
    default: "green",
  },
  alertMessage: { type: String, trim: true },
  geoCoordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: (v) => v.length === 2,
      message: "geoCoordinates must be [longitude, latitude]",
    },
  },
});

// 2d sphere index for geospatial queries
regionSchema.index({ geoCoordinates: "2dsphere" });
regionSchema.index({ name: 1 });

module.exports = mongoose.model("Region", regionSchema);
