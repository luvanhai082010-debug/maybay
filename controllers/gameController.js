// controllers/gameController.js

const db = global.db;
const globalState = require('../gameCore').globalState; 

exports.placeBet = async (req, res) => {
    // 1. Kiểm tra trạng thái: if (globalState.state !== 'PREPARING')
    // 2. SQL Transaction: Trừ tiền (UPDATE users SET balance...) và Ghi log BET
    // 3. Thêm cược vào globalState.bets
};

exports.cashout = async (req, res) => {
    // 1. Kiểm tra trạng thái: if (globalState.state !== 'RUNNING')
    // 2. Tính toán Payout = betAmount * currentMultiplier
    // 3. SQL Transaction: Cộng tiền (UPDATE users SET balance...) và Ghi log WIN_PAYOUT
    // 4. Loại bỏ cược khỏi danh sách chờ rút tiền
};

exports.getCurrentRoundInfo = (req, res) => {
    // 1. Trả về globalState.serverSeedHash, state, countdown
};
