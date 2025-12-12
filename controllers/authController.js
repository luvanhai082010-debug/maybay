// controllers/authController.js

const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const db = global.db; // PostgreSQL Pool

exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Truy vấn Admin
        const query = 'SELECT admin_id, password_hash, username FROM admins WHERE username = $1';
        const result = await db.query(query, [username]);
        const adminRecord = result.rows[0];

        if (!adminRecord) {
            return res.status(401).json({ message: 'Tên đăng nhập không đúng.' });
        }

        // 2. Xác minh Mật khẩu
        const isPasswordValid = await bcrypt.compare(password, adminRecord.password_hash); 
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không đúng.' });
        }

        // 3. Tạo Token và Cập nhật Token Phiên mới
        const sessionToken = jwt.sign(
            { id: adminRecord.username, role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' } 
        );

        const updateQuery = 'UPDATE admins SET current_session_token = $1 WHERE admin_id = $2';
        await db.query(updateQuery, [sessionToken, adminRecord.admin_id]);

        res.json({ message: 'Đăng nhập Admin thành công.', token: sessionToken });

    } catch (error) {
        console.error("Lỗi đăng nhập Admin:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};
