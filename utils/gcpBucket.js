const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize GCP Storage client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: path.join(__dirname, 'gcp.json'), // Adjust as needed
});

// Bucket reference
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// Function to generate signed upload URL
async function getUploadUrlGCP(fileName, fileType, folderPath) {
  try {
    const filePath = `${folderPath}/${fileName}`;
    const file = bucket.file(filePath);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 5 * 60 * 1000,
      contentType: fileType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return {
      uploadUrl,
      fileUrl: publicUrl,
    };
  } catch (error) {
    console.error('Error generating GCP upload URL:', error);
    throw error;
  }
}

// Function to delete a file from GCP Storage
async function deleteUploadedFileGCP(key) {
  try {
    const file = bucket.file(key);
    await file.delete();
    console.log(`File deleted from GCP: ${key}`);
  } catch (error) {
    console.error('Error deleting file from GCP:', error);
  }
}

module.exports = { getUploadUrlGCP, deleteUploadedFileGCP };
