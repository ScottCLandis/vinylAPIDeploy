var express = require("express");
var router = express.Router();

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const { r2 } = require("../r2Client");

router.post("/sign-uploads", async function (req, res) {
  try {
    const { contentType, ext } = req.body || {};

    const safeContentType =
      typeof contentType === "string" && contentType.startsWith("image/")
        ? contentType
        : "image/jpeg";

    const safeExt =
      typeof ext === "string" && /^[a-z0-9]+$/i.test(ext) ? ext : "jpg";

    const key = `covers/${uuidv4()}.${safeExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: safeContentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

    const base = process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
    const publicUrl = `${base}/${key}`;

    res.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("R2 sign-upload error:", err);
    res.status(500).json({ error: "Failed to sign upload URL" });
  }
});

module.exports = router;
