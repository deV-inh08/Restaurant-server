import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import envConfig from "@/config/config";

const clientS3 = new S3Client({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: envConfig.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: envConfig.AWS_BUCKET_SECRET_KEY
  }
})

export {
  clientS3,
  PutObjectCommand
} 