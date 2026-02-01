// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, rank: user.rank }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, rank: user.rank } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ success: true, id: user.id, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create crew member" });
  }
};

// Add this if you want the tablet PIN verification
exports.verifyCrew = async (req, res) => {
  const { employeeId, pin } = req.body;
  try {
    const user = await User.findOne({ where: { employeeId } });
    if (!user) return res.status(404).json({ error: "Crew not found" });
    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) return res.status(401).json({ error: "Invalid PIN" });
    res.json({ success: true, user: { id: user.id, name: user.name, rank: user.rank } });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};