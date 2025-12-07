-- ==========================================================
-- 1. THIẾT LẬP DATABASE
-- ==========================================================
DROP DATABASE IF EXISTS lol_market_db;
CREATE DATABASE lol_market_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lol_market_db;

-- ==========================================================
-- 2. TẠO BẢNG USERS (NGƯỜI DÙNG & ADMIN)
-- ==========================================================
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
    phone VARCHAR(20),
    role ENUM('admin', 'user') DEFAULT 'user',
    
    -- Ví tiền & Ngân hàng
    balance DECIMAL(15, 2) DEFAULT 0, 
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==========================================================
-- 3. TẠO BẢNG WALLET_TRANSACTIONS (NẠP/RÚT TIỀN)
-- ==========================================================
CREATE TABLE WalletTransactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('deposit', 'withdraw') NOT NULL,
    method VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    transaction_code VARCHAR(50),
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ==========================================================
-- 4. TẠO BẢNG LOL_ACCOUNTS (TÀI KHOẢN GAME)
-- ==========================================================
CREATE TABLE LolAccounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL, -- [REQUIRED]
    
    -- --- THÔNG TIN BẮT BUỘC (REQUIRED) ---
    title VARCHAR(255) NOT NULL,        -- [REQUIRED] Tiêu đề
    level INT NOT NULL,                 -- [REQUIRED] Level game
    thumbnail_url VARCHAR(255) NOT NULL,-- [REQUIRED] Ảnh hiển thị
    
    -- --- THÔNG TIN CÓ THỂ BỎ TRỐNG (NULLABLE) ---
    ingame_name VARCHAR(100) NULL,      -- Tên nhân vật
    description TEXT NULL,              -- Mô tả (gộp chung)
    server VARCHAR(50) NULL,
    region VARCHAR(50) NULL,
    avatar_url VARCHAR(255) NULL,       -- Ảnh avatar ingame
    
    -- Stats (Mặc định null)
    champ_count INT NULL,
    skin_count INT NULL,
    blue_essence INT NULL,
    orange_essence INT NULL,
    rp INT NULL,
    honor_level INT NULL,
    mastery_points INT NULL,
    
    -- Rank Solo (Mặc định null)
    solo_rank VARCHAR(50) NULL,
    solo_division VARCHAR(10) NULL,
    solo_lp INT NULL,
    solo_wins INT NULL,
    
    -- Rank Flex (Mặc định null)
    flex_rank VARCHAR(50) NULL,
    flex_division VARCHAR(10) NULL,
    flex_lp INT NULL,
    flex_wins INT NULL,
    
    -- Rank TFT (Mặc định null)
    tft_rank VARCHAR(50) NULL,
    tft_division VARCHAR(10) NULL,
    tft_lp INT NULL,
    tft_wins INT NULL,

    -- Thông tin đăng nhập (Ẩn, Nullable)
    login_username VARCHAR(100) NULL, 
    login_password VARCHAR(100) NULL,
    
    -- Giá cả (Nullable - cho phép dạng "Liên hệ")
    buy_price DECIMAL(15, 2) NULL,
    rent_price_per_hour DECIMAL(15, 2) NULL,
    
    -- Trạng thái & Meta
    status ENUM('available', 'sold', 'renting', 'hidden') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ==========================================================
-- 6. TẠO BẢNG ORDERS (HÓA ĐƠN TỔNG)
-- ==========================================================
CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    -- Status khớp với TypeScript: pending, paid, renting, completed, refunded, cancelled
    status ENUM('pending', 'paid', 'renting', 'completed', 'refunded', 'cancelled') DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

-- ==========================================================
-- 7. TẠO BẢNG ORDER_DETAILS (CHI TIẾT ĐƠN HÀNG)
-- ==========================================================
CREATE TABLE OrderDetails (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    account_id INT NOT NULL,
    
    transaction_type ENUM('purchase', 'rent') NOT NULL, -- Mua đứt hoặc Thuê
    price DECIMAL(15, 2) NOT NULL, -- Giá tại thời điểm giao dịch
    rent_duration_hours INT DEFAULT 0, -- Số giờ thuê
    rent_end_date TIMESTAMP NULL, -- [NEW] Thời điểm hết hạn thuê
    
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES LolAccounts(account_id)
);

-- ==========================================================
-- 8. TẠO BẢNG CART_ITEMS (GIỎ HÀNG)
-- ==========================================================
CREATE TABLE CartItems (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    type ENUM('purchase', 'rent') NOT NULL,
    rent_duration INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES LolAccounts(account_id) ON DELETE CASCADE
);