import os
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/snepstudio")

def get_db_connection():
    """
    Establish and return a connection to PostgreSQL database.
    Uses RealDictCursor so rows can be accessed like dictionaries.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"[Database Error] Connection failed: {e}")
        raise e

def init_db():
    """
    Initialize database schema with tables and default admin account.
    Runs CREATE TABLE IF NOT EXISTS statements.
    """
    commands = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            service VARCHAR(100) NOT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            customer_name VARCHAR(150) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            address TEXT NOT NULL,
            message TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS work (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
            service VARCHAR(100) NOT NULL,
            original_filename VARCHAR(255) NOT NULL,
            original_filepath VARCHAR(255) NOT NULL,
            file_type VARCHAR(20) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'Pending',
            completed_filename VARCHAR(255),
            completed_filepath VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
            service VARCHAR(100) NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            payment_status VARCHAR(50) DEFAULT 'Pending',
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        for command in commands:
            cur.execute(command)

        # Seed default admin if not exists: admin / admin123
        cur.execute("SELECT id FROM admins WHERE username = %s;", ('admin',))
        admin = cur.fetchone()
        if not admin:
            hashed_pw = generate_password_hash("admin123")
            cur.execute(
                "INSERT INTO admins (username, password_hash) VALUES (%s, %s);",
                ('admin', hashed_pw)
            )
            print("[Database] Default admin account created: admin / admin123")

        conn.commit()
        cur.close()
        print("[Database] Schema initialized successfully.")
    except Exception as e:
        print(f"[Database Error] Failed to initialize database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_db()
