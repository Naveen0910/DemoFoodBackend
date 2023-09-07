import path from "path";
import express from "express";
import multer from "multer";

/* Code Handles images with Multer Configuration only and sering user from Own Server */

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/public");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      res.status(400).send({ message: err.message });
    }

    res.status(200).send({
      image: `/${req.file.path}`,
    });
  });
});

export default router;

/* Code For Uploading Images and sending it through S3 */

// import { uploadFile } from "./s3.js";
// import {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
// } from "@aws-sdk/client-s3";
// import dotenv from "dotenv";
// import crypto from "crypto";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION;
// const accessKey = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: accessKey,
//     secretAccessKey: secretAccessKey,
//   },
//   region: bucketRegion,
// });

// const randomNamesGenerator = (bytes = 16) =>
//   crypto.randomBytes(bytes).toString("hex");

// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router.post("/", upload.single("image"), async (req, res) => {
//   const generatedRandomName = randomNamesGenerator();
//   const params = {
//     Bucket: bucketName,
//     Key: generatedRandomName,
//     Body: req.file.buffer,
//     ContentType: req.file.mimetype,
//   };
//   const command = new PutObjectCommand(params);
//   await s3.send(command);
//   const getObjectParams = {
//     Bucket: bucketName,
//     Key: generatedRandomName,
//   };
//   const commandUrl = new GetObjectCommand(getObjectParams);
//   const url = await getSignedUrl(s3, commandUrl);
//   res.json(url);
// });

// export default router;
