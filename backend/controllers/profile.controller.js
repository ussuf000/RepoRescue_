import userModel from '../model/user.model.js';

const safeProfile = user => ({ id: user._id, username: user.username, email: user.email, createdAt: user.createdAt });
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function getProfile(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select('username email createdAt');
        if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
        return res.status(200).json({ success: true, user: safeProfile(user) });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
}

export async function updateProfile(req, res) {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (username.length < 2 || username.length > 80 || !validEmail(email) || email.length > 254) {
        return res.status(400).json({ success: false, message: 'Provide a name between 2 and 80 characters and a valid email address' });
    }
    try {
        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { $set: { username, email } },
            { new: true, runValidators: true }
        ).select('username email createdAt');
        if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
        return res.status(200).json({ success: true, user: safeProfile(user) });
    } catch (error) {
        if (error?.code === 11000) return res.status(409).json({ success: false, message: 'That email address is already in use' });
        console.error('Profile update error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
}
