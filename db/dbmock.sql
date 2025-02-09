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

