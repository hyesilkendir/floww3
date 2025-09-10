-- Auth columns harden: add username, is_verified and ensure verification_tokens exists

-- 1) Add username if missing (nullable first), backfill, then enforce NOT NULL + UNIQUE
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
UPDATE users SET username = COALESCE(NULLIF(username, ''), split_part(email, '@', 1)) WHERE username IS NULL OR username = '';
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
DO $$ BEGIN
  CREATE UNIQUE INDEX username_idx ON users (username);
EXCEPTION WHEN duplicate_table THEN
  -- index already exists
  NULL;
END $$;

-- 2) Add is_verified with default false
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;

-- 3) Ensure verification_tokens table exists
CREATE TABLE IF NOT EXISTS verification_tokens (
  id VARCHAR(191) PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

DO $$ BEGIN
  CREATE INDEX verification_user_id_idx ON verification_tokens (user_id);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

ALTER TABLE verification_tokens
  ADD CONSTRAINT fk_verification_tokens_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
