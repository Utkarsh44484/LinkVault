const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const linkController = require('../controllers/linkController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// cloudinary-backed multer storage

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async(req, file) => {
        // 1. Keep the exact original name WITH the extension (.pdf, .docx, etc.)
        const cleanFileName = file.originalname.replace(/\s+/g, '_');

        return {
            folder: 'linkvault',
            // This stops Cloudinary from corrupting PDFs/Docs!
            resource_type: 'raw',
            public_id: `${Date.now()}-${cleanFileName}`
        };
    }
});

//this do not preserve the file type
// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'linkvault_uploads',
//         resource_type: 'raw'
//     }
// });

// multer config with limits and filtering
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        // allowed mime types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'text/plain',
            'application/msword', // For older .doc files
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // For modern .docx files (Word & Google Docs exports)
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, PDF, TXT, and Word Docs are allowed.'));
        }
    }
});

// upload link (guest or logged-in)
router.post('/upload', optionalAuth, upload.single('file'), linkController.createLink);

// view link (public, password handled inside controller)
router.post('/:shortId', linkController.getLink);

// user dashboard links
router.get('/user/dashboard', requireAuth, linkController.getUserLinks);

// delete link
router.delete('/:shortId', requireAuth, linkController.deleteLink);

module.exports = router;