-- ============================================================
-- Lifeline Medical Education — PostgreSQL Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id        TEXT UNIQUE NOT NULL,           -- Clerk authentication user ID
    email           TEXT UNIQUE NOT NULL,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    program         TEXT NOT NULL DEFAULT 'MD',     -- MD, DO, PA, NP, IMG, Resident
    year            TEXT NOT NULL DEFAULT 'MS2',    -- MS1-MS4, Resident, Fellow, Attending
    school          TEXT,
    target_exam     TEXT,                           -- step1, step2, comlex1, comlex2, shelf
    exam_date       TIMESTAMPTZ,

    -- Gamification
    xp              INTEGER NOT NULL DEFAULT 0,
    level           INTEGER NOT NULL DEFAULT 1,
    streak_days     INTEGER NOT NULL DEFAULT 0,
    longest_streak  INTEGER NOT NULL DEFAULT 0,
    last_active     TIMESTAMPTZ,

    -- Subscription
    plan            TEXT NOT NULL DEFAULT 'free',   -- free, pro, institutional
    stripe_customer_id TEXT,
    subscription_end   TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users (clerk_id);
CREATE INDEX idx_users_email ON users (email);

-- ─── USER WEAKNESSES ─────────────────────────────────────────────────────────

CREATE TABLE user_weaknesses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic                   TEXT NOT NULL,
    system                  TEXT NOT NULL,
    miss_count              INTEGER NOT NULL DEFAULT 1,
    weakness_category       TEXT NOT NULL,          -- knowledge-gap, mechanism, diagnostic, management, pharmacology, memory
    last_missed             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    predicted_forget_date   TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weaknesses_user_id ON user_weaknesses (user_id);
CREATE INDEX idx_weaknesses_topic ON user_weaknesses (topic);

-- ─── DECKS ────────────────────────────────────────────────────────────────────

CREATE TABLE decks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    full_path   TEXT NOT NULL,                      -- "Step 1::Renal::Nephrotic Syndrome"
    card_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decks_user_id ON decks (user_id);

-- ─── FLASHCARDS ───────────────────────────────────────────────────────────────

