// controllers/authController.js

const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const db = global.db; 

exports.adminLogin = async (req, res) => {
    // 1. SQL SELECT admin_id, password_hash
    // 2. bcrypt.compare(password, password_hash)
    // 3. Tạo Token JWT mới
    // 4. SQL UPDATE current_session_token
    // 5. Trả về res.json({ token: sessionToken });
};
