// truck_backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Sample users - in a real app, these would come from a database
const users = [
  { id: 1, username: 'admin', password: '$2a$10$fYYndJJSHlV0X8MtFfDzEuVK/DeZ8rms9HktGAU8aPScGG4BfYOlO', role: 'owner' },
  { id: 2, username: 'driver1', password: '$2a$10$fYYndJJSHlV0X8MtFfDzEuVK/DeZ8rms9HktGAU8aPScGG4BfYOlO', role: 'driver' }
];

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password (using bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token with role information
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return the token and role
    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