CREATE TABLE flashcards (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id             UUID REFERENCES decks(id) ON DELETE SET NULL,

    -- Card content
    card_type           TEXT NOT NULL DEFAULT 'basic',  -- basic, cloze, vignette, comparison
    front               TEXT NOT NULL,
    back                TEXT NOT NULL DEFAULT '',
    cloze_text          TEXT,
    explanation         TEXT NOT NULL DEFAULT '',

    -- Metadata
    tags                JSONB NOT NULL DEFAULT '[]',
    topic               TEXT NOT NULL,
    system              TEXT NOT NULL,
    difficulty          SMALLINT NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
    board_relevance     TEXT NOT NULL DEFAULT 'step1',  -- step1, step2, both, clinical, comlex

    -- Source tracking
    source_type         TEXT NOT NULL DEFAULT 'other',  -- qbank, video, lecture, textbook, notes
    source_text         TEXT NOT NULL DEFAULT '',

    -- Weakness tracking
    weakness_reason     TEXT,                           -- got-wrong, forgot-fact, mechanism-unclear, etc.
    weakness_category   TEXT,                           -- mechanism, diagnostic, management, etc.

    -- Spaced repetition (SM-2 algorithm)
    ease_factor         REAL NOT NULL DEFAULT 2.5,
    interval_days       INTEGER NOT NULL DEFAULT 1,
    repetitions         INTEGER NOT NULL DEFAULT 0,
    due_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed       TIMESTAMPTZ,

    -- Anki integration
    exported_to_anki    BOOLEAN NOT NULL DEFAULT FALSE,
    anki_note_id        BIGINT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards (deck_id);
CREATE INDEX idx_flashcards_due_date ON flashcards (due_date);
CREATE INDEX idx_flashcards_system ON flashcards (system);
CREATE INDEX idx_flashcards_topic ON flashcards (topic);

-- ─── STUDY GUIDES ─────────────────────────────────────────────────────────────

CREATE TABLE study_guides (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic               TEXT NOT NULL,
    system              TEXT NOT NULL,
    related_card_ids    JSONB NOT NULL DEFAULT '[]',
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_guides_user_id ON study_guides (user_id);
CREATE INDEX idx_study_guides_topic ON study_guides (topic);

CREATE TABLE study_guide_sections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id        UUID NOT NULL REFERENCES study_guides(id) ON DELETE CASCADE,
    heading         TEXT NOT NULL,
    section_type    TEXT NOT NULL,              -- concept, pathophysiology, presentation, diagnostics, management, pharmacology, pearls, traps
    content         JSONB NOT NULL DEFAULT '[]',
    sort_order      SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_guide_sections_guide_id ON study_guide_sections (guide_id);

-- ─── QUESTIONS (Question Bank) ────────────────────────────────────────────────

CREATE TABLE questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stem                TEXT NOT NULL,
    options             JSONB NOT NULL,             -- ["A text", "B text", "C text", "D text"]
    correct_index       SMALLINT NOT NULL,          -- 0-based index
    explanation         TEXT NOT NULL,
    wrong_explanations  JSONB NOT NULL DEFAULT '[]',
    topic               TEXT NOT NULL,
    system              TEXT NOT NULL,
    difficulty          SMALLINT NOT NULL DEFAULT 3,
    board_relevance     TEXT NOT NULL DEFAULT 'step1',
    question_type       TEXT NOT NULL DEFAULT 'mcq',-- mcq, multi-select, image, vignette
    source              TEXT NOT NULL DEFAULT 'NBME-style',
    tags                JSONB NOT NULL DEFAULT '[]',
    ai_generated        BOOLEAN NOT NULL DEFAULT FALSE,
    generated_from_card_id UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_system ON questions (system);
CREATE INDEX idx_questions_difficulty ON questions (difficulty);
CREATE INDEX idx_questions_board ON questions (board_relevance);

-- ─── PRACTICE SESSIONS ────────────────────────────────────────────────────────

CREATE TABLE practice_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    system_filter       TEXT,
    total_questions     INTEGER NOT NULL DEFAULT 0,
    correct             INTEGER NOT NULL DEFAULT 0,
    accuracy            REAL NOT NULL DEFAULT 0,
    avg_time_seconds    REAL NOT NULL DEFAULT 0,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_practice_sessions_user_id ON practice_sessions (user_id);

CREATE TABLE practice_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id),
    selected_index  SMALLINT NOT NULL,
    is_correct      BOOLEAN NOT NULL,
    time_seconds    REAL NOT NULL,
    flagged         BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarked      BOOLEAN NOT NULL DEFAULT FALSE,
    answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_practice_answers_session_id ON practice_answers (session_id);
CREATE INDEX idx_practice_answers_user_id ON practice_answers (user_id);
CREATE INDEX idx_practice_answers_question_id ON practice_answers (question_id);

-- ─── PIMP (AI ORAL ROUNDS) SESSIONS ─────────────────────────────────────────

CREATE TABLE pimp_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic                   TEXT NOT NULL,
    system                  TEXT NOT NULL,
    level                   TEXT NOT NULL DEFAULT 'step1',  -- ms1, ms2, step1, step2, clinical, intern, resident
    overall_score           REAL NOT NULL DEFAULT 0,
    strengths               JSONB NOT NULL DEFAULT '[]',
    weaknesses              JSONB NOT NULL DEFAULT '[]',
    missed_concepts         JSONB NOT NULL DEFAULT '[]',
    recommended_card_ids    JSONB NOT NULL DEFAULT '[]',
    new_cards_created       JSONB NOT NULL DEFAULT '[]',
    started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ
);

CREATE INDEX idx_pimp_sessions_user_id ON pimp_sessions (user_id);

