// controllers/gameController.js

const db = global.db;
const globalState = require('../gameCore').globalState; 

// Hàm Xử lý Đặt cược
exports.placeBet = async (req, res) => {
    const { betAmount, autoCashoutMultiplier, clientSeed } = req.body; 
    const userId = req.userId; 

    if (globalState.state !== 'PREPARING') {
        return res.status(400).json({ message: 'Không thể đặt cược lúc này.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Trừ tiền (Kiểm tra số dư và Khóa hàng FOR UPDATE)
        const userQuery = 'SELECT balance FROM users WHERE user_id = $1 FOR UPDATE'; 
        const userResult = await client.query(userQuery, [userId]);
        
        if (userResult.rows[0].balance < betAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Số dư không đủ.' });
        }
        
        const updateBalanceQuery = 'UPDATE users SET balance = balance - $1 WHERE user_id = $2 RETURNING balance';
        const updatedBalanceResult = await client.query(updateBalanceQuery, [betAmount, userId]);
        const newBalance = updatedBalanceResult.rows[0].balance;

        // 2. Ghi log Giao dịch (type: 'BET')
        const transactionQuery = `INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, 'BET', 'Đặt cược vòng ' || $3);`;
        await client.query(transactionQuery, [userId, -betAmount, globalState.roundId]);

        await client.query('COMMIT');
        
        // 3. Thêm cược vào vòng chơi hiện tại (In-Memory)
        globalState.bets.push({ user_id: userId, bet_amount: betAmount, auto_cashout: autoCashoutMultiplier, client_seed: clientSeed, has_cashed_out: false });

        global.io.emit('new_bet_placed', { userId, betAmount });

        return res.json({ message: 'Đặt cược thành công.', newBalance });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi xử lý đặt cược:", error);
        return res.status(500).json({ message: 'Lỗi máy chủ.' });
    } finally {
        client.release();
    }
};

// Hàm Xử lý Rút tiền (Cashout)
exports.cashout = async (req, res) => {
    const userId = req.userId;
    
    if (globalState.state !== 'RUNNING') {
        return res.status(400).json({ message: 'Chỉ có thể rút tiền khi vòng đang chạy.' });
    }

    const userBetIndex = globalState.bets.findIndex(b => b.user_id === userId && !b.has_cashed_out);
    if (userBetIndex === -1) {
        return res.status(400).json({ message: 'Bạn chưa đặt cược hoặc đã rút tiền rồi.' });
    }

    const bet = globalState.bets[userBetIndex];
    const currentMultiplier = globalState.currentMultiplier;
    const payoutAmount = parseFloat((bet.bet_amount * currentMultiplier).toFixed(2));
    const profit = payoutAmount - bet.bet_amount;

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Cộng tiền thắng (Payout Amount)
        const updateBalanceQuery = 'UPDATE users SET balance = balance + $1 WHERE user_id = $2 RETURNING balance';
        const updatedBalanceResult = await client.query(updateBalanceQuery, [payoutAmount, userId]);
        
        // 2. Ghi log Giao dịch (type: 'WIN_PAYOUT')
        const transactionQuery = `INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, 'WIN_PAYOUT', 'Rút tiền @ ' || $3 || 'x');`;
        await client.query(transactionQuery, [userId, profit, currentMultiplier.toFixed(2)]); 

        await client.query('COMMIT');

        // 3. Đánh dấu đã rút tiền (In-Memory)
        globalState.bets[userBetIndex].has_cashed_out = true;
        globalState.bets[userBetIndex].cashout_multiplier = currentMultiplier;

        global.io.emit('user_cashed_out', { userId, multiplier: currentMultiplier.toFixed(2), winnings: payoutAmount.toFixed(2) });
        gameCore.notifyUser(userId, 'user_balance_update', { newBalance: updatedBalanceResult.rows[0].balance });

        return res.json({ message: 'Rút tiền thành công.', multiplier: currentMultiplier.toFixed(2), winnings: payoutAmount.toFixed(2) });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Lỗi khi xử lý rút tiền:", error);
        return res.status(500).json({ message: 'Lỗi máy chủ.' });
    } finally {
        client.release();
    }
};

exports.getCurrentRoundInfo = (req, res) => {
    return res.json({ 
        state: globalState.state,
        server_seed_hash: globalState.serverSeedHash,
        countdown: globalState.countdown,
        current_multiplier: globalState.currentMultiplier
    });
};
