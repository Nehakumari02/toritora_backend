const axios = require("axios");
const UserModel = require("../models/userModel");
const { authenticateUser } = require("../utils/authenticate");
const { getUploadUrlS3, deleteUploadedFileS3 } = require("../utils/awsS3")

const getUploadUrl = async (req, res) => {
    try {
        const { _id, email } = await authenticateUser(req,res);

        let { fileName, fileType, folderPath } = req.body;

        const fileNameWithoutSpaces = fileName.replace(/\s+/g, '').substring(0, 6);
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        fileName = `${_id}_${randomCode}_${fileNameWithoutSpaces}`;

        const {uploadUrl,fileUrl} = await getUploadUrlS3(fileName, fileType, folderPath)

        return res.status(200).json({
            message: "Link generated successfully",
            uploadUrl,
            viewUrl:fileUrl
        });

    } catch (error) {
        console.error("Error in generating link:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const deleteUploadedFile = async (req, res) => {
    try {
        // const { _id, email } = await authenticateUser(req,res);

        let { fileUrl } = req.body;

        function extractFileNameFromUrl(url) {
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            return fileName;
        }
        
        const key = extractFileNameFromUrl(fileUrl)
        await deleteUploadedFileS3(key);
        
        return res.status(200).json({
            message: "File deleted successfully",
        });

    } catch (error) {
        console.error("Error in deleting file:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getUploadUrl,
    deleteUploadedFile
};
