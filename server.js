// server.js

require('dotenv').config(); 
const PORT = process.env.PORT || 3000;
const express = require('express');
const http = require('http');
const { Pool } = require('pg'); 
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); 

// 1. Thiết lập PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect().then(client => {
    console.log('✅ Kết nối PostgreSQL thành công');
    client.release(); 
}).catch(err => console.error('❌ Lỗi kết nối PostgreSQL:', err));

// 2. Global Exports và Middlewares
global.db = pool; 
global.io = io;
app.use(express.json());

// 3. Kết nối Routes và Game Logic
const gameCore = require('./gameCore'); 
const adminRoutes = require('./routes/adminRoutes');
const gameRoutes = require('./routes/gameRoutes'); 

app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

gameCore.initializeGame(); 

// 4. Khởi động Server
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
