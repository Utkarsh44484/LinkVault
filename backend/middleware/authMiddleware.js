const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
    // extract bearer token
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;

    // block unauthenticated requests
    if (!token) {
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    try {
        // verify token and attach user data
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // invalid or expired token
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

// OPTIONAL AUTH
exports.optionalAuth = (req, res, next) => {
    // extract bearer token if present
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (token) {
        try {
            // attach user info if token is valid
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // ignore errors and continue as guest
        }
    }

    next();
};