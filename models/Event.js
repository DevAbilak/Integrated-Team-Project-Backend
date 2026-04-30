const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
    required: true,
  },
  description: { type: String, required: true, trim: true },
  relatedPackageIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "TourPackage" },
  ],
});

eventSchema.index({ date: 1 });
eventSchema.index({ regionId: 1 });

module.exports = mongoose.model("Event", eventSchema);
