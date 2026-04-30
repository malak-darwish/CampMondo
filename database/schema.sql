

CREATE DATABASE IF NOT EXISTS campmondo;
USE campmondo;

-- ============================================================
-- 1. USERS
--    Stores all accounts: parents, staff, and admins
-- ============================================================
CREATE TABLE users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    full_name        VARCHAR(100)        NOT NULL,
    email            VARCHAR(150)        NOT NULL UNIQUE,
    password_hash    VARCHAR(255)        NOT NULL,
    role             ENUM('parent','staff','admin') NOT NULL,
    phone_number     VARCHAR(20),
    is_active        BOOLEAN             NOT NULL DEFAULT TRUE,
    failed_attempts  INT                 NOT NULL DEFAULT 0,
    locked_until     DATETIME            NULL,          -- FR 1.3: lockout for 15 min
    password_reset_token   VARCHAR(255)  NULL,
    password_reset_expires DATETIME      NULL,          -- FR 1.4: 1 hour expiry
    must_change_password   BOOLEAN       NOT NULL DEFAULT FALSE, -- FR 4.8: temp password
    created_at       DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. CAMPERS
--    Children registered by parents
-- ============================================================
CREATE TABLE campers (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    parent_id        INT          NOT NULL,
    full_name        VARCHAR(100) NOT NULL,
    date_of_birth    DATE         NOT NULL,
    gender           ENUM('male','female','other') NOT NULL,
    medical_alerts   TEXT         NULL,               -- FR 3.7: medical info
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. EMERGENCY CONTACTS
--    Each camper can have one or more emergency contacts
-- ============================================================
CREATE TABLE emergency_contacts (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    camper_id        INT          NOT NULL,
    contact_name     VARCHAR(100) NOT NULL,
    phone_number     VARCHAR(20)  NOT NULL,

    FOREIGN KEY (camper_id) REFERENCES campers(id) ON DELETE CASCADE
);

-- ============================================================
-- 4. SESSIONS
--    Camp programs created by admins
-- ============================================================
CREATE TABLE sessions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    start_date       DATE         NOT NULL,
    end_date         DATE         NOT NULL,
    max_capacity     INT          NOT NULL,
    enrollment_fee   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_by       INT          NOT NULL,            -- admin user id
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 5. ACTIVITY PROGRAMS
--    Activities available within a session (e.g. swimming, art)
-- ============================================================
CREATE TABLE activity_programs (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    session_id       INT           NOT NULL,
    name             VARCHAR(100)  NOT NULL,
    fee              DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- ============================================================
-- 6. GROUPS
--    Subsets of campers within a session, assigned to one staff
-- ============================================================
CREATE TABLE groups (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    session_id       INT          NOT NULL,
    name             VARCHAR(100) NOT NULL,
    staff_id         INT          NULL,                -- FR 4.5: one staff per group
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id)   REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_staff_per_session (session_id, staff_id)  -- FR 4.5
);

-- ============================================================
-- 7. ENROLLMENTS
--    Tracks which camper is enrolled in which session + group
-- ============================================================
CREATE TABLE enrollments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    camper_id        INT          NOT NULL,
    session_id       INT          NOT NULL,
    group_id         INT          NULL,                -- assigned later by admin
    status           ENUM('active','cancelled') NOT NULL DEFAULT 'active',
    enrolled_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at     DATETIME     NULL,

    FOREIGN KEY (camper_id)  REFERENCES campers(id)  ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id)   REFERENCES groups(id)   ON DELETE SET NULL,
    UNIQUE KEY unique_enrollment (camper_id, session_id)  -- FR 2.10: no duplicate enrollment
);

-- ============================================================
-- 8. ENROLLMENT ACTIVITIES
--    Which activity programs a camper selected during enrollment
-- ============================================================
CREATE TABLE enrollment_activities (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id    INT NOT NULL,
    activity_id      INT NOT NULL,

    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id)   REFERENCES activity_programs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment_activity (enrollment_id, activity_id)
);

