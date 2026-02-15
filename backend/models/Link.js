const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    // unique short identifier
    shortId: { type: String, required: true, unique: true },

    // content type (text or file)
    type: { type: String, enum: ['text', 'file'], required: true },

    // actual stored content or file url
    content: { type: String, required: true },

    // original file name (only for files)
    originalName: { type: String },

    // creation timestamp
    createdAt: { type: Date, default: Date.now },

    // expiration timestamp
    expiresAt: { type: Date, required: true },

    // optional password hash
    password: { type: String },

    // number of times link was accessed
    viewCount: { type: Number, default: 0 },

    // max allowed views
    maxViews: { type: Number },

    // link owner (null for guests)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

// auto-delete document after expiry
// LinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Link', LinkSchema);