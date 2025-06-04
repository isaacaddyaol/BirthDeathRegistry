-- Sessions table (for session management)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX "IDX_session_expire" ON sessions (expire);

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birth registrations table
CREATE TABLE birth_registrations (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR NOT NULL UNIQUE,
    certificate_id VARCHAR UNIQUE,
    
    -- Child information
    child_first_name VARCHAR NOT NULL,
    child_last_name VARCHAR NOT NULL,
    child_sex VARCHAR NOT NULL,
    birth_date TIMESTAMP NOT NULL,
    birth_place TEXT NOT NULL,
    
    -- Parent information
    father_name VARCHAR NOT NULL,
    father_national_id VARCHAR NOT NULL,
    mother_name VARCHAR NOT NULL,
    mother_national_id VARCHAR NOT NULL,
    
    -- System fields
    submitted_by VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by VARCHAR,
    approved_at TIMESTAMP,
    
    -- File uploads
    hospital_certificate_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
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
    kin_relationship VARCHAR NOT NULL,
    kin_phone VARCHAR NOT NULL,
    kin_national_id VARCHAR,
    
    -- System fields
    submitted_by VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    approved_by VARCHAR,
    approved_at TIMESTAMP,
    
    -- File uploads
    medical_certificate_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);
