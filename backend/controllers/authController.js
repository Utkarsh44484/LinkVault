const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async(req, res) => {
    try {
        const { username, password } = req.body;

        // check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // create a secure hash for the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // save new user in database
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        // fallback for unexpected errors
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async(req, res) => {
    try {
        const { username, password } = req.body;

        // fetch user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // compare entered password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // generate jwt for authenticated user
        const token = jwt.sign({ userId: user._id },
            process.env.JWT_SECRET, { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            username: user.username
        });
    } catch (error) {
        // handle server-side failures
        res.status(500).json({ error: 'Server error' });
    }
};