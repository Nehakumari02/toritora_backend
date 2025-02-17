import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ 
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    }
});

async function getUploadUrl(fileName, fileType, folderPath) {
    try {
      const key = `${folderPath}/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        ACL: "public-read",
      });
  
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 5 });
  
      return {
        uploadUrl: signedUrl,
        fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
}

async function deleteUploadedFile(key) {
    try {
        const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        });
        await s3Client.send(command);
        console.log("File deleted successfully.");
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

module.exports = { getUploadUrl, deleteUploadedFile };
