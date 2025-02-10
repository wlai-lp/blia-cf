DROP TABLE IF EXISTS members;
CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    membership_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    chinese_name TEXT,
    picture TEXT
);

DROP TABLE IF EXISTS membership_fee_stages;
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

DROP TABLE IF EXISTS admin_users;
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


SELECT
  mf.id,
  mf.membership_number,
  mf.year,
  mf.amount,
  mf.payment_date,
  mf.completed,
  m.first_name,
  m.last_name,
  m.chinese_name,
  (SELECT mfsn.created_by FROM membership_fee_stage_notes AS mfsn WHERE mfsn.membership_fees_id = mf.id LIMIT 1) AS created_by
FROM
  membership_fees AS mf
JOIN
  members AS m ON mf.membership_number = m.membership_number
WHERE
  mf.completed = 0
  AND NOT EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id != 4
  );

-- this returns membership fees that are not yet recorded, received stage 2 but not deposted stage 4
  SELECT
  mf.id,
  mf.membership_number,
  mf.year,
  mf.amount,
  mf.payment_date,
  mf.completed,
  m.first_name,
  m.last_name,
  m.chinese_name,
  (
    SELECT
      mfsn.created_by
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
    LIMIT 1
  ) AS created_by
FROM
  membership_fees AS mf
JOIN
  members AS m ON mf.membership_number = m.membership_number
WHERE
  mf.completed = 0
  AND EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
  )
  AND NOT EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 4
  );


  SELECT
  mf.id,
  mf.membership_number,
  mf.year,  
  mf.payment_date,
  mf.completed,
  m.first_name,
  m.last_name,
  m.chinese_name,
  (
    SELECT
      mfsn.note
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
    LIMIT 1
  ) AS latest_note,
  mf.payment_date as note_created_at,
  (
    SELECT
      mfsn.created_by
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
    LIMIT 1
  ) AS note_created_by  
FROM
  membership_fees AS mf
JOIN
  members AS m ON mf.membership_number = m.membership_number
WHERE
  mf.completed = 0
  AND EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
  )
  AND NOT EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 4     
  )
  ORDER BY mf.payment_date DESC;


  SELECT
  mf.id,
  mf.membership_number,
  mf.year,
  mf.amount,
  mf.payment_date,
  mf.completed,
  m.first_name,
  m.last_name,
  m.chinese_name
FROM
  membership_fees AS mf
JOIN
  members AS m ON mf.membership_number = m.membership_number
WHERE
  mf.completed = 0
  AND NOT EXISTS (
    SELECT
      1
    FROM
      membership_fee_stage_notes AS mfsn
    WHERE
      mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 5
  );