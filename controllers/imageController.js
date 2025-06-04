const axios = require("axios");
const UserModel = require("../models/userModel");
const { authenticateUser } = require("../utils/authenticate");
const { getUploadUrlS3, deleteUploadedFileS3 } = require("../utils/awsS3");
const { getUploadUrlGCP, deleteUploadedFileGCP } = require("../utils/gcpBucket");

// GCP upload url function
const getUploadUrl = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req, res);

        let { fileName, fileType, folderPath } = req.body;

        const fileNameWithoutSpaces = fileName.replace(/\s+/g, '').substring(0, 6);
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        fileName = `${_id}_${randomCode}_${fileNameWithoutSpaces}`;

        // const { uploadUrl, fileUrl } = await getUploadUrlS3(fileName, fileType, folderPath)
        const { uploadUrl, fileUrl } = await getUploadUrlGCP(fileName, fileType, folderPath)

        return res.status(200).json({
            message: "Link generated successfully",
            uploadUrl,
            viewUrl: fileUrl
        });

    } catch (error) {
        console.error("Error in generating link:", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

// S3 upload url function
// const getUploadUrl = async (req, res) => {
//     try {
//         const { _id, email } = await authenticateUser(req, res);

//         let { fileName, fileType, folderPath } = req.body;

//         const fileNameWithoutSpaces = fileName.replace(/\s+/g, '').substring(0, 6);
//         const randomCode = Math.floor(100000 + Math.random() * 900000);
//         fileName = `${_id}_${randomCode}_${fileNameWithoutSpaces}`;

//         const { uploadUrl, fileUrl } = await getUploadUrlS3(fileName, fileType, folderPath)

//         return res.status(200).json({
//             message: "Link generated successfully",
//             uploadUrl,
//             viewUrl: fileUrl
//         });

//     } catch (error) {
//         console.error("Error in generating link:", error.message);
//         const statusCode = error.statusCode || 500;
//         return res.status(statusCode).json({
//             message: statusCode === 401 ? "Unauthorized" : "Internal server error",
//             error: error.message
//         });
//     }
// };

// GCP delete file function
const deleteUploadedFile = async (req, res) => {
    try {
        // const { _id, email } = await authenticateUser(req,res);

        let { fileUrl } = req.body;
        // uncomment below key and delete file s3 function and comment bucket url prefic key and delete file gcp
        // const key = fileUrl.split('amazonaws.com/')[1]

        const bucketUrlPrefix = `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME}/`;
        const key = fileUrl.replace(bucketUrlPrefix, '');


        // await deleteUploadedFileS3(key);
        await deleteUploadedFileGCP(key);

        return res.status(200).json({
            message: "File deleted successfully",
        });

    } catch (error) {
        console.error("Error in deleting file:", error.message);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: statusCode === 401 ? "Unauthorized" : "Internal server error",
            error: error.message
        });
    }
};

// S3 delete file function
// const deleteUploadedFile = async (req, res) => {
//     try {
//         // const { _id, email } = await authenticateUser(req,res);

//         let { fileUrl } = req.body;
//         const key = fileUrl.split('amazonaws.com/')[1]


//         await deleteUploadedFileS3(key);

//         return res.status(200).json({
//             message: "File deleted successfully",
//         });

//     } catch (error) {
//         console.error("Error in deleting file:", error.message);
//         const statusCode = error.statusCode || 500;
//         return res.status(statusCode).json({
//             message: statusCode === 401 ? "Unauthorized" : "Internal server error",
//             error: error.message
//         });
//     }
// };

module.exports = {
    getUploadUrl,
    deleteUploadedFile
};
