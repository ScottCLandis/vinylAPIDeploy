var express = require("express");
var router = express.Router();

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const { r2 } = require("../r2Client");

// ---- CONFIG ----
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function isValidImageContentType(value) {
  return typeof value === "string" && value.startsWith("image/");
}

function normalizeExtFromContentType(contentType) {
  if (typeof contentType !== "string") return "jpg";
  const ct = contentType.toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("heic") || ct.includes("heif")) return "heic";
  return "jpg";
}

router.post("/sign-upload", async function (req, res) {
  try {
    const { contentType, ext, fileSize } = req.body || {};

    // --- Content type ---
    const safeContentType = isValidImageContentType(contentType)
      ? contentType
      : "image/jpeg";

    // --- File size gate (client-provided) ---
    const sizeNum =
      typeof fileSize === "number"
        ? fileSize
        : typeof fileSize === "string"
        ? Number(fileSize)
        : NaN;

    if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
      return res.status(400).json({
        error:
          "Missing or invalid fileSize. Provide fileSize in bytes when requesting a signed upload URL.",
      });
    }

    if (sizeNum > MAX_BYTES) {
      return res.status(413).json({
        error: `File too large. Max allowed is ${MAX_BYTES} bytes.`,
        maxBytes: MAX_BYTES,
      });
    }

    // --- Extension ---
    const safeExt =
      typeof ext === "string" && /^[a-z0-9]+$/i.test(ext)
        ? ext.toLowerCase()
        : normalizeExtFromContentType(safeContentType);

    // --- Key ---
    const id = crypto.randomUUID(); // ✅ no uuid package needed
    const key = `covers/${id}.${safeExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: safeContentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

    const base = String(process.env.R2_PUBLIC_BASE_URL || "").replace(
      /\/$/,
      ""
    );
    if (!base) {
      return res.status(500).json({ error: "R2_PUBLIC_BASE_URL is not set" });
    }

    const publicUrl = `${base}/${key}`;

    return res.json({ key, uploadUrl, publicUrl, maxBytes: MAX_BYTES });
  } catch (err) {
    console.error("❌ R2 sign-upload error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create signed upload URL" });
  }
});

module.exports = router;