CREATE TABLE pimp_questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL REFERENCES pimp_sessions(id) ON DELETE CASCADE,
    question            TEXT NOT NULL,
    question_type       TEXT NOT NULL,              -- definition, mechanism, lab, differential, treatment, complication, vignette
    expected_answer     TEXT NOT NULL DEFAULT '',
    student_answer      TEXT,
    score               TEXT,                       -- correct, partial, incorrect
    feedback            TEXT,
    follow_up_question  TEXT,
    generated_card_id   UUID REFERENCES flashcards(id),
    asked_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answered_at         TIMESTAMPTZ
);

CREATE INDEX idx_pimp_questions_session_id ON pimp_questions (session_id);

CREATE TABLE pimp_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES pimp_sessions(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,                      -- attending, student
    content     TEXT NOT NULL,
    score       TEXT,                               -- correct, partial, incorrect (for AI messages)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pimp_messages_session_id ON pimp_messages (session_id);

-- ─── LIFELINE NEXUS (Community) ───────────────────────────────────────────────

CREATE TABLE nexus_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    tag         TEXT,                               -- Win, Teaching, Study Tip, Question
    likes       INTEGER NOT NULL DEFAULT 0,
    comments    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nexus_posts_author_id ON nexus_posts (author_id);
CREATE INDEX idx_nexus_posts_created_at ON nexus_posts (created_at DESC);

CREATE TABLE nexus_post_likes (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES nexus_posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE nexus_connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending',    -- pending, accepted, declined
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (requester_id, recipient_id)
);

CREATE INDEX idx_nexus_connections_requester ON nexus_connections (requester_id);
CREATE INDEX idx_nexus_connections_recipient ON nexus_connections (recipient_id);

CREATE TABLE study_groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    admin_id    UUID NOT NULL REFERENCES users(id),
    member_ids  JSONB NOT NULL DEFAULT '[]',
    is_public   BOOLEAN NOT NULL DEFAULT TRUE,
    tags        JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CLINICAL ─────────────────────────────────────────────────────────────────

CREATE TABLE patient_encounters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clerkship       TEXT NOT NULL,                  -- internal_medicine, surgery, pediatrics, etc.
    chief_complaint TEXT NOT NULL,
    diagnosis       TEXT,
    soap_subjective TEXT,
    soap_objective  TEXT,
    soap_assessment TEXT,
    soap_plan       TEXT,
    ai_feedback     JSONB,                          -- {score, strengths, improvements, tips}
    encounter_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_encounters_user_id ON patient_encounters (user_id);
CREATE INDEX idx_encounters_clerkship ON patient_encounters (clerkship);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER flashcards_updated_at BEFORE UPDATE ON flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── SEED DATA (Development) ─────────────────────────────────────────────────

-- Sample questions for testing
INSERT INTO questions (stem, options, correct_index, explanation, wrong_explanations, topic, system, difficulty, board_relevance, tags)
VALUES (
    'A 12-year-old boy presents with periorbital edema, frothy urine, and hypoalbuminemia after a recent URI. Biopsy shows normal light microscopy. What is the most likely diagnosis?',
    '["Minimal Change Disease", "Focal Segmental Glomerulosclerosis", "Membranous Nephropathy", "IgA Nephropathy"]',
    0,
    'Minimal Change Disease is the most common cause of nephrotic syndrome in children. It presents after URIs, shows normal LM, and responds to steroids. Foot process effacement seen on EM is pathognomonic.',
    '["FSGS is more common in adults and African Americans, and has worse prognosis.", "Membranous nephropathy is most common in adults and is associated with anti-PLA2R antibodies.", "IgA nephropathy presents with hematuria (nephritic picture), not massive proteinuria."]',
    'Nephrotic Syndrome', 'Renal', 3, 'step1',
    '["nephrology", "nephrotic", "pediatrics", "high-yield"]'
);
