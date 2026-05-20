const Media = require("../models/Media-model");
const { uploadMediaToCloudinary } = require("./cloudinary");

const uploadMedia = async (file, userId) => {
  console.log("Starting media upload");

  if (!file) {
    throw new Error("No file found. Please add a file and try again.");
  }

  const { originalname, mimetype, buffer } = file;

  console.log(`File details: name=${originalname}, type=${mimetype}`);
  console.log("Upload to Cloudinary starting...");

  // Upload to Cloudinary (assuming this function returns { public_id, secure_url })
  const cloudinaryUploadResult = await uploadMediaToCloudinary(file);
  console.log(
    `Cloudinary upload successful. Public ID: ${cloudinaryUploadResult.public_id}`,
  );

  // Save media metadata to database
  const newlyCreatedMedia = new Media({
    publicId: cloudinaryUploadResult.public_id,
    originalName: originalname,
    mimeType: mimetype,
    url: cloudinaryUploadResult.secure_url,
    userId,
  });

  await newlyCreatedMedia.save();

  console.log(`Media saved to database with ID: ${newlyCreatedMedia._id}`);

  return {
    mediaId: newlyCreatedMedia._id,
    url: newlyCreatedMedia.url,
    publicId: newlyCreatedMedia.publicId,
  };
};

module.exports = { uploadMedia };
