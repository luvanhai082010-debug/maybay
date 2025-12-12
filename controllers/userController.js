// controllers/userController.js

const gameCore = require('../gameCore'); 
const db = global.db; 

// Hàm Cấp/Trừ Tiền (adjustBalance)
exports.adjustBalance = async (req, res) => {
    const targetUserId = req.params.userId;
    const { amount, adminId, reason } = req.body; 
    const amountFloat = parseFloat(amount);
    
    if (isNaN(amountFloat) || amountFloat === 0) {
        return res.status(400).json({ message: 'Số tiền không hợp lệ.' });
    }

    const client = await db.connect(); 
    try {
        await client.query('BEGIN'); // Bắt đầu Giao dịch
        
        // 1. Cập nhật Số dư
        const updateQuery = `
            UPDATE users 
            SET balance = balance + $1 
            WHERE user_id = $2
            RETURNING user_id, balance;
        `;
        const updateResult = await client.query(updateQuery, [amountFloat, targetUserId]);

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK'); 
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        
        const newBalance = updateResult.rows[0].balance;
        
        // 2. Ghi lại Lịch sử Giao dịch
        const transactionQuery = `
            INSERT INTO transactions (user_id, admin_id, amount, type, reason)
            VALUES ($1, $2, $3, $4, $5);
        `;
        const type = amountFloat > 0 ? 'ADMIN_GRANT' : 'ADMIN_DEDUCT';
        const finalReason = reason || type;
        
        await client.query(transactionQuery, [targetUserId, adminId, amountFloat, type, finalReason]);

        await client.query('COMMIT'); // Hoàn tất Giao dịch

        // 3. Thông báo Real-time (Socket.io)
        gameCore.notifyUser(targetUserId, 'user_balance_update', { newBalance: newBalance });

        return res.json({ message: 'Cập nhật số dư thành công.', newBalance });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Lỗi khi cấp tiền:", error);
        return res.status(500).json({ message: 'Lỗi máy chủ trong quá trình giao dịch.' });
    } finally {
        client.release(); 
    }
};

// Hàm Cấp/Thu hồi Tool Dự đoán (toggleToolAccess)
exports.toggleToolAccess = async (req, res) => {
    const targetUserId = req.params.userId;
    const grantStatus = req.originalUrl.includes('grant_tool'); 

    try {
        const updateQuery = 'UPDATE users SET is_tool_granted = $1 WHERE user_id = $2 RETURNING *;';
        const result = await db.query(updateQuery, [grantStatus, targetUserId]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        gameCore.notifyUser(targetUserId, 'tool_access_changed', { granted: grantStatus });
        
        return res.json({ message: `Tool access updated to ${grantStatus}.` });

    } catch (error) {
        console.error("Lỗi khi toggle tool:", error);
        return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};

// Hàm Lấy danh sách Người dùng (getUsers)
exports.getUsers = async (req, res) => {
    try {
        const query = 'SELECT user_id, username, balance, is_tool_granted FROM users ORDER BY user_id DESC';
        const result = await db.query(query);
        return res.json(result.rows);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
};
