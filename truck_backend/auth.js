// truck_backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Users with updated password hashes that properly work with "admin123" and "driver123"
const users = [
  { 
    id: 1, 
    username: 'admin', 
    // Updated hash for "admin123"
    password: '$2b$10$bxwZwDY7ACa0VU74pVU7Reg6ZEIedl9HLTB6zQDJ01yTHzChDVqZS', 
    role: 'owner' 
  },
  { 
    id: 2, 
    username: 'driver1', 
    // Updated hash for "driver123"
    password: '$2b$10$Q/Y/BGLo7PzZDdY29O8e4O7MBUjlCs5.7yc4v88jkhZ4KMd83kdJi', 
    role: 'driver' 
  }
];

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt received for username:', username);
    console.log('Password received:', password); // Log the password for debugging (remove in production)
    
    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', user.username);
    
    // Check password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token with role information
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Login successful for user:', username, 'with role:', user.role);
    
    // Return the token and role
    res.json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
