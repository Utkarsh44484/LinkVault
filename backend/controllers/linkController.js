const Link = require('../models/Link');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// generate random short id
const generateShortId = (length = 6) => {
    return crypto
        .randomBytes(length)
        .toString('base64')
        .replace(/\W/g, '')
        .substring(0, length);
};

// CREATE LINK
exports.createLink = async(req, res) => {
    try {
        // extract inputs
        let { content, type, expiresIn, expiresAt, password, maxViews } = req.body;
        let originalName = null;

        // handle file upload
        if (req.file) {
            content = req.file.path || req.file.secure_url;
            originalName = req.file.originalname;
            type = 'file';
        }

        // basic validations
        if (!content) {
            return res.status(400).json({ error: 'Content required' });
        }

        if (maxViews && parseInt(maxViews) < 1) {
            return res.status(400).json({ error: 'Max views must be at least 1' });
        }

        // hash password if provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const shortId = generateShortId();

        // calculate expiry
        let finalExpiryDate;

        if (expiresAt) {
            // custom expiry date
            finalExpiryDate = new Date(expiresAt);

            if (finalExpiryDate <= new Date()) {
                return res.status(400).json({ error: 'Expiration date must be in the future' });
            }
        } else {
            // duration-based expiry
            const duration = expiresIn ? parseInt(expiresIn) : 10;
            finalExpiryDate = new Date(Date.now() + duration * 60 * 1000);
        }

        // attach owner if logged in
        const ownerId = req.user ? req.user.userId : null;

        const newLink = new Link({
            shortId,
            type,
            content,
            originalName,
            expiresAt: finalExpiryDate,
            password: hashedPassword,
            maxViews: maxViews ? parseInt(maxViews) : null,
            owner: ownerId
        });

        await newLink.save();

        res.status(201).json({
            success: true,
            linkId: shortId,
            expiresAt: finalExpiryDate,
            message: 'Link created.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// GET LINK
exports.getLink = async(req, res) => {
    try {
        const { shortId } = req.params;
        const { password } = req.body;

        // fetch link
        const link = await Link.findOne({ shortId });
        if (!link) {
            return res.status(403).json({ error: 'Access Denied (Link invalid or expired)' });
        }

        // check expiry
        if (link.expiresAt && new Date() > link.expiresAt) {
            return res.status(403).json({ error: 'Access Denied (Link expired)' });
        }

        // check view limit
        if (link.maxViews && link.viewCount >= link.maxViews) {
            return res.status(403).json({ error: 'Access Denied (View limit reached)' });
        }

        // handle password protection
        if (link.password) {
            if (!password) {
                return res.status(401).json({ protected: true, error: 'Password required' });
            }

            const isMatch = await bcrypt.compare(password, link.password);
            if (!isMatch) {
                return res.status(401).json({ protected: true, error: 'Incorrect password' });
            }
        }

        // increment view count
        link.viewCount += 1;
        await link.save();

        res.json({
            success: true,
            type: link.type,
            content: link.content,
            originalName: link.originalName,
            createdAt: link.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// GET USER DASHBOARD LINKS
exports.getUserLinks = async(req, res) => {
    try {
        // fetch links owned by user
        const links = await Link.find({ owner: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, links });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// DELETE LINK
exports.deleteLink = async(req, res) => {
    try {
        const { shortId } = req.params;

        // find link
        const link = await Link.findOne({ shortId });
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        // verify ownership
        if (String(link.owner) !== String(req.user.userId)) {
            return res.status(403).json({ error: 'Unauthorized to delete this link' });
        }

        await Link.deleteOne({ shortId });

        res.json({
            success: true,
            message: 'Link permanently deleted'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};