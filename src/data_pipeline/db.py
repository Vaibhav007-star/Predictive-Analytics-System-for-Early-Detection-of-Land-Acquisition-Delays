"""
Database Schema and Connection Manager for SIH26017.
Uses SQLite for lightweight local deployment, designed for seamless PostgreSQL migration.
"""

import sqlite3
import os
from typing import Optional

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "land_delays.db")

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

-- Core Projects Table (MoSPI Central Sector Infrastructure Projects)
CREATE TABLE IF NOT EXISTS projects (
    project_code TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    agency TEXT NOT NULL,
    state TEXT NOT NULL,
    approval_date TEXT,
    orig_commissioning_date TEXT,
    rev_commissioning_date TEXT,
    ant_commissioning_date TEXT,
    orig_cost_cr REAL NOT NULL,
    rev_cost_cr REAL,
    ant_cost_cr REAL,
    cumulative_exp_cr REAL,
    physical_progress_pct REAL,
    delay_months INTEGER,
    is_delayed INTEGER,
    cost_overrun_pct REAL,
    expenditure_ratio REAL,
    source_page INTEGER,
    source_dataset TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timelines & Milestone Delays
CREATE TABLE IF NOT EXISTS project_timelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_code TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    scheduled_date TEXT,
    actual_date TEXT,
    delay_days INTEGER,
    status TEXT,
    FOREIGN KEY (project_code) REFERENCES projects(project_code) ON DELETE CASCADE
);

-- District-Level Rural Road Construction (PMGSY - Ministry of Rural Development)
CREATE TABLE IF NOT EXISTS pmgsy_district_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_name TEXT NOT NULL,
    district_name TEXT NOT NULL,
    pmgsy_scheme TEXT NOT NULL,
    no_of_road_work_sanctioned INTEGER,
    no_of_bridges_sanctioned INTEGER,
    no_of_road_works_completed INTEGER,
    no_of_bridges_completed INTEGER,
    no_of_road_works_balance INTEGER,
    no_of_bridges_balance INTEGER,
    length_road_sanctioned_km REAL,
    cost_sanctioned_lakhs REAL,
    length_road_completed_km REAL,
    expenditure_occurred_lakhs REAL,
    length_road_balance_km REAL,
    budget REAL,
    work_completion_rate_pct REAL,
    length_completion_rate_pct REAL,
    source_dataset TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Urban Infrastructure Projects (Smart Cities Mission - MoHUA)
CREATE TABLE IF NOT EXISTS scm_projects (
    project_id TEXT PRIMARY KEY,
    state_name TEXT NOT NULL,
    city_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    category TEXT,
    sector TEXT,
    implementing_agency TEXT,
    planned_end_date TEXT,
    actual_completion_date TEXT,
    delay_days INTEGER,
    is_delayed INTEGER,
    estimated_cost_cr REAL,
    actual_cost_cr REAL,
    milestone TEXT,
    has_land_acquisition_mention INTEGER DEFAULT 0,
    has_clearance_mention INTEGER DEFAULT 0,
    milestones_achieved_text TEXT,
    source_dataset TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_state ON projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_agency ON projects(agency);
CREATE INDEX IF NOT EXISTS idx_projects_is_delayed ON projects(is_delayed);
CREATE INDEX IF NOT EXISTS idx_pmgsy_state ON pmgsy_district_progress(state_name);
CREATE INDEX IF NOT EXISTS idx_scm_state ON scm_projects(state_name);
"""

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Returns a SQLite connection with foreign keys enabled."""
    path = db_path or DEFAULT_DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: Optional[str] = None) -> None:
    """Initializes the SQLite schema."""
    conn = get_connection(db_path)
    try:
        conn.executescript(SCHEMA_SQL)
        conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema initialized successfully at:", DEFAULT_DB_PATH)

