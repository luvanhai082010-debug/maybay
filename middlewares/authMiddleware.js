// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = global.db; 

exports.verifyAdminToken = async (req, res, next) => {
    // 1. Lấy Token từ Header
    // 2. jwt.verify(token)
    // 3. SQL Query: SELECT current_session_token FROM admins để kiểm tra tính hợp lệ
    // 4. next();
};
