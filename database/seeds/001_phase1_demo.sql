INSERT INTO organizations (id, name, slug, status, plan, base_currency, timezone, onboarding_completed)
VALUES ('org_demo', 'Tech Synapse Pro Ltd', 'tech-synapse-pro', 'active', 'enterprise', 'INR', 'Asia/Kolkata', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_settings (id, organization_id, security)
VALUES ('set_demo', 'org_demo', '{"require_mfa": false, "session_timeout_minutes": 60, "password_min_length": 12}')
ON CONFLICT (id) DO NOTHING;