-- ============================================================
-- 9. DOCUMENTS
--    Medical forms and consent forms uploaded by parents
-- ============================================================
CREATE TABLE documents (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id    INT          NOT NULL,
    document_type    ENUM('medical_form','consent_form') NOT NULL,
    file_path        VARCHAR(255) NOT NULL,            -- relative path on server
    uploaded_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- ============================================================
-- 10. PAYMENTS
--     One payment record per enrollment
-- ============================================================
CREATE TABLE payments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id    INT           NOT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    status           ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
    submitted_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at     DATETIME      NULL,
    admin_note       TEXT          NULL,               -- FR 4.12: justification note
    override_by      INT           NULL,               -- admin user id who changed status

    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (override_by)   REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 11. ATTENDANCE LOGS
--     Daily check-in / check-out per camper per session date
-- ============================================================
CREATE TABLE attendance_logs (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    camper_id        INT      NOT NULL,
    group_id         INT      NOT NULL,
    session_id       INT      NOT NULL,
    log_date         DATE     NOT NULL,
    checked_in_at    DATETIME NULL,                    -- FR 3.2
    checked_out_at   DATETIME NULL,                    -- FR 3.3
    status           ENUM('present','absent','pending') NOT NULL DEFAULT 'pending',
    recorded_by      INT      NOT NULL,                -- staff user id

    FOREIGN KEY (camper_id)  REFERENCES campers(id)   ON DELETE CASCADE,
    FOREIGN KEY (group_id)   REFERENCES groups(id)    ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id)  ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    UNIQUE KEY unique_attendance (camper_id, session_id, log_date) -- one record per day
);

-- ============================================================
-- 12. INCIDENT REPORTS
--     Filed by staff for a specific camper
-- ============================================================
CREATE TABLE incident_reports (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    camper_id        INT      NOT NULL,
    reported_by      INT      NOT NULL,               -- staff user id
    session_id       INT      NOT NULL,
    incident_date    DATE     NOT NULL,
    incident_time    TIME     NOT NULL,
    description      TEXT     NOT NULL,
    action_taken     TEXT     NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (camper_id)   REFERENCES campers(id)   ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (session_id)  REFERENCES sessions(id)  ON DELETE CASCADE
);

-- ============================================================
-- 13. ACTIVITY LOGS
--     Daily activity reports submitted by staff for their group
-- ============================================================
CREATE TABLE activity_logs (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    group_id         INT          NOT NULL,
    logged_by        INT          NOT NULL,            -- staff user id
    activity_name    VARCHAR(150) NOT NULL,
    log_date         DATE         NOT NULL,
    duration_minutes INT          NOT NULL,
    description      TEXT         NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id)  REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (logged_by) REFERENCES users(id)
);

