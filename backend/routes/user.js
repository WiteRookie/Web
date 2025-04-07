const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../helpers/db.js');
const router = express.Router();

router.post('/register', async (req, res) => {

    try {
        const { name, email, password } = req.body;
        if (!name) {
            return res.status(400).json({ status: 400, message: 'Name field is required.' });
        }
        if (!email) {
            return res.status(400).json({ status: 400, message: 'Email field is required.' });
        }
        if (!password) {
            return res.status(400).json({ status: 400, message: 'Password field is required.' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            return res.status(400).json({ status: 400, message: 'User already exists. Please go to the login page.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertData = await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]);

        return res.status(201).json({ status: 201, message: 'User registered successfully', userId: insertData.rows[0].id });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ status: 400, message: 'Email field is required.' });
        }
        if (!password) {
            return res.status(400).json({ status: 400, message: 'Password field is required.' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ status: 400, message: 'User not found. Please register.' });
        }

        const user = result.rows[0];
        const verifyPassowrd = await bcrypt.compare(password, user.password);
        if (!verifyPassowrd) {
            return res.status(400).json({ status: 400, message: 'Incorrect password.' });
        }
        return res.status(200).json({
            status: 200,
            message: 'Login successful',
            userId: user.id,
            name: user.name
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});

module.exports = router;
