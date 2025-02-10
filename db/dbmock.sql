-- Insert members
INSERT INTO members (membership_number, first_name, last_name, chinese_name) VALUES
('BLIA-001', 'John', 'Doe', '张伟'),
('BLIA-002', 'Alice', 'Wang', '王小丽'),
('BLIA-003', 'Michael', 'Chen', '陈明'),
('BLIA-004', 'Emily', 'Zhang', '张慧'),
('BLIA-005', 'David', 'Liu', '刘强');

-- Insert membership fee stages
INSERT INTO membership_fee_stages (stage_name, description) VALUES
('Pending', 'Pending payment'),
('Received', 'Received from member'),
('Storaged', 'Where is it now?'),
('Deposited', 'Deposited to bank'),
('Recorded', 'Recorded to official member list');



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
    mfsn.note as latest_note,
    mfsn.created_at as note_created_at,
    mfsn.created_by as note_created_by,
    mfs.stage_name as current_stage
FROM membership_fees mf
JOIN members m ON mf.membership_number = m.membership_number
LEFT JOIN (
    SELECT membership_fees_id, note, created_at, created_by, stage_id
    FROM membership_fee_stage_notes mfsn1
    WHERE created_at = (
        SELECT created_at
        FROM membership_fee_stage_notes mfsn2
        WHERE mfsn2.membership_fees_id = mfsn1.membership_fees_id and mfsn2.stage_id != 4
    )
) mfsn ON mf.id = mfsn.membership_fees_id
LEFT JOIN membership_fee_stages mfs ON mfsn.stage_id = mfs.id
WHERE mf.completed = 0
ORDER BY mf.payment_date DESC


SELECT *
        FROM membership_fee_stage_notes mfsn2