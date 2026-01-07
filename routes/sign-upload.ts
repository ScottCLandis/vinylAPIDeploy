import express from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { r2 } from "./r2Client";

const router = express.Router();

router.post("/storage/sign-upload", async (req, res) => {
  try {
    const { contentType, ext } = req.body as {
      contentType?: string;
      ext?: string;
    };

    // Basic validation
    const safeContentType =
      typeof contentType === "string" && contentType.startsWith("image/")
        ? contentType
        : "image/jpeg";

    const safeExt =
      typeof ext === "string" && /^[a-z0-9]+$/i.test(ext) ? ext : "jpg";

    const key = `covers/${uuidv4()}.${safeExt}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: safeContentType,
      // If your bucket is public you can optionally set ACL, but R2 often ignores ACLs.
      // Prefer bucket/public domain configuration instead.
    });

    const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 60 }); // seconds

    const publicBase = process.env.R2_PUBLIC_BASE_URL!;
    const publicUrl = `${publicBase.replace(/\/$/, "")}/${key}`;

    res.json({ key, uploadUrl, publicUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create signed upload URL" });
  }
});

export default router;
