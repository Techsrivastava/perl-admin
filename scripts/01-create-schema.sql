-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'super_admin', 'university', 'consultancy', 'agent'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universities
CREATE TABLE IF NOT EXISTS universities (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100) UNIQUE,
  authorized_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  documents_path VARCHAR(255),
  wallet_balance DECIMAL(15, 2) DEFAULT 0,
  total_received DECIMAL(15, 2) DEFAULT 0,
  total_payable DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, suspended
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultancies
CREATE TABLE IF NOT EXISTS consultancies (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  registration_number VARCHAR(100) UNIQUE,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  documents_path VARCHAR(255),
  wallet_balance DECIMAL(15, 2) DEFAULT 0,
  total_collected DECIMAL(15, 2) DEFAULT 0,
  total_university_payable DECIMAL(15, 2) DEFAULT 0,
  total_agent_payable DECIMAL(15, 2) DEFAULT 0,
  net_profit DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  consultancy_id BIGINT REFERENCES consultancies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  documents_path VARCHAR(255),
  wallet_balance DECIMAL(15, 2) DEFAULT 0,
  total_fees_submitted DECIMAL(15, 2) DEFAULT 0,
  total_commission_earned DECIMAL(15, 2) DEFAULT 0,
  total_commission_paid DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stream VARCHAR(100),
  duration_years INT,
  level VARCHAR(50), -- UG, PG, Diploma
  mode VARCHAR(50), -- Regular, Online, Distance
  eligibility TEXT,
  syllabus TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- University Courses (Attach courses to universities with fees)
CREATE TABLE IF NOT EXISTS university_courses (
  id BIGSERIAL PRIMARY KEY,
  university_id BIGINT REFERENCES universities(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  university_fee DECIMAL(15, 2),
  student_display_fee DECIMAL(15, 2),
  consultancy_share DECIMAL(15, 2) DEFAULT 0,
  agent_commission DECIMAL(15, 2) DEFAULT 0,
  allowed_agents BOOLEAN DEFAULT TRUE,
  fee_mode VARCHAR(50), -- 'share_deduct', 'full_fee'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admissions
CREATE TABLE IF NOT EXISTS admissions (
  id BIGSERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255),
  student_phone VARCHAR(20),
  university_id BIGINT REFERENCES universities(id),
  course_id BIGINT REFERENCES courses(id),
  consultancy_id BIGINT REFERENCES consultancies(id),
  agent_id BIGINT REFERENCES agents(id),
  total_fee DECIMAL(15, 2),
  fee_received DECIMAL(15, 2) DEFAULT 0,
  fee_pending DECIMAL(15, 2),
  university_fee DECIMAL(15, 2),
  consultancy_profit DECIMAL(15, 2),
  agent_commission DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, reverted, rejected
  documents_path VARCHAR(255),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  admission_id BIGINT REFERENCES admissions(id),
  payer_type VARCHAR(50), -- student, consultancy, agent
  payer_id BIGINT,
  amount DECIMAL(15, 2),
  payment_method VARCHAR(50), -- upi, net_banking, card, cheque, cash
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, failed
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledgers
CREATE TABLE IF NOT EXISTS ledgers (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50), -- university_ledger, consultancy_ledger, agent_ledger
  from_entity_id BIGINT,
  to_entity_id BIGINT,
  amount DECIMAL(15, 2),
  balance DECIMAL(15, 2),
  description TEXT,
  reference_id BIGINT, -- admission_id or payment_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Expenses
CREATE TABLE IF NOT EXISTS daily_expenses (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(100), -- office, staff, travel, marketing, misc
  amount DECIMAL(15, 2),
  description TEXT,
  receipt_path VARCHAR(255),
  expense_date DATE,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50), -- university, consultancy, agent
  entity_id BIGINT,
  permission_name VARCHAR(100),
  permission_value VARCHAR(50), -- show, hide, edit, view
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_type VARCHAR(50), -- university, consultancy, agent, super_admin
  recipient_id BIGINT,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50), -- admission, fee, alert, system
  related_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  user_role VARCHAR(50),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id BIGINT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_universities_user_id ON universities(user_id);
CREATE INDEX idx_consultancies_user_id ON consultancies(user_id);
CREATE INDEX idx_agents_consultancy_id ON agents(consultancy_id);
CREATE INDEX idx_admissions_university_id ON admissions(university_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_payments_admission_id ON payments(admission_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
