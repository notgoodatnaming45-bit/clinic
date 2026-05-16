-- TBI Clinic Database Schema
-- HIPAA-Compliant PostgreSQL Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & ROLES
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'physician', 'medical_assistant', 'legal_liaison');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_mfa');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'medical_assistant',
    status user_status NOT NULL DEFAULT 'pending_mfa',
    mfa_secret TEXT,                    -- TOTP secret (encrypted)
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TYPE case_status AS ENUM ('intake', 'processing', 'review', 'finalized', 'archived');
CREATE TYPE case_priority AS ENUM ('routine', 'urgent', 'stat');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Personal data stored encrypted
    first_name_encrypted TEXT NOT NULL,
    last_name_encrypted TEXT NOT NULL,
    date_of_birth_encrypted TEXT NOT NULL,
    mrn VARCHAR(50) UNIQUE NOT NULL,    -- Medical Record Number
    injury_date DATE,
    case_status case_status NOT NULL DEFAULT 'intake',
    priority case_priority NOT NULL DEFAULT 'routine',
    assigned_physician_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TYPE doc_type AS ENUM ('pdf', 'dicom', 'scan', 'lab_result', 'referral', 'legal');
CREATE TYPE doc_status AS ENUM ('uploaded', 'processing', 'extracted', 'failed');

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    s3_key TEXT NOT NULL,               -- S3 object key (never expose publicly)
    s3_bucket VARCHAR(255) NOT NULL,
    file_type doc_type NOT NULL,
    file_size_bytes BIGINT,
    checksum_sha256 TEXT NOT NULL,      -- Integrity verification
    version INTEGER DEFAULT 1,
    is_latest_version BOOLEAN DEFAULT TRUE,
    doc_status doc_status DEFAULT 'uploaded',
    provider_name VARCHAR(255),         -- Outside provider name
    document_date DATE,
    uploaded_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI EXTRACTIONS
-- ============================================================
CREATE TABLE ai_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    document_id UUID REFERENCES documents(id),
    extraction_type VARCHAR(50) NOT NULL,   -- 'clinical_summary' | 'legal_report'
    raw_ai_output TEXT,                     -- Raw AI response (encrypted at rest via pgcrypto)
    structured_data JSONB,                  -- Parsed key findings
    gcs_score INTEGER,                      -- Glasgow Coma Scale
    injury_markers JSONB,                   -- Key clinical markers
    symptom_progression JSONB,              -- Timeline of symptoms
    neuro_psych_results JSONB,              -- Neuropsychological test results
    model_version VARCHAR(100),             -- AI model used
    confidence_score DECIMAL(5,4),          -- 0.0000 to 1.0000
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS (physician-reviewed drafts)
-- ============================================================
CREATE TYPE report_type AS ENUM ('clinical_summary', 'legal_report');
CREATE TYPE report_status AS ENUM ('draft', 'physician_review', 'approved', 'finalized', 'rejected');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    extraction_id UUID REFERENCES ai_extractions(id),
    report_type report_type NOT NULL,
    ai_draft TEXT,                          -- Original AI-generated text
    physician_edited_content TEXT,          -- After physician edits
    finalized_content TEXT,                 -- Final locked version
    report_status report_status DEFAULT 'draft',
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    digital_signature TEXT,                 -- Cryptographic signature on approval
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS (IMMUTABLE — no UPDATE/DELETE allowed)
-- ============================================================
CREATE TYPE audit_action AS ENUM (
    'record_viewed', 'record_created', 'record_edited', 'record_exported',
    'document_uploaded', 'document_downloaded', 'report_approved',
    'report_rejected', 'login_success', 'login_failed', 'mfa_verified',
    'permission_denied', 'patient_created', 'ai_extraction_run'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(100),             -- 'patient', 'document', 'report'
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,                          -- Additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make audit_logs immutable
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_patients_status ON patients(case_status);
CREATE INDEX idx_patients_physician ON patients(assigned_physician_id);
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_status ON documents(doc_status);
CREATE INDEX idx_reports_patient ON reports(patient_id);
CREATE INDEX idx_reports_status ON reports(report_status);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- INITIAL ADMIN USER (change password immediately)
-- ============================================================
INSERT INTO users (email, hashed_password, full_name, role, status, mfa_enabled)
VALUES (
    'admin@tbiclinic.local',
    '$2b$12$placeholder_change_immediately',  -- set via setup script
    'System Administrator',
    'admin',
    'active',
    false
);