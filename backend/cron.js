const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;
const Link = require('./models/Link');

// run cleanup every minute
cron.schedule('* * * * *', async() => {
    try {
        const now = new Date();

        // fetch expired links
        const expiredLinks = await Link.find({
            expiresAt: { $lte: now }
        });

        if (!expiredLinks.length) return;

        console.log(`Found ${expiredLinks.length} expired links. Cleaning up...`);

        for (const link of expiredLinks) {
            // delete file from cloudinary if applicable
            if (link.type === 'file' && link.content.includes('cloudinary.com')) {
                try {
                    const url = link.content;
                    const uploadIndex = url.indexOf('/upload/');

                    if (uploadIndex === -1) continue;

                    // extract public_id from url
                    const afterUpload = url.substring(uploadIndex + 8);
                    const parts = afterUpload.split('/');
                    parts.shift(); // remove version segment

                    const publicId = decodeURIComponent(parts.join('/'));

                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'raw'
                    });

                    console.log(`Deleted file from Cloudinary: ${publicId}`);
                } catch (cloudinaryError) {
                    console.error('Cloudinary delete failed:', cloudinaryError);
                }
            }
        }

        // remove expired records from database
        const ids = expiredLinks.map((link) => link._id);
        await Link.deleteMany({ _id: { $in: ids } });

        console.log('Database cleanup complete.');
    } catch (error) {
        console.error('Scheduled cleanup error:', error);
    }
});