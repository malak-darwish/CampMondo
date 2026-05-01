CREATE DATABASE IF NOT EXISTS campmondo;
USE campmondo;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('parent','staff','admin') NOT NULL DEFAULT 'parent',
    phone VARCHAR(30),
    account_status ENUM('active','locked','deactivated') NOT NULL DEFAULT 'active',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(120) NOT NULL,
    emergency_contact_phone VARCHAR(30) NOT NULL,
    medical_alerts TEXT,
    medical_form_path VARCHAR(255),
    consent_form_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    camper_id INT NOT NULL,
    session_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending','Confirmed','Failed') NOT NULL DEFAULT 'Pending',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    card_last4 CHAR(4),
    justification_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (camper_id) REFERENCES campers(id) ON DELETE CASCADE
);
