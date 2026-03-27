-- ============================================================================
-- Pustak Tracker — Database Migration Script
-- Run this ONCE against your live pustak_tracker database.
-- ============================================================================

USE pustak_tracker;

-- ============================================================================
-- 1. ADD updated_at COLUMN TO ALL TABLES
-- (MySQL 8.0 doesn't support IF NOT EXISTS for ADD COLUMN,
--  so we drop first if it exists via a safe procedure)
-- ============================================================================

-- Helper procedure to safely add a column
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS safe_add_column(
    IN tbl VARCHAR(64),
    IN col VARCHAR(64),
    IN col_def VARCHAR(255)
)
BEGIN
    SET @col_exists = 0;
    SELECT COUNT(*) INTO @col_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col;

    IF @col_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Add updated_at to all tables
CALL safe_add_column('users',         'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('books',         'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('categories',    'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('transactions',  'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('reservations',  'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('fines',         'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
CALL safe_add_column('notifications', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS safe_add_column;

-- ============================================================================
-- 2. FIX DATA TYPES
-- ============================================================================

-- Fix fine_amount: Float → DECIMAL(10,2) for financial accuracy
ALTER TABLE transactions MODIFY COLUMN fine_amount DECIMAL(10,2) DEFAULT 0.00;

-- Fix amount in fines table: Float → DECIMAL(10,2)
ALTER TABLE fines MODIFY COLUMN amount DECIMAL(10,2) NOT NULL;

-- Fix password_hash: allow longer hashes and make NOT NULL
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(256) NOT NULL;

-- ============================================================================
-- 3. RENAME reservations.reserved_at → created_at (to match model)
-- ============================================================================

-- Check if reserved_at exists before renaming
SET @has_reserved_at = 0;
SELECT COUNT(*) INTO @has_reserved_at
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'reservations'
  AND COLUMN_NAME = 'reserved_at';

SET @rename_sql = IF(@has_reserved_at > 0,
    'ALTER TABLE reservations RENAME COLUMN reserved_at TO created_at',
    'SELECT 1');
PREPARE rename_stmt FROM @rename_sql;
EXECUTE rename_stmt;
DEALLOCATE PREPARE rename_stmt;

-- ============================================================================
-- 4. ADD CHECK CONSTRAINTS (ignore errors if they already exist)
-- ============================================================================

-- Prevent available_copies from going negative or exceeding total_copies
ALTER TABLE books ADD CONSTRAINT chk_available_gte_zero
    CHECK (available_copies >= 0);

ALTER TABLE books ADD CONSTRAINT chk_available_lte_total
    CHECK (available_copies <= total_copies);

-- Enforce valid role values
ALTER TABLE users ADD CONSTRAINT chk_user_role
    CHECK (role IN ('user', 'librarian'));

-- Enforce valid transaction status values
ALTER TABLE transactions ADD CONSTRAINT chk_txn_status
    CHECK (status IN ('issued', 'returned', 'overdue'));

-- Enforce valid reservation status values
ALTER TABLE reservations ADD CONSTRAINT chk_res_status
    CHECK (status IN ('pending', 'cancelled', 'fulfilled'));

-- ============================================================================
-- 5. ADD PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_user_status ON transactions(user_id, status);
CREATE INDEX idx_txn_book_status ON transactions(book_id, status);
CREATE INDEX idx_books_available ON books(available_copies);
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_res_user_book_status ON reservations(user_id, book_id, status);
CREATE INDEX idx_notif_user ON notifications(user_id, seen);

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration completed successfully!' AS result;
