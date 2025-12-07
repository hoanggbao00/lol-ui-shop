-- ==========================================================
-- 1. THIẾT LẬP DATABASE (CƠ SỞ DỮ LIỆU)
-- ==========================================================
DROP DATABASE IF EXISTS lol_market_db;
CREATE DATABASE lol_market_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lol_market_db;

-- ==========================================================
-- 2. TẠO BẢNG USERS (NGƯỜI DÙNG & ADMIN)
-- ==========================================================
-- Admin hay User thường đều nằm ở đây, phân biệt bằng cột 'role'
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Lưu mật khẩu đã mã hóa (MD5/Bcrypt)
    avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
    phone VARCHAR(20),
    role ENUM('admin', 'user') DEFAULT 'user', -- Phân quyền
    
    -- Ví tiền (Cash) của user trên hệ thống
    balance DECIMAL(15, 2) DEFAULT 0, 
    
    -- Thông tin ngân hàng của User (Dùng để rút tiền về)
    bank_name VARCHAR(50),          -- VD: Techcombank
    bank_account_number VARCHAR(50), -- Số tài khoản
    bank_account_holder VARCHAR(100), -- Tên chủ thẻ
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE -- Admin có thể set FALSE để khóa acc
);

-- ==========================================================
-- 3. TẠO BẢNG WALLET_TRANSACTIONS (LỊCH SỬ NẠP/RÚT TIỀN)
-- ==========================================================
-- Quản lý dòng tiền vào (Nạp) và ra (Rút) khỏi hệ thống
CREATE TABLE WalletTransactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL, -- Số tiền nạp hoặc rút
    type ENUM('deposit', 'withdraw') NOT NULL, -- deposit: Nạp tiền, withdraw: Rút tiền
    method VARCHAR(50) NOT NULL, -- VD: "Banking", "Momo", "Card"
    
    -- Trạng thái xử lý
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    
    transaction_code VARCHAR(50), -- Mã giao dịch ngân hàng (để đối soát)
    admin_note TEXT, -- Ghi chú của Admin (VD: "Đã chuyển khoản xong")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ==========================================================
-- 4. TẠO BẢNG LOL_ACCOUNTS (TÀI KHOẢN GAME ĐANG BÁN)
-- ==========================================================
CREATE TABLE LolAccounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL, -- Người đăng bán
    
    -- Thông tin hiển thị (Public)
    title VARCHAR(255) NOT NULL, -- Tiêu đề bài đăng
    ingame_name VARCHAR(100), -- Tên nhân vật (VD: YasuoNo1 #VN2)
    rank_level VARCHAR(50), -- Rank (VD: Sắt, Đồng, Kim Cương...)
    skin_count INT DEFAULT 0, -- Số trang phục
    champ_count INT DEFAULT 0, -- Số tướng
    thumbnail_url VARCHAR(255), -- Ảnh đại diện
    description TEXT, -- Thông tin thêm (gộp content, tiêu đề phụ vào đây)
    
    -- Thông tin đăng nhập (Private - Chỉ hiện khi đã mua/thuê)
    login_username VARCHAR(100) NOT NULL, 
    login_password VARCHAR(100) NOT NULL,
    
    -- Giá cả
    buy_price DECIMAL(15, 2) DEFAULT 0, -- Giá mua đứt
    rent_price_per_hour DECIMAL(15, 2) DEFAULT 0, -- Giá thuê 1 giờ
    
    -- Trạng thái tài khoản
    status ENUM('available', 'sold', 'renting', 'hidden') DEFAULT 'available',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ==========================================================
-- 5. TẠO BẢNG ACCOUNT_IMAGES (ẢNH CHI TIẾT CỦA ACC)
-- ==========================================================
CREATE TABLE AccountImages (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES LolAccounts(account_id) ON DELETE CASCADE
);

-- ==========================================================
-- 6. TẠO BẢNG ORDERS (HÓA ĐƠN TỔNG)
-- ==========================================================
-- Lưu lịch sử khi người dùng thực hiện thanh toán mua/thuê
CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL, -- Tổng tiền thanh toán
    status ENUM('completed', 'refunded') DEFAULT 'completed', -- Trạng thái đơn
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

-- ==========================================================
-- 7. TẠO BẢNG ORDER_DETAILS (CHI TIẾT HÓA ĐƠN)
-- ==========================================================
-- Vì 1 đơn hàng có thể mua nhiều acc, hoặc vừa mua vừa thuê
CREATE TABLE OrderDetails (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    account_id INT NOT NULL,
    
    transaction_type ENUM('buy', 'rent') NOT NULL, -- Mua hay Thuê
    price DECIMAL(15, 2) NOT NULL, -- Giá tại thời điểm giao dịch
    rent_duration_hours INT DEFAULT 0, -- Số giờ thuê (nếu là rent)
    
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES LolAccounts(account_id)
);

-- ==========================================================
-- 8. TẠO BẢNG CART_ITEMS (GIỎ HÀNG)
-- ==========================================================
-- Lưu tạm các acc người dùng định mua
CREATE TABLE CartItems (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    type ENUM('buy', 'rent') NOT NULL,
    rent_duration INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES LolAccounts(account_id) ON DELETE CASCADE
);

-- ==========================================================
-- 9. DỮ LIỆU MẪU (TEST DATA)
-- ==========================================================

-- Tạo 1 Admin và 1 User
INSERT INTO Users (username, email, password_hash, role, balance) VALUES 
('admin_vip', 'admin@shop.com', 'hashed_password_123', 'admin', 0),
('khach_hang_A', 'userA@gmail.com', 'hashed_password_456', 'user', 500000);

-- Tạo lệnh nạp tiền mẫu (User A nạp 100k, đang chờ duyệt)
INSERT INTO WalletTransactions (user_id, amount, type, method, status) VALUES 
(2, 100000, 'deposit', 'Banking VCB', 'pending');

-- User A đăng bán 1 acc LOL
INSERT INTO LolAccounts (seller_id, title, ingame_name, rank_level, buy_price, login_username, login_password) VALUES 
(2, 'Acc Yasuo Ma Kiếm bao ngầu', 'Hasagi#VN', 'Platinum II', 200000, 'acc_rac_1', 'matkhau123');

-- Thêm ảnh cho acc vừa tạo (giả sử account_id là 1)
INSERT INTO AccountImages (account_id, image_url) VALUES 
(1, 'link_anh_tuong.jpg'),
(1, 'link_anh_skin.jpg');