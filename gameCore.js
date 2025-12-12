// gameCore.js

const provablyFair = require('./utils/provablyFair'); 
const io = global.io;
// ... (Khai báo globalState, userSocketMap)

exports.initializeGame = () => {
    // 1. Logic Socket.io (io.on('connection'), 'auth_user', 'disconnect')
    // ...
    startNewRound();
};

function startNewRound() {
    // 1. Reset trạng thái
    // 2. Tính toán serverSeed, serverSeedHash, crashMultiplier
    // 3. io.emit('round_status', { state: 'PREPARING', countdown: 10, hash: ... });
    // 4. Bắt đầu đếm ngược 10s -> Chuyển sang runGame()
}

function runGame() {
    // 1. globalState.state = 'RUNNING'
    // 2. setInterval (60 lần/giây)
    // 3. Tính currentMultiplier (Hàm mũ)
    // 4. io.emit('multiplier_update', currentMultiplier);
    // 5. Kiểm tra và xử lý Auto-Cashout
    // 6. Nếu currentMultiplier >= crashMultiplier -> handleCrash()
}

function handleCrash() {
    // 1. globalState.state = 'CRASHED'
    // 2. Xử lý thua cược, thanh toán thắng
    // 3. io.emit('round_status', { crashPoint, serverSeed }); // Công bố Seed Gốc
    // 4. setTimeout(startNewRound, 3000);
}

exports.notifyUser = (userId, eventName, data) => { /* Logic gửi Socket.io riêng tới 1 user */ };
exports.globalState = globalState;
