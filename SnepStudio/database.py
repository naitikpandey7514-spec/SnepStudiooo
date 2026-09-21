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
            email VARCHAR(150) UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'Active',
            joined_date DATE DEFAULT CURRENT_DATE,
            shoots_completed INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
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
        CREATE TABLE IF NOT EXISTS shoot_albums (
            id VARCHAR(50) PRIMARY KEY,
            booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
            title VARCHAR(200) NOT NULL,
            service_category VARCHAR(100) NOT NULL,
            total_photos INT DEFAULT 0,
            original_total_size_bytes BIGINT DEFAULT 0,
            compressed_total_size_bytes BIGINT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'sent_to_customer',
            client_feedback_notes TEXT,
            customer_submitted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS shoot_photos (
            id VARCHAR(50) PRIMARY KEY,
            album_id VARCHAR(50) NOT NULL REFERENCES shoot_albums(id) ON DELETE CASCADE,
            filename VARCHAR(255) NOT NULL,
            preview_url TEXT NOT NULL,
            original_url TEXT NOT NULL,
            original_size_bytes BIGINT NOT NULL,
            compressed_size_bytes BIGINT NOT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS photo_selections (
            id SERIAL PRIMARY KEY,
            album_id VARCHAR(50) NOT NULL REFERENCES shoot_albums(id) ON DELETE CASCADE,
            photo_id VARCHAR(50) NOT NULL REFERENCES shoot_photos(id) ON DELETE CASCADE,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            selection_status VARCHAR(20) NOT NULL CHECK (selection_status IN ('selected', 'rejected', 'pending')),
            notes TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (album_id, photo_id, user_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
            filename VARCHAR(255) NOT NULL,
            filepath VARCHAR(500) NOT NULL,
            file_type VARCHAR(20) NOT NULL,
            file_size_bytes BIGINT,
            status VARCHAR(50) DEFAULT 'Pending',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS completed_work (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
            employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
            service VARCHAR(100) NOT NULL,
            deliverable_title VARCHAR(200) NOT NULL,
            file_type VARCHAR(20) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            filepath VARCHAR(500) NOT NULL,
            file_size_bytes BIGINT,
            status VARCHAR(50) DEFAULT 'Completed',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            service VARCHAR(100) NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            payment_status VARCHAR(50) DEFAULT 'Pending',
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS invoices (
            id SERIAL PRIMARY KEY,
            invoice_number VARCHAR(50) UNIQUE NOT NULL,
            booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount NUMERIC(10, 2) NOT NULL,
            tax_amount NUMERIC(10, 2) NOT NULL,
            total_amount NUMERIC(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                "INSERT INTO admins (username, email, password_hash) VALUES (%s, %s, %s);",
                ('admin', 'admin@snepstudio.com', hashed_pw)
            )
            print("[Database] Default admin account created: admin / admin123")

        # Seed default employee EMP-0001 if not exists
        cur.execute("SELECT id FROM employees WHERE employee_id = %s;", ('EMP-0001',))
        emp = cur.fetchone()
        if not emp:
            emp_pw = generate_password_hash("employee123")
            cur.execute(
                """INSERT INTO employees (employee_id, name, email, phone, role, password_hash, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s);""",
                ('EMP-0001', 'Arjun Mehta', 'arjun@snepstudio.com', '+91 98201 11223', 'Lead Photographer', emp_pw, 'Active')
            )
            print("[Database] Default employee account created: EMP-0001 / employee123")

        # Seed studio services if not exist
        services_to_seed = [
            ('Wedding Coverage', 'Full cinematic coverage of wedding rituals, ceremonies & portraits.', 75000.00),
            ('Pre-Wedding Films', 'Romantic drone & 4K cinematic shoot with creative storytelling.', 45000.00),
            ('Maternity Shoots', 'Artistic indoor studio and serene outdoor maternity portraits.', 25000.00),
            ('Commercial Portfolios', 'Editorial portraits, corporate headshots & studio brand imagery.', 35000.00),
            ('Photo Retouching & Editing', 'High-end frequency separation, color grading and HDR blending.', 8000.00),
            ('Video Color Grading & Cuts', 'Cinematic LUT application, sound design and 4K final cuts.', 18000.00)
        ]
        for s_name, s_desc, s_price in services_to_seed:
            cur.execute("SELECT id FROM services WHERE name = %s;", (s_name,))
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO services (name, description, price) VALUES (%s, %s, %s);",
                    (s_name, s_desc, s_price)
                )

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
