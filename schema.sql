-- Ghana Birth and Death Registry System Database Schema
-- This file contains the complete database structure for the national registry system

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS death_registrations CASCADE;
DROP TABLE IF EXISTS birth_registrations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Sessions table for user authentication (required for Replit Auth)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for session expiration
CREATE INDEX IDX_session_expire ON sessions(expire);

-- Users table with role-based access control
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE,
    password VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'health_worker', 'registrar', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Birth registrations table
CREATE TABLE birth_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE,
    certificate_id VARCHAR UNIQUE,
    
    -- Child information
    child_first_name VARCHAR NOT NULL,
    child_last_name VARCHAR NOT NULL,
    child_sex VARCHAR NOT NULL CHECK (child_sex IN ('male', 'female')),
    birth_date TIMESTAMP NOT NULL,
    birth_place TEXT NOT NULL,
    
    -- Parent information
    father_name VARCHAR NOT NULL,
    father_national_id VARCHAR NOT NULL,
    mother_name VARCHAR NOT NULL,
    mother_national_id VARCHAR NOT NULL,
    
    -- System fields
    submitted_by VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by VARCHAR REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- File uploads
    hospital_certificate_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Death registrations table
CREATE TABLE death_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE,
    certificate_id VARCHAR UNIQUE,
    
    -- Deceased information
    deceased_name VARCHAR NOT NULL,
    death_date TIMESTAMP NOT NULL,
    death_place TEXT NOT NULL,
    cause_of_death TEXT NOT NULL,
    
    -- Next of kin information
    kin_name VARCHAR NOT NULL,
    kin_relationship VARCHAR NOT NULL CHECK (kin_relationship IN ('spouse', 'child', 'parent', 'sibling', 'other')),
    kin_phone VARCHAR NOT NULL,
    kin_national_id VARCHAR,
    
    -- System fields
    submitted_by VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by VARCHAR REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- File uploads
    medical_certificate_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_birth_status ON birth_registrations(status);
CREATE INDEX idx_birth_submitted_by ON birth_registrations(submitted_by);
CREATE INDEX idx_birth_approved_at ON birth_registrations(approved_at);
CREATE INDEX idx_birth_created_at ON birth_registrations(created_at);
CREATE INDEX idx_birth_certificate_id ON birth_registrations(certificate_id);

CREATE INDEX idx_death_status ON death_registrations(status);
CREATE INDEX idx_death_submitted_by ON death_registrations(submitted_by);
CREATE INDEX idx_death_approved_at ON death_registrations(approved_at);
CREATE INDEX idx_death_created_at ON death_registrations(created_at);
CREATE INDEX idx_death_certificate_id ON death_registrations(certificate_id);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_birth_registrations_updated_at BEFORE UPDATE ON birth_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_death_registrations_updated_at BEFORE UPDATE ON death_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO users (id, email, first_name, last_name, role) VALUES 
('admin', 'admin@ghana.gov.gh', 'Ghana', 'Administrator', 'admin'),
('registrar', 'registrar@ghana.gov.gh', 'Regional', 'Registrar', 'registrar'),
('health_worker', 'health@ghana.gov.gh', 'Dr. Kwame', 'Asante', 'health_worker'),
('public_user', 'citizen@example.com', 'Akosua', 'Mensah', 'public')
ON CONFLICT (id) DO NOTHING;

-- Views for reporting and analytics
CREATE OR REPLACE VIEW registration_statistics AS
SELECT 
    'birth' as registration_type,
    status,
    COUNT(*) as count,
    DATE_TRUNC('month', created_at) as month
FROM birth_registrations 
GROUP BY status, DATE_TRUNC('month', created_at)
UNION ALL
SELECT 
    'death' as registration_type,
    status,
    COUNT(*) as count,
    DATE_TRUNC('month', created_at) as month
FROM death_registrations 
GROUP BY status, DATE_TRUNC('month', created_at);

-- View for pending applications that need review
CREATE OR REPLACE VIEW pending_applications AS
SELECT 
    'birth' as type,
    id,
    application_id,
    CASE 
        WHEN 'birth' = 'birth' THEN child_first_name || ' ' || child_last_name
        ELSE NULL
    END as subject_name,
    submitted_by,
    created_at
FROM birth_registrations 
WHERE status = 'pending'
UNION ALL
SELECT 
    'death' as type,
    id,
    application_id,
    deceased_name as subject_name,
    submitted_by,
    created_at
FROM death_registrations 
WHERE status = 'pending'
ORDER BY created_at ASC;

-- View for approved certificates that can be verified
CREATE OR REPLACE VIEW verified_certificates AS
SELECT 
    'birth' as certificate_type,
    certificate_id,
    child_first_name || ' ' || child_last_name as full_name,
    birth_date as event_date,
    approved_at as issue_date,
    'Ghana Births and Deaths Registry' as issuing_office
FROM birth_registrations 
WHERE status = 'approved' AND certificate_id IS NOT NULL
UNION ALL
SELECT 
    'death' as certificate_type,
    certificate_id,
    deceased_name as full_name,
    death_date as event_date,
    approved_at as issue_date,
    'Ghana Births and Deaths Registry' as issuing_office
FROM death_registrations 
WHERE status = 'approved' AND certificate_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE birth_registrations IS 'Birth certificate applications and approvals';
COMMENT ON TABLE death_registrations IS 'Death certificate applications and approvals';
COMMENT ON TABLE sessions IS 'User session storage for authentication';

COMMENT ON COLUMN users.role IS 'User role: public, health_worker, registrar, or admin';
COMMENT ON COLUMN birth_registrations.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN death_registrations.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN birth_registrations.certificate_id IS 'Unique certificate ID generated upon approval';
COMMENT ON COLUMN death_registrations.certificate_id IS 'Unique certificate ID generated upon approval';