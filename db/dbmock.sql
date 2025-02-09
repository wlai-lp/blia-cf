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

-- Insert membership fee payments
INSERT INTO membership_fees (membership_number, year, amount, payment_date, stage_id) VALUES
('BLIA-001', 2024, 40.00, '2024-01-15', 2), -- Fully Paid
('BLIA-002', 2023, 40.00, '2024-02-01', 3),  -- Partially Paid
('BLIA-003', 2022, 40.00, '2024-02-01', 4),           -- Pending
('BLIA-004', 2024, 40.00, '2024-01-10', 3), -- Fully Paid
('BLIA-005', 2024, 40.00, '2024-02-01', 2);           -- Overdue

-- Insert notes for fee stages
INSERT INTO membership_fee_stage_notes (stage_id, note) VALUES
(1, 'Reminder email sent to pending members.'),
(2, 'Member has paid half, waiting for full payment.'),
(3, 'Payment confirmed, receipt issued.'),
(4, 'Overdue notice sent, follow-up scheduled.');

-- test only
INSERT INTO membership_fees (membership_number, year, amount, payment_date, stage_id) VALUES
('BLIA-005xxx', 2024, 40.00, '2024-02-01', 2);           -- Overd