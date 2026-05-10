const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const getUploadUrl = async (key, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: 'video/mp4',
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

const getDownloadUrl = async (key, expiresIn = 604800) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = { getUploadUrl, getDownloadUrl };