-- ============================================================
-- 14. ANNOUNCEMENTS
--     Posted by admins or staff, targeted to different audiences
-- ============================================================
CREATE TABLE announcements (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    author_id        INT          NOT NULL,
    title            VARCHAR(200) NOT NULL,
    body             TEXT         NOT NULL,
    target_type      ENUM('system_wide','session','group') NOT NULL,
    target_id        INT          NULL,                -- session_id or group_id if targeted
    published_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- ============================================================
-- 15. AUDIT LOGS
--     Tracks important system events for security (NFR 8)
-- ============================================================
CREATE TABLE audit_logs (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT          NULL,                -- who did the action
    action           VARCHAR(100) NOT NULL,            -- e.g. 'LOGIN', 'PAYMENT_STATUS_CHANGE'
    target_table     VARCHAR(50)  NULL,                -- e.g. 'payments', 'sessions'
    target_id        INT          NULL,                -- id of affected record
    details          TEXT         NULL,                -- extra context
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
--  DUMMY TEST DATA
--  Delete everything below this line before final submission
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE announcements;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE incident_reports;
TRUNCATE TABLE attendance_logs;
TRUNCATE TABLE documents;
TRUNCATE TABLE enrollment_activities;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE payments;
TRUNCATE TABLE emergency_contacts;
TRUNCATE TABLE campers;
TRUNCATE TABLE activity_programs;
TRUNCATE TABLE groups;
TRUNCATE TABLE sessions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (password for all accounts is 'Password1')
-- Replace the hash below with a real bcrypt hash once Flask is set up
-- Run this in Python to generate: from bcrypt import hashpw, gensalt; print(hashpw(b'Password1', gensalt()).decode())
INSERT INTO users (id, full_name, email, password_hash, role, phone_number) VALUES
(1, 'Admin Sara',  'admin@campmondo.com',  'REPLACE_WITH_HASH', 'admin',  '70000001'),
(2, 'Staff Ali',   'staff@campmondo.com',  'REPLACE_WITH_HASH', 'staff',  '70000002'),
(3, 'Parent Zainab', 'parent@campmondo.com', 'REPLACE_WITH_HASH', 'parent', '70000003');

-- Sessions
INSERT INTO sessions (id, name, start_date, end_date, max_capacity, enrollment_fee, created_by) VALUES
(1, 'Summer Session A', '2025-07-01', '2025-07-31', 30, 150.00, 1),
(2, 'Summer Session B', '2025-08-01', '2025-08-31', 20, 120.00, 1);

-- Activity Programs
INSERT INTO activity_programs (id, session_id, name, fee) VALUES
(1, 1, 'Swimming',      20.00),
(2, 1, 'Arts & Crafts', 15.00),
(3, 2, 'Football',      25.00);

-- Groups
INSERT INTO groups (id, session_id, name, staff_id) VALUES
(1, 1, 'Group A', 2),
(2, 1, 'Group B', NULL);

-- Campers
INSERT INTO campers (id, parent_id, full_name, date_of_birth, gender, medical_alerts) VALUES
(1, 3, 'Malak Darwish',  '2015-03-10', 'male',   'Allergic to peanuts'),
(2, 3, 'Nour Awada', '2017-06-22', 'female', NULL);

-- Emergency Contacts
INSERT INTO emergency_contacts (camper_id, contact_name, phone_number) VALUES
(1, 'Zainab Al Jazzar', '70000003'),
(2, 'Zainab Al Jazzar', '70000003');

-- Enrollments
INSERT INTO enrollments (id, camper_id, session_id, group_id, status) VALUES
(1, 1, 1, 1, 'active'),
(2, 2, 1, 1, 'active');

-- Enrollment Activities
INSERT INTO enrollment_activities (enrollment_id, activity_id) VALUES
(1, 1),
(1, 2),
(2, 1);

-- Payments
INSERT INTO payments (enrollment_id, amount, status) VALUES
(1, 170.00, 'confirmed'),
(2, 150.00, 'pending');

-- Attendance Logs
INSERT INTO attendance_logs (camper_id, group_id, session_id, log_date, checked_in_at, checked_out_at, status, recorded_by) VALUES
(1, 1, 1, '2025-07-01', '2025-07-01 08:30:00', '2025-07-01 15:00:00', 'present', 2),
(2, 1, 1, '2025-07-01', '2025-07-01 08:45:00', NULL,                  'present', 2);

-- Announcements
INSERT INTO announcements (author_id, title, body, target_type) VALUES
(1, 'Welcome to CampMondo!', 'We are excited to have all campers join us this summer.', 'system_wide'),
(2, 'Day 1 Update',          'Great first day! Kids enjoyed swimming and arts and crafts.', 'group');

-- Incident Reports
INSERT INTO incident_reports (camper_id, reported_by, session_id, incident_date, incident_time, description, action_taken) VALUES
(1, 2, 1, '2025-07-01', '10:30:00', 'Omar fell during swimming and scraped his knee.', 'First aid applied, parents notified.');

-- Activity Logs
INSERT INTO activity_logs (group_id, logged_by, activity_name, log_date, duration_minutes, description) VALUES
(1, 2, 'Swimming',      '2025-07-01', 60, 'Campers practiced freestyle and backstroke.'),
(1, 2, 'Arts & Crafts', '2025-07-01', 45, 'Campers made friendship bracelets.');