import userModel from '../model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const cookieOptionsFor = req => {
    const crossSiteFrontend = req.get('origin') === 'https://ussuf000.github.io';
    return {
        httpOnly: true,
        sameSite: crossSiteFrontend ? 'none' : 'lax',
        secure: crossSiteFrontend || process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
};

const publicUser = user => ({ id: user._id, username: user.username, email: user.email, createdAt: user.createdAt });
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function userRegister(req, res) {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;
    if (username.length < 2 || username.length > 80 || !validEmail(email) || typeof password !== 'string' || password.length < 6 || password.length > 128) {
        return res.status(400).json({ success: false, message: 'Provide a valid name, email address, and password (6–128 characters)' });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        const user = await userModel.create({ username, email, password: await bcrypt.hash(password, 10) });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, cookieOptionsFor(req));
        return res.status(201).json({ success: true, message: 'Registration successful', user: publicUser(user) });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Registration failed' });
    }
}

export async function userLogin(req, res) {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;
    if (!validEmail(email) || typeof password !== 'string' || !password.length || password.length > 128) {
        return res.status(400).json({ success: false, message: 'Provide a valid email address and password' });
    }
    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, cookieOptionsFor(req));
        return res.status(200).json({ success: true, message: 'Login successful', user: publicUser(user) });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
}

export function userLogout(req, res) {
    const { maxAge, ...clearOptions } = cookieOptionsFor(req);
    res.clearCookie('token', clearOptions);
    return res.status(200).json({ success: true, message: 'Logout successful' });
}
