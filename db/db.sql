DROP TABLE IF EXISTS members;
CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    chinese_name TEXT,
    picture TEXT
);

CREATE TABLE membership_fee_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_name TEXT UNIQUE NOT NULL,
    description TEXT
);

DROP TABLE IF EXISTS membership_fees;
CREATE TABLE membership_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_number TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN NOT NULL DEFAULT 0    
);
CREATE TABLE membership_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_number TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
    stage_id INTEGER NOT NULL,
    FOREIGN KEY (membership_number) REFERENCES members(membership_number) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES membership_fee_stages(id) ON DELETE SET NULL
);

DROP TABLE IF EXISTS membership_fee_stage_notes;
CREATE TABLE membership_fee_stage_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_fees_id INTEGER NOT NULL,
    stage_id INTEGER NOT NULL,
    membership_number TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    image_url TEXT
);
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);