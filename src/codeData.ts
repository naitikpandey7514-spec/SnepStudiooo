export interface CodeFile {
  path: string;
  category: 'Python Backend' | 'Templates' | 'Admin Templates' | 'Styles & JS' | 'Configuration & Docs';
  content: string;
}

export const SNEPSTUDIO_FILES: CodeFile[] = [
  {
    path: "requirements.txt",
    category: "Configuration & Docs",
    content: `Flask==3.0.3
psycopg2-binary==2.9.9
python-dotenv==1.0.1
Werkzeug==3.0.3
gunicorn==22.0.0`
  },
  {
    path: ".env.example",
    category: "Configuration & Docs",
    content: `# PostgreSQL Database Connection String
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snepstudio

# Flask Secret Key for Session Encryption
SECRET_KEY=snepstudio-super-secret-key-change-in-production-2026

# Flask Run Settings
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000`
  },
  {
    path: "database.py",
    category: "Python Backend",
    content: `import os
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
    init_db()`
  },
  {
    path: "app.py",
    category: "Python Backend",
    content: `import os
import time
from functools import wraps
from datetime import datetime
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, send_from_directory, abort
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from database import get_db_connection, init_db
from psycopg2.extras import RealDictCursor

# Load environment configuration
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "snepstudio-super-secret-key-2026")

# Configure Upload Folders
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PHOTOS_FOLDER = os.path.join(UPLOAD_FOLDER, "photos")
VIDEOS_FOLDER = os.path.join(UPLOAD_FOLDER, "videos")
COMPLETED_FOLDER = os.path.join(UPLOAD_FOLDER, "completed")

for folder in [UPLOAD_FOLDER, PHOTOS_FOLDER, VIDEOS_FOLDER, COMPLETED_FOLDER]:
    os.makedirs(folder, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB max limit

# Allowed Extensions
ALLOWED_PHOTO_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov"}
ALLOWED_EXTENSIONS = ALLOWED_PHOTO_EXTENSIONS.union(ALLOWED_VIDEO_EXTENSIONS)

# Service Pricing Matrix (INR)
SERVICE_PRICING = {
    "Photography": 999.00,
    "Wedding Shoot": 9999.00,
    "Pre-Wedding Shoot": 4999.00,
    "Photo Editing": 99.00,
    "Video Editing": 499.00
}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------- Decorators -----------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please login to continue.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "admin_id" not in session:
            flash("Admin authentication required.", "danger")
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated_function

# ----------------- General Routes -----------------
@app.route("/")
def index():
    return render_template("index.html")

# ----------------- User Authentication -----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        phone = request.form.get("phone", "").strip()
        address = request.form.get("address", "").strip()

        if not all([name, email, password, phone, address]):
            flash("All fields are required. Please fill in all details.", "danger")
            return render_template("register.html")

        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "danger")
            return render_template("register.html")

        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
            if cur.fetchone():
                flash("Email already exists. Please use another email or login.", "warning")
                return render_template("register.html")

            pw_hash = generate_password_hash(password)

            cur.execute(
                """
                INSERT INTO users (name, email, password_hash, phone, address)
                VALUES (%s, %s, %s, %s, %s) RETURNING id;
                """,
                (name, email, pw_hash, phone, address)
            )
            new_user = cur.fetchone()
            conn.commit()

            flash("Registration successful! Please login with your credentials.", "success")
            return redirect(url_for("login"))
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Something went wrong. Please try again.", "danger")
            return render_template("register.html")
        finally:
            if conn:
                conn.close()

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not email or not password:
            flash("Please enter both email and password.", "danger")
            return render_template("login.html")

        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM users WHERE email = %s;", (email,))
            user = cur.fetchone()

            if user and check_password_hash(user["password_hash"], password):
                session["user_id"] = user["id"]
                session["user_name"] = user["name"]
                session["user_email"] = user["email"]
                flash("Login successful! Welcome back.", "success")
                return redirect(url_for("dashboard"))
            else:
                flash("Invalid email or password.", "danger")
        except Exception as e:
            flash("Something went wrong. Please try again.", "danger")
        finally:
            if conn:
                conn.close()

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    session.pop("user_name", None)
    session.pop("user_email", None)
    flash("You have been logged out successfully.", "info")
    return redirect(url_for("login"))

# ----------------- User Dashboard & Actions -----------------
@app.route("/dashboard")
@login_required
def dashboard():
    user_id = session["user_id"]
    conn = None
    stats = {
        "total_appointments": 0,
        "pending_appointments": 0,
        "approved_appointments": 0,
        "completed_work": 0,
        "pending_payments": 0
    }
    recent_appointments = []

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s;", (user_id,))
        stats["total_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s AND status = 'Pending';", (user_id,))
        stats["pending_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s AND status = 'Approved';", (user_id,))
        stats["approved_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM work WHERE user_id = %s AND status = 'Completed';", (user_id,))
        stats["completed_work"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM payments WHERE user_id = %s AND payment_status = 'Pending';", (user_id,))
        stats["pending_payments"] = cur.fetchone()["count"]

        cur.execute(
            """
            SELECT a.*, p.id AS payment_id, p.payment_status, p.amount
            FROM appointments a
            LEFT JOIN payments p ON a.id = p.appointment_id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC LIMIT 5;
            """,
            (user_id,)
        )
        recent_appointments = cur.fetchall()
    except Exception as e:
        flash("Could not load dashboard information.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("dashboard.html", stats=stats, recent_appointments=recent_appointments)

@app.route("/appointment", methods=["GET", "POST"])
@login_required
def book_appointment():
    user_id = session["user_id"]
    service_param = request.args.get("service", "")

    if request.method == "POST":
        service = request.form.get("service", "").strip()
        appointment_date = request.form.get("appointment_date", "").strip()
        appointment_time = request.form.get("appointment_time", "").strip()
        customer_name = request.form.get("customer_name", "").strip()
        phone = request.form.get("phone", "").strip()
        address = request.form.get("address", "").strip()
        message = request.form.get("message", "").strip()

        if not all([service, appointment_date, appointment_time, customer_name, phone, address]):
            flash("Please fill in all required appointment details.", "danger")
            return render_template("appointment.html", service_pricing=SERVICE_PRICING, preselected_service=service)

        amount = SERVICE_PRICING.get(service, 999.00)

        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute(
                """
                INSERT INTO appointments (user_id, service, appointment_date, appointment_time, customer_name, phone, address, message, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Pending') RETURNING id;
                """,
                (user_id, service, appointment_date, appointment_time, customer_name, phone, address, message)
            )
            appointment_id = cur.fetchone()["id"]

            cur.execute(
                """
                INSERT INTO payments (user_id, appointment_id, service, amount, payment_method, payment_status)
                VALUES (%s, %s, %s, %s, 'Online', 'Pending');
                """,
                (user_id, appointment_id, service, amount)
            )

            conn.commit()
            flash("Appointment booked successfully.", "success")
            return redirect(url_for("my_appointments"))
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Something went wrong while booking your appointment. Please try again.", "danger")
        finally:
            if conn:
                conn.close()

    user_info = {}
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT name, phone, address FROM users WHERE id = %s;", (user_id,))
        user_info = cur.fetchone() or {}
    except Exception:
        pass
    finally:
        if conn:
            conn.close()

    return render_template("appointment.html", service_pricing=SERVICE_PRICING, preselected_service=service_param, user_info=user_info)

@app.route("/appointments")
@login_required
def my_appointments():
    user_id = session["user_id"]
    appointments = []
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT a.*, p.id AS payment_id, p.payment_status, p.amount
            FROM appointments a
            LEFT JOIN payments p ON a.id = p.appointment_id
            WHERE a.user_id = %s
            ORDER BY a.appointment_date DESC, a.appointment_time DESC;
            """,
            (user_id,)
        )
        appointments = cur.fetchall()
    except Exception as e:
        flash("Could not fetch your appointments.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("my_appointments.html", appointments=appointments)

@app.route("/upload", methods=["GET", "POST"])
@login_required
def upload_work():
    user_id = session["user_id"]

    if request.method == "POST":
        appointment_id = request.form.get("appointment_id")
        file_type = request.form.get("file_type", "").strip()
        description = request.form.get("description", "").strip()

        if "file" not in request.files:
            flash("No file part provided in upload form.", "danger")
            return redirect(url_for("upload_work"))

        file = request.files["file"]

        if file.filename == "":
            flash("No file selected for upload.", "danger")
            return redirect(url_for("upload_work"))

        if not allowed_file(file.filename):
            flash("Invalid file type. Allowed formats: JPG, JPEG, PNG, WEBP, MP4, MOV.", "danger")
            return redirect(url_for("upload_work"))

        ext = file.filename.rsplit(".", 1)[1].lower()
        original_name = secure_filename(file.filename)
        unique_name = f"{user_id}_{int(time.time())}_{original_name}"

        if ext in ALLOWED_PHOTO_EXTENSIONS:
            subfolder = "photos"
            save_path = os.path.join(PHOTOS_FOLDER, unique_name)
            detected_type = "Photo"
        else:
            subfolder = "videos"
            save_path = os.path.join(VIDEOS_FOLDER, unique_name)
            detected_type = "Video"

        file.save(save_path)
        stored_rel_path = f"{subfolder}/{unique_name}"

        service_name = "Editing Service"
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if appointment_id:
                cur.execute("SELECT service FROM appointments WHERE id = %s AND user_id = %s;", (appointment_id, user_id))
                app_res = cur.fetchone()
                if app_res:
                    service_name = app_res["service"]
            else:
                appointment_id = None

            cur.execute(
                """
                INSERT INTO work (user_id, appointment_id, service, original_filename, original_filepath, file_type, description, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'Pending');
                """,
                (user_id, appointment_id, service_name, original_name, stored_rel_path, detected_type, description)
            )
            conn.commit()
            flash("File uploaded successfully.", "success")
            return redirect(url_for("my_work"))
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Something went wrong during upload. Please try again.", "danger")
            return redirect(url_for("upload_work"))
        finally:
            if conn:
                conn.close()

    appointments = []
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, service, appointment_date FROM appointments WHERE user_id = %s ORDER BY created_at DESC;", (user_id,))
        appointments = cur.fetchall()
    except Exception:
        pass
    finally:
        if conn:
            conn.close()

    return render_template("upload_work.html", appointments=appointments)

@app.route("/work")
@login_required
def my_work():
    user_id = session["user_id"]
    work_items = []
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT w.*, a.appointment_date, a.service AS app_service
            FROM work w
            LEFT JOIN appointments a ON w.appointment_id = a.id
            WHERE w.user_id = %s
            ORDER BY w.created_at DESC;
            """,
            (user_id,)
        )
        work_items = cur.fetchall()
    except Exception as e:
        flash("Could not retrieve work items.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("my_work.html", work_items=work_items)

@app.route("/pay/<int:payment_id>", methods=["GET", "POST"])
@login_required
def pay(payment_id):
    user_id = session["user_id"]
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM payments WHERE id = %s AND user_id = %s;", (payment_id, user_id))
        payment = cur.fetchone()

        if not payment:
            flash("Payment record not found or access denied.", "danger")
            return redirect(url_for("my_appointments"))

        if request.method == "POST":
            payment_method = request.form.get("payment_method", "Online")
            cur.execute(
                """
                UPDATE payments
                SET payment_status = 'Paid', payment_method = %s, payment_date = CURRENT_TIMESTAMP
                WHERE id = %s;
                """,
                (payment_method, payment_id)
            )
            conn.commit()
            flash("Payment completed successfully! Invoice is now ready.", "success")
            return redirect(url_for("view_invoice", payment_id=payment_id))

        return render_template("invoice/pay.html", payment=payment)
    except Exception as e:
        flash("Error processing payment. Please try again.", "danger")
        return redirect(url_for("my_appointments"))
    finally:
        if conn:
            conn.close()

@app.route("/invoice/<int:payment_id>")
@login_required
def view_invoice(payment_id):
    user_id = session["user_id"]
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT p.*, u.name AS customer_name, u.email, u.phone, u.address,
                   a.appointment_date, a.appointment_time
            FROM payments p
            JOIN users u ON p.user_id = u.id
            JOIN appointments a ON p.appointment_id = a.id
            WHERE p.id = %s AND p.user_id = %s;
            """,
            (payment_id, user_id)
        )
        invoice = cur.fetchone()

        if not invoice:
            flash("Invoice not found or access restricted.", "danger")
            return redirect(url_for("my_appointments"))

        return render_template("invoice/invoice.html", invoice=invoice)
    except Exception as e:
        flash("Could not display invoice.", "danger")
        return redirect(url_for("my_appointments"))
    finally:
        if conn:
            conn.close()

@app.route("/uploads/<folder>/<filename>")
def get_uploaded_file(folder, filename):
    safe_folders = {"photos", "videos", "completed"}
    if folder not in safe_folders:
        abort(404)

    target_dir = os.path.join(UPLOAD_FOLDER, folder)
    return send_from_directory(target_dir, filename)

# ----------------- Admin Routes -----------------
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if "admin_id" in session:
        return redirect(url_for("admin_dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM admins WHERE username = %s;", (username,))
            admin = cur.fetchone()

            if admin and check_password_hash(admin["password_hash"], password):
                session["admin_id"] = admin["id"]
                session["admin_username"] = admin["username"]
                flash("Welcome to SnepStudio Admin Dashboard.", "success")
                return redirect(url_for("admin_dashboard"))
            else:
                flash("Invalid admin credentials.", "danger")
        except Exception as e:
            flash("Something went wrong during admin authentication.", "danger")
        finally:
            if conn:
                conn.close()

    return render_template("admin/login.html")

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_id", None)
    session.pop("admin_username", None)
    flash("Admin logged out successfully.", "info")
    return redirect(url_for("admin_login"))

@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    conn = None
    stats = {
        "total_users": 0,
        "total_appointments": 0,
        "pending_appointments": 0,
        "approved_appointments": 0,
        "completed_appointments": 0,
        "pending_work": 0,
        "completed_work": 0,
        "total_payments": 0,
        "total_revenue": 0.0
    }
    recent_appointments = []

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT COUNT(*) AS count FROM users;")
        stats["total_users"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments;")
        stats["total_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Pending';")
        stats["pending_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Approved';")
        stats["approved_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Completed';")
        stats["completed_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM work WHERE status = 'Pending';")
        stats["pending_work"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM work WHERE status = 'Completed';")
        stats["completed_work"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS revenue FROM payments WHERE payment_status = 'Paid';")
        pay_res = cur.fetchone()
        stats["total_payments"] = pay_res["count"]
        stats["total_revenue"] = float(pay_res["revenue"])

        cur.execute(
            """
            SELECT a.*, u.name AS user_name, u.email AS user_email, p.payment_status
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN payments p ON a.id = p.appointment_id
            ORDER BY a.created_at DESC LIMIT 6;
            """
        )
        recent_appointments = cur.fetchall()
    except Exception as e:
        flash("Could not fetch admin statistics.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("admin/dashboard.html", stats=stats, recent_appointments=recent_appointments)

@app.route("/admin/users")
@admin_required
def admin_users():
    search = request.args.get("search", "").strip()
    users = []
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if search:
            cur.execute(
                """
                SELECT id, name, email, phone, address, created_at
                FROM users
                WHERE name ILIKE %s OR email ILIKE %s OR phone ILIKE %s
                ORDER BY created_at DESC;
                """,
                (f"%{search}%", f"%{search}%", f"%{search}%")
            )
        else:
            cur.execute("SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC;")

        users = cur.fetchall()
    except Exception as e:
        flash("Could not retrieve customer list.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("admin/users.html", users=users, search=search)

@app.route("/admin/appointments")
@admin_required
def admin_appointments():
    search = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "").strip()
    appointments = []
    conn = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT a.*, u.name AS user_name, u.email AS user_email, p.payment_status, p.id AS payment_id, p.amount
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN payments p ON a.id = p.appointment_id
            WHERE 1=1
        """
        params = []

        if status_filter:
            query += " AND a.status = %s"
            params.append(status_filter)

        if search:
            query += " AND (a.customer_name ILIKE %s OR a.phone ILIKE %s OR a.service ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        query += " ORDER BY a.appointment_date DESC, a.appointment_time DESC;"
        cur.execute(query, tuple(params))
        appointments = cur.fetchall()
    except Exception as e:
        flash("Could not retrieve appointments.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("admin/appointments.html", appointments=appointments, search=search, status_filter=status_filter)

@app.route("/admin/appointment/<int:id>/status", methods=["POST"])
@admin_required
def admin_update_appointment_status(id):
    new_status = request.form.get("status", "").strip()
    allowed_statuses = {"Pending", "Approved", "In Progress", "Completed", "Rejected", "Cancelled"}

    if new_status in allowed_statuses:
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("UPDATE appointments SET status = %s WHERE id = %s;", (new_status, id))
            conn.commit()
            flash(f"Appointment #{id} status updated to {new_status}.", "success")
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Failed to update appointment status.", "danger")
        finally:
            if conn:
                conn.close()
    else:
        flash("Invalid appointment status.", "danger")

    return redirect(url_for("admin_appointments"))

@app.route("/admin/work")
@admin_required
def admin_work():
    status_filter = request.args.get("status", "").strip()
    work_items = []
    conn = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT w.*, u.name AS customer_name, u.email AS customer_email, a.appointment_date
            FROM work w
            JOIN users u ON w.user_id = u.id
            LEFT JOIN appointments a ON w.appointment_id = a.id
            WHERE 1=1
        """
        params = []
        if status_filter:
            query += " AND w.status = %s"
            params.append(status_filter)

        query += " ORDER BY w.created_at DESC;"
        cur.execute(query, tuple(params))
        work_items = cur.fetchall()
    except Exception as e:
        flash("Could not retrieve work requests.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("admin/work.html", work_items=work_items, status_filter=status_filter)

@app.route("/admin/work/<int:id>/status", methods=["POST"])
@admin_required
def admin_update_work_status(id):
    new_status = request.form.get("status", "").strip()
    if new_status in {"Pending", "In Progress", "Completed"}:
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            if new_status == "Completed":
                cur.execute("UPDATE work SET status = %s, completed_at = CURRENT_TIMESTAMP WHERE id = %s;", (new_status, id))
            else:
                cur.execute("UPDATE work SET status = %s WHERE id = %s;", (new_status, id))
            conn.commit()
            flash(f"Work #{id} marked as {new_status}.", "success")
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Failed to update work status.", "danger")
        finally:
            if conn:
                conn.close()

    return redirect(url_for("admin_work"))

@app.route("/admin/work/<int:id>/upload", methods=["POST"])
@admin_required
def admin_upload_completed_work(id):
    if "completed_file" not in request.files:
        flash("No completed file attached.", "danger")
        return redirect(url_for("admin_work"))

    file = request.files["completed_file"]
    if file.filename == "":
        flash("No file selected.", "danger")
        return redirect(url_for("admin_work"))

    if not allowed_file(file.filename):
        flash("Invalid file extension. Allowed: JPG, PNG, WEBP, MP4, MOV.", "danger")
        return redirect(url_for("admin_work"))

    orig_name = secure_filename(file.filename)
    unique_name = f"completed_{id}_{int(time.time())}_{orig_name}"
    save_path = os.path.join(COMPLETED_FOLDER, unique_name)
    file.save(save_path)

    rel_path = f"completed/{unique_name}"

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            UPDATE work
            SET completed_filename = %s, completed_filepath = %s, status = 'Completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = %s;
            """,
            (orig_name, rel_path, id)
        )
        conn.commit()
        flash(f"Completed file uploaded for Work #{id}. Status marked as Completed.", "success")
    except Exception as e:
        if conn:
            conn.rollback()
        flash("Failed to save completed file.", "danger")
    finally:
        if conn:
            conn.close()

    return redirect(url_for("admin_work"))

@app.route("/admin/payments")
@admin_required
def admin_payments():
    payments = []
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            SELECT p.*, u.name AS customer_name, u.email AS customer_email
            FROM payments p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.payment_date DESC;
            """
        )
        payments = cur.fetchall()
    except Exception as e:
        flash("Could not retrieve payments records.", "danger")
    finally:
        if conn:
            conn.close()

    return render_template("admin/payments.html", payments=payments)

@app.route("/admin/payment/<int:id>/status", methods=["POST"])
@admin_required
def admin_update_payment_status(id):
    new_status = request.form.get("status", "").strip()
    if new_status in {"Pending", "Paid", "Failed", "Refunded"}:
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("UPDATE payments SET payment_status = %s WHERE id = %s;", (new_status, id))
            conn.commit()
            flash(f"Payment #{id} status updated to {new_status}.", "success")
        except Exception as e:
            if conn:
                conn.rollback()
            flash("Failed to update payment status.", "danger")
        finally:
            if conn:
                conn.close()

    return redirect(url_for("admin_payments"))

# Initialize DB on start
with app.app_context():
    try:
        init_db()
    except Exception as e:
        print(f"[Warning] Database auto-init skipped or deferred: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)`
  },
  {
    path: "static/style.css",
    category: "Styles & JS",
    content: `/* SnepStudio - Photography Management Stylesheet */
:root {
  --bg-dark: #0f1115;
  --bg-card: #181b22;
  --bg-card-hover: #222631;
  --border-color: #2e3545;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --primary: #eab308;
  --primary-hover: #ca8a04;
  --primary-light: rgba(234, 179, 8, 0.12);
  --accent: #38bdf8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 14px rgba(0,0,0,0.35);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
  --transition: all 0.25s ease-in-out;
  --font-main: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font-main);
  background-color: var(--bg-dark);
  color: var(--text-main);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
a { color: var(--primary); text-decoration: none; transition: var(--transition); }
a:hover { color: var(--primary-hover); }

.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.main-content { flex: 1; padding: 40px 0 60px; }

/* Navbar */
.navbar {
  background-color: rgba(15, 17, 21, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 16px 0;
}
.nav-container { display: flex; align-items: center; justify-content: space-between; }
.brand-logo { display: flex; align-items: center; gap: 10px; font-size: 1.4rem; font-weight: 700; color: var(--text-main); }
.brand-logo span { color: var(--primary); }
.brand-logo .lens-icon {
  display: inline-block; width: 24px; height: 24px; border: 3px solid var(--primary); border-radius: 50%; position: relative;
}
.brand-logo .lens-icon::after {
  content: ''; position: absolute; top: 4px; left: 4px; width: 10px; height: 10px; background: var(--primary); border-radius: 50%;
}
.nav-links { display: flex; align-items: center; list-style: none; gap: 24px; }
.nav-links a { color: var(--text-muted); font-weight: 500; font-size: 0.95rem; padding: 6px 12px; border-radius: var(--radius-sm); }
.nav-links a:hover, .nav-links a.active { color: var(--text-main); background: rgba(255, 255, 255, 0.05); }
.nav-btn { background: var(--primary); color: #111 !important; font-weight: 600 !important; padding: 8px 18px !important; border-radius: var(--radius-sm); }
.nav-btn:hover { background: var(--primary-hover); color: #000 !important; }
.nav-toggle { display: none; background: none; border: none; color: var(--text-main); font-size: 1.6rem; cursor: pointer; }

/* Alerts */
.alerts-wrapper { margin: 20px 0; }
.alert {
  padding: 14px 20px; border-radius: var(--radius-sm); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; font-size: 0.95rem; font-weight: 500;
}
.alert-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.alert-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.alert-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.alert-info { background: rgba(6, 182, 212, 0.15); color: #38bdf8; border: 1px solid rgba(6, 182, 212, 0.3); }
.alert-close { background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; }

/* Hero */
.hero {
  position: relative; padding: 90px 0 100px; text-align: center;
  background: radial-gradient(circle at center, rgba(35, 40, 52, 0.8) 0%, rgba(15, 17, 21, 1) 75%);
  border-bottom: 1px solid var(--border-color);
}
.hero-tagline { color: var(--primary); text-transform: uppercase; font-weight: 700; letter-spacing: 2px; font-size: 0.85rem; margin-bottom: 16px; }
.hero h1 { font-size: 3.4rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 18px; color: #fff; }
.hero p.lead { font-size: 1.25rem; color: var(--text-muted); max-width: 650px; margin: 0 auto 36px; }
.hero-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 26px; font-size: 0.95rem; font-weight: 600; border-radius: var(--radius-sm); cursor: pointer; border: none; transition: var(--transition); text-decoration: none;
}
.btn-primary { background-color: var(--primary); color: #111827; }
.btn-primary:hover { background-color: var(--primary-hover); color: #000; transform: translateY(-1px); }
.btn-outline { background: transparent; color: var(--text-main); border: 1px solid var(--border-color); }
.btn-outline:hover { background: rgba(255, 255, 255, 0.08); border-color: var(--text-muted); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-success { background: var(--success); color: #fff; }
.btn-sm { padding: 6px 14px; font-size: 0.85rem; }

/* Services */
.section { padding: 70px 0; }
.section-header { text-align: center; margin-bottom: 50px; }
.section-header h2 { font-size: 2.2rem; font-weight: 700; color: #fff; margin-bottom: 12px; }
.section-header p { color: var(--text-muted); font-size: 1.05rem; max-width: 600px; margin: 0 auto; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; }
.service-card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 32px 24px; transition: var(--transition); display: flex; flex-direction: column;
}
.service-card:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.service-icon { width: 52px; height: 52px; border-radius: var(--radius-sm); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; }
.service-card h3 { font-size: 1.35rem; font-weight: 600; margin-bottom: 10px; color: #fff; }
.service-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px; flex: 1; }
.service-pricing { margin-bottom: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
.price-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
.price-amount { font-size: 1.5rem; font-weight: 700; color: var(--primary); }

/* Steps */
.steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.step-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 30px 20px; text-align: center; }
.step-number { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: #111; font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
.step-card h3 { font-size: 1.15rem; margin-bottom: 8px; color: #fff; }
.step-card p { color: var(--text-muted); font-size: 0.9rem; }

/* Features & Contact */
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.feature-box { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; }
.feature-box h4 { font-size: 1.1rem; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.feature-box h4 span { color: var(--primary); }
.feature-box p { color: var(--text-muted); font-size: 0.9rem; }
.contact-container { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 40px; }
.contact-info h3 { font-size: 1.6rem; margin-bottom: 16px; color: #fff; }
.contact-item { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; color: var(--text-muted); }

/* Forms & Cards */
.card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 30px; box-shadow: var(--shadow-sm); }
.card-header { margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
.card-title { font-size: 1.4rem; font-weight: 700; color: #fff; }
.form-auth { max-width: 480px; margin: 40px auto; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; color: var(--text-main); }
.form-control { width: 100%; padding: 12px 14px; background: #12141a; border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-main); font-family: inherit; font-size: 0.95rem; transition: var(--transition); }
.form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.2); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Dashboard & Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 36px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 22px; transition: var(--transition); }
.stat-card:hover { border-color: var(--primary); }
.stat-title { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.stat-value { font-size: 2.2rem; font-weight: 800; color: #fff; }
.stat-value.highlight { color: var(--primary); }
.dashboard-quick-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 30px; }

/* Tables & Badges */
.table-responsive { width: 100%; overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; }
.table th { background: #14171e; color: var(--text-muted); font-weight: 600; padding: 14px 16px; border-bottom: 1px solid var(--border-color); text-transform: uppercase; font-size: 0.8rem; }
.table td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); color: var(--text-main); vertical-align: middle; }
.table tr:hover td { background: rgba(255, 255, 255, 0.02); }

.badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; }
.badge-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-approved { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
.badge-in-progress { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
.badge-completed { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-rejected, .badge-failed, .badge-cancelled { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-paid { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

/* Invoice */
.invoice-card { max-width: 800px; margin: 30px auto; background: #fff; color: #1f2937; border-radius: var(--radius-md); padding: 40px; box-shadow: var(--shadow-lg); }
.invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px; }
.invoice-logo h2 { font-size: 1.8rem; color: #111827; }
.invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
.invoice-table th { background: #f3f4f6; color: #374151; padding: 12px; text-align: left; }
.invoice-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; }
.invoice-total { text-align: right; font-size: 1.4rem; font-weight: 700; color: #111827; margin-bottom: 30px; }

/* Footer */
.footer { background: #090a0d; border-top: 1px solid var(--border-color); padding: 40px 0 24px; color: var(--text-muted); font-size: 0.9rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; margin-bottom: 30px; }
.footer h4 { color: #fff; margin-bottom: 16px; font-size: 1.05rem; }
.footer-links { list-style: none; }
.footer-links li { margin-bottom: 8px; }
.footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid #1a1e28; font-size: 0.85rem; }

@media (max-width: 868px) {
  .hero h1 { font-size: 2.4rem; }
  .nav-toggle { display: block; }
  .nav-links { display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-card); flex-direction: column; padding: 20px; }
  .nav-links.active { display: flex; }
  .contact-container, .footer-grid, .form-row { grid-template-columns: 1fr; }
}`
  },
  {
    path: "static/script.js",
    category: "Styles & JS",
    content: `// SnepStudio Client-side Script
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("active"));
  }

  document.querySelectorAll(".alert-close").forEach(btn => {
    btn.addEventListener("click", () => {
      const alert = btn.closest(".alert");
      if (alert) { alert.style.opacity = "0"; setTimeout(() => alert.remove(), 250); }
    });
  });

  setTimeout(() => {
    document.querySelectorAll(".alert").forEach(alert => {
      alert.style.transition = "opacity 0.5s ease";
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 500);
    });
  }, 5000);

  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          alert("Selected file is too large! Maximum allowed size is 50MB.");
          fileInput.value = "";
          return;
        }
        const validExtensions = ["jpg", "jpeg", "png", "webp", "mp4", "mov"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
          alert("Invalid file format. Please upload JPG, PNG, WEBP, MP4, or MOV.");
          fileInput.value = "";
        }
      }
    });
  }

  document.querySelectorAll("[data-confirm]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (!confirm(el.getAttribute("data-confirm") || "Are you sure?")) {
        e.preventDefault();
      }
    });
  });
});`
  },
  {
    path: "templates/base.html",
    category: "Templates",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}SnepStudio - Photography & Editing Management System{% endblock %}</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
  <header class="navbar">
    <div class="container nav-container">
      <a href="{{ url_for('index') }}" class="brand-logo">
        <span class="lens-icon"></span>
        Snep<span>Studio</span>
      </a>

      <button class="nav-toggle" aria-label="Toggle navigation">&#9776;</button>

      <ul class="nav-links">
        {% if session.get('user_id') %}
          <li><a href="{{ url_for('dashboard') }}">Dashboard</a></li>
          <li><a href="{{ url_for('my_appointments') }}">My Appointments</a></li>
          <li><a href="{{ url_for('my_work') }}">My Work</a></li>
          <li><a href="{{ url_for('upload_work') }}">Upload Work</a></li>
          <li><a href="{{ url_for('book_appointment') }}" class="nav-btn">Book Appointment</a></li>
          <li><a href="{{ url_for('logout') }}" style="color: #ef4444;">Logout</a></li>
        {% elif session.get('admin_id') %}
          <li><a href="{{ url_for('admin_dashboard') }}">Admin Dashboard</a></li>
          <li><a href="{{ url_for('admin_users') }}">Users</a></li>
          <li><a href="{{ url_for('admin_appointments') }}">Appointments</a></li>
          <li><a href="{{ url_for('admin_work') }}">Work</a></li>
          <li><a href="{{ url_for('admin_payments') }}">Payments</a></li>
          <li><a href="{{ url_for('admin_logout') }}" style="color: #ef4444;">Logout</a></li>
        {% else %}
          <li><a href="{{ url_for('index') }}">Home</a></li>
          <li><a href="{{ url_for('index') }}#services">Services</a></li>
          <li><a href="{{ url_for('index') }}#about">About</a></li>
          <li><a href="{{ url_for('index') }}#contact">Contact</a></li>
          <li><a href="{{ url_for('login') }}">Login</a></li>
          <li><a href="{{ url_for('register') }}" class="nav-btn">Register</a></li>
        {% endif %}
      </ul>
    </div>
  </header>

  <div class="container alerts-wrapper">
    {% with messages = get_flashed_messages(with_categories=true) %}
      {% if messages %}
        {% for category, message in messages %}
          <div class="alert alert-{{ category }}">
            <span>{{ message }}</span>
            <button class="alert-close">&times;</button>
          </div>
        {% endfor %}
      {% endif %}
    {% endwith %}
  </div>

  <main class="main-content">
    {% block content %}{% endblock %}
  </main>

  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <div class="brand-logo" style="margin-bottom: 12px;">
          <span class="lens-icon"></span>
          Snep<span>Studio</span>
        </div>
        <p style="max-width: 320px; font-size: 0.9rem;">
          Professional Photography, Photoshoots, Video Editing and Photo Editing Management System.
        </p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="{{ url_for('index') }}">Home</a></li>
          <li><a href="{{ url_for('index') }}#services">Services</a></li>
          <li><a href="{{ url_for('book_appointment') }}">Book Appointment</a></li>
        </ul>
      </div>
      <div>
        <h4>Admin & Support</h4>
        <ul class="footer-links">
          <li><a href="{{ url_for('admin_login') }}">Admin Portal</a></li>
          <li><a href="{{ url_for('login') }}">Client Login</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; 2026 SnepStudio. All rights reserved. College Project Demonstration.</p>
    </div>
  </footer>
  <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>`
  },
  {
    path: "templates/index.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}SnepStudio - Capture Your Moments{% endblock %}
{% block content %}
<section class="hero">
  <div class="container">
    <div class="hero-tagline">Studio &middot; Production &middot; Post-Processing</div>
    <h1>Capture Your Moments</h1>
    <p class="lead">Professional Photography, Photoshoots &amp; Editing Services</p>
    <div class="hero-actions">
      <a href="{{ url_for('book_appointment') }}" class="btn btn-primary">Book Your Appointment</a>
      <a href="#services" class="btn btn-outline">Explore Services</a>
    </div>
  </div>
</section>

<section id="services" class="section">
  <div class="container">
    <div class="section-header">
      <h2>Our Photography &amp; Editing Services</h2>
      <p>Transparent pricing, dedicated artistic vision, and rapid turnaround for all your visual needs.</p>
    </div>
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon">&#128247;</div>
        <h3>Photography</h3>
        <p>Professional photography for personal and special occasions.</p>
        <div class="service-pricing">
          <div class="price-label">Starting From</div>
          <div class="price-amount">&#8377;999</div>
        </div>
        <a href="{{ url_for('book_appointment') }}?service=Photography" class="btn btn-outline">Book Now</a>
      </div>
      <div class="service-card">
        <div class="service-icon">&#128141;</div>
        <h3>Wedding Shoot</h3>
        <p>Photography and videography for weddings.</p>
        <div class="service-pricing">
          <div class="price-label">Starting From</div>
          <div class="price-amount">&#8377;9,999</div>
        </div>
        <a href="{{ url_for('book_appointment') }}?service=Wedding Shoot" class="btn btn-outline">Book Now</a>
      </div>
      <div class="service-card">
        <div class="service-icon">&#10084;</div>
        <h3>Pre-Wedding Shoot</h3>
        <p>Creative pre-wedding photography.</p>
        <div class="service-pricing">
          <div class="price-label">Starting From</div>
          <div class="price-amount">&#8377;4,999</div>
        </div>
        <a href="{{ url_for('book_appointment') }}?service=Pre-Wedding Shoot" class="btn btn-outline">Book Now</a>
      </div>
      <div class="service-card">
        <div class="service-icon">&#127912;</div>
        <h3>Photo Editing</h3>
        <p>Professional editing of customer-provided photographs.</p>
        <div class="service-pricing">
          <div class="price-label">Pricing</div>
          <div class="price-amount">&#8377;99 <span style="font-size: 0.9rem; color: var(--text-muted);">per photo</span></div>
        </div>
        <a href="{{ url_for('book_appointment') }}?service=Photo Editing" class="btn btn-outline">Book Now</a>
      </div>
      <div class="service-card">
        <div class="service-icon">&#127916;</div>
        <h3>Video Editing</h3>
        <p>Professional editing of customer-provided videos.</p>
        <div class="service-pricing">
          <div class="price-label">Pricing</div>
          <div class="price-amount">&#8377;499 <span style="font-size: 0.9rem; color: var(--text-muted);">per video</span></div>
        </div>
        <a href="{{ url_for('book_appointment') }}?service=Video Editing" class="btn btn-outline">Book Now</a>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background: rgba(24, 27, 34, 0.5);">
  <div class="container">
    <div class="section-header">
      <h2>How It Works</h2>
      <p>Four simple steps from reservation to high-resolution asset delivery.</p>
    </div>
    <div class="steps-grid">
      <div class="step-card"><div class="step-number">1</div><h3>Register</h3><p>Create your free account.</p></div>
      <div class="step-card"><div class="step-number">2</div><h3>Book a Service</h3><p>Select date and service slot.</p></div>
      <div class="step-card"><div class="step-number">3</div><h3>Upload Photos/Videos</h3><p>Submit raw files directly.</p></div>
      <div class="step-card"><div class="step-number">4</div><h3>Receive Completed Work</h3><p>Download full-res masters.</p></div>
    </div>
  </div>
</section>

<section id="about" class="section">
  <div class="container">
    <div class="section-header">
      <h2>About SnepStudio</h2>
      <p>SnepStudio is a simple photography and editing management platform designed to make photography bookings, editing requests and customer work management easier.</p>
    </div>
  </div>
</section>

<section id="contact" class="section" style="border-top: 1px solid var(--border-color);">
  <div class="container">
    <div class="contact-container">
      <div class="contact-info">
        <h3>Contact SnepStudio</h3>
        <p>Email: support@snepstudio.com<br>Phone: +91 XXXXX XXXXX<br>Location: India</p>
      </div>
    </div>
  </div>
</section>
{% endblock %}`
  },
  {
    path: "templates/register.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}Register - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div class="card form-auth">
    <div class="card-header text-center" style="text-align: center;">
      <h2 class="card-title">Create Your Client Account</h2>
    </div>
    <form method="POST" action="{{ url_for('register') }}">
      <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" name="name" required></div>
      <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" name="email" required></div>
      <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-control" name="password" minlength="6" required></div>
      <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" class="form-control" name="phone" required></div>
      <div class="form-group"><label class="form-label">Address</label><textarea class="form-control" name="address" rows="3" required></textarea></div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Complete Registration</button>
      <div style="text-align: center; margin-top: 15px;"><a href="{{ url_for('login') }}">Already registered? Login</a></div>
    </form>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/login.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}Login - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div class="card form-auth">
    <div class="card-header text-center" style="text-align: center;">
      <h2 class="card-title">Client Login</h2>
    </div>
    <form method="POST" action="{{ url_for('login') }}">
      <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" name="email" required></div>
      <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-control" name="password" required></div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
      <div style="text-align: center; margin-top: 15px;"><a href="{{ url_for('register') }}">Need an account? Register</a></div>
    </form>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/dashboard.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}Dashboard - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <h2>Welcome, {{ session.get('user_name') }}</h2>
    <a href="{{ url_for('book_appointment') }}" class="btn btn-primary">&#43; Book Appointment</a>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-title">Total Appointments</div><div class="stat-value">{{ stats.total_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Pending Appointments</div><div class="stat-value highlight">{{ stats.pending_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Approved Appointments</div><div class="stat-value">{{ stats.approved_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Completed Work</div><div class="stat-value">{{ stats.completed_work }}</div></div>
    <div class="stat-card"><div class="stat-title">Pending Payments</div><div class="stat-value">{{ stats.pending_payments }}</div></div>
  </div>
  <div class="dashboard-quick-actions">
    <a href="{{ url_for('book_appointment') }}" class="btn btn-outline btn-sm">Book Appointment</a>
    <a href="{{ url_for('my_appointments') }}" class="btn btn-outline btn-sm">My Appointments</a>
    <a href="{{ url_for('upload_work') }}" class="btn btn-outline btn-sm">Upload Photos/Videos</a>
    <a href="{{ url_for('my_work') }}" class="btn btn-outline btn-sm">View My Work</a>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/appointment.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}Book Appointment - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div class="card" style="max-width: 680px; margin: 0 auto;">
    <div class="card-header"><h2 class="card-title">Book an Appointment</h2></div>
    <form method="POST" action="{{ url_for('book_appointment') }}">
      <div class="form-group">
        <label class="form-label">Select Service</label>
        <select class="form-control" name="service" required>
          <option value="Photography">Photography (&#8377;999)</option>
          <option value="Wedding Shoot">Wedding Shoot (&#8377;9,999)</option>
          <option value="Pre-Wedding Shoot">Pre-Wedding Shoot (&#8377;4,999)</option>
          <option value="Photo Editing">Photo Editing (&#8377;99 per photo)</option>
          <option value="Video Editing">Video Editing (&#8377;499 per video)</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-control" name="appointment_date" required></div>
        <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-control" name="appointment_time" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Customer Name</label><input type="text" class="form-control" name="customer_name" value="{{ user_info.name or '' }}" required></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" name="phone" value="{{ user_info.phone or '' }}" required></div>
      </div>
      <div class="form-group"><label class="form-label">Address</label><textarea class="form-control" name="address" rows="2" required>{{ user_info.address or '' }}</textarea></div>
      <div class="form-group"><label class="form-label">Additional Message</label><textarea class="form-control" name="message" rows="3"></textarea></div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Confirm &amp; Book</button>
    </form>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/my_appointments.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}My Appointments - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div style="display:flex; justify-content:space-between; margin-bottom: 24px;">
    <h2>My Appointments</h2>
    <a href="{{ url_for('book_appointment') }}" class="btn btn-primary">Book Appointment</a>
  </div>
  <div class="card">
    <table class="table">
      <thead>
        <tr><th>ID</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Payment</th><th>Action</th></tr>
      </thead>
      <tbody>
        {% for a in appointments %}
        <tr>
          <td>#{{ a.id }}</td>
          <td>{{ a.service }}</td>
          <td>{{ a.appointment_date }} {{ a.appointment_time }}</td>
          <td><span class="badge badge-{{ a.status.lower().replace(' ', '-') }}">{{ a.status }}</span></td>
          <td>{{ a.payment_status }}</td>
          <td>
            {% if a.payment_status == 'Paid' %}
              <a href="{{ url_for('view_invoice', payment_id=a.payment_id) }}" class="btn btn-outline btn-sm">Invoice</a>
            {% else %}
              <a href="{{ url_for('pay', payment_id=a.payment_id) }}" class="btn btn-primary btn-sm">Pay</a>
            {% endif %}
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/upload_work.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}Upload Photos/Videos - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div class="card" style="max-width: 640px; margin: 0 auto;">
    <div class="card-header"><h2 class="card-title">Upload Photos or Videos for Editing</h2></div>
    <form method="POST" action="{{ url_for('upload_work') }}" enctype="multipart/form-data">
      <div class="form-group">
        <label class="form-label">Associate with Appointment (Optional)</label>
        <select class="form-control" name="appointment_id">
          <option value="">-- General Upload --</option>
          {% for appt in appointments %}
            <option value="{{ appt.id }}">Appt #{{ appt.id }} - {{ appt.service }}</option>
          {% endfor %}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">File Type</label>
        <select class="form-control" name="file_type">
          <option value="Photo">Photo (JPG, JPEG, PNG, WEBP)</option>
          <option value="Video">Video (MP4, MOV)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Select File (Max 50MB)</label>
        <input type="file" class="form-control" name="file" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description / Editing Instructions</label>
        <textarea class="form-control" name="description" rows="3"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Upload Media</button>
    </form>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/my_work.html",
    category: "Templates",
    content: `{% extends "base.html" %}
{% block title %}My Work - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <h2>My Editing Work</h2>
  <div class="card" style="margin-top: 20px;">
    <table class="table">
      <thead><tr><th>Work ID</th><th>Service</th><th>Original File</th><th>Status</th><th>Completed File</th><th>Date</th></tr></thead>
      <tbody>
        {% for w in work_items %}
        <tr>
          <td>#{{ w.id }}</td>
          <td>{{ w.service }}</td>
          <td>{{ w.original_filename }}</td>
          <td><span class="badge badge-{{ w.status.lower().replace(' ', '-') }}">{{ w.status }}</span></td>
          <td>
            {% if w.status == 'Completed' and w.completed_filepath %}
              <a href="{{ url_for('get_uploaded_file', folder='completed', filename=w.completed_filepath.split('/')[1]) }}" class="btn btn-success btn-sm">Download</a>
            {% else %}
              <span style="color: var(--text-muted);">Processing...</span>
            {% endif %}
          </td>
          <td>{{ w.created_at.strftime('%Y-%m-%d') }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/invoice/invoice.html",
    category: "Templates",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #INV-{{ invoice.id }} - SnepStudio</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body style="background:#0f1115; padding: 40px 0;">
  <div class="container">
    <div style="max-width: 800px; margin: 0 auto 20px; display: flex; justify-content: space-between;">
      <a href="{{ url_for('my_appointments') }}" class="btn btn-outline btn-sm">&larr; Back</a>
      <button onclick="window.print()" class="btn btn-primary btn-sm btn-print">Print Invoice</button>
    </div>
    <div class="invoice-card">
      <div class="invoice-header">
        <div class="invoice-logo">
          <h2>SnepStudio</h2>
          <p>Photography &amp; Editing Services</p>
        </div>
        <div style="text-align: right;">
          <h3>INVOICE</h3>
          <div>Invoice Number: INV-{{ "%05d" % invoice.id }}</div>
          <div>Payment Date: {{ invoice.payment_date.strftime('%Y-%m-%d') if invoice.payment_date else 'Pending' }}</div>
          <div>Status: {{ invoice.payment_status }}</div>
        </div>
      </div>
      <div class="invoice-grid">
        <div>
          <h4>Customer Details</h4>
          <p><strong>{{ invoice.customer_name }}</strong></p>
          <p>{{ invoice.email }} | {{ invoice.phone }}</p>
        </div>
        <div style="text-align: right;">
          <h4>Booking Details</h4>
          <p>Service: {{ invoice.service }}</p>
          <p>Appointment Date: {{ invoice.appointment_date }}</p>
        </div>
      </div>
      <table class="invoice-table">
        <thead><tr><th>Service</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>
          <tr><td>{{ invoice.service }}</td><td style="text-align:right;">&#8377;{{ "%.2f"|format(invoice.amount) }}</td></tr>
        </tbody>
      </table>
      <div class="invoice-total">Grand Total: &#8377;{{ "%.2f"|format(invoice.amount) }}</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    path: "templates/admin/login.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Login - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div class="card form-auth" style="border-color: var(--primary);">
    <div class="card-header text-center" style="text-align: center;">
      <h2 class="card-title">Admin Login</h2>
    </div>
    <form method="POST" action="{{ url_for('admin_login') }}">
      <div class="form-group"><label class="form-label">Username</label><input type="text" class="form-control" name="username" placeholder="admin" required></div>
      <div class="form-group"><label class="form-label">Password</label><input type="password" class="form-control" name="password" placeholder="admin123" required></div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
    </form>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/admin/dashboard.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Dashboard - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <h2>Admin Dashboard</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-title">Total Users</div><div class="stat-value">{{ stats.total_users }}</div></div>
    <div class="stat-card"><div class="stat-title">Total Appointments</div><div class="stat-value">{{ stats.total_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Pending Appointments</div><div class="stat-value highlight">{{ stats.pending_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Approved Appointments</div><div class="stat-value">{{ stats.approved_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Completed Appointments</div><div class="stat-value">{{ stats.completed_appointments }}</div></div>
    <div class="stat-card"><div class="stat-title">Pending Work</div><div class="stat-value highlight">{{ stats.pending_work }}</div></div>
    <div class="stat-card"><div class="stat-title">Completed Work</div><div class="stat-value">{{ stats.completed_work }}</div></div>
    <div class="stat-card"><div class="stat-title">Total Payments</div><div class="stat-value">{{ stats.total_payments }}</div></div>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/admin/users.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Users - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
    <h2>Registered Customers</h2>
    <form method="GET" action="{{ url_for('admin_users') }}">
      <input type="text" name="search" class="form-control" placeholder="Search..." value="{{ search }}">
    </form>
  </div>
  <div class="card">
    <table class="table">
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Registration Date</th></tr></thead>
      <tbody>
        {% for u in users %}
        <tr><td>#{{ u.id }}</td><td>{{ u.name }}</td><td>{{ u.email }}</td><td>{{ u.phone }}</td><td>{{ u.address }}</td><td>{{ u.created_at }}</td></tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/admin/appointments.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Appointments - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <h2>Manage Appointments</h2>
  <div class="card" style="margin-top: 20px;">
    <table class="table">
      <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Update Status</th></tr></thead>
      <tbody>
        {% for a in appointments %}
        <tr>
          <td>#{{ a.id }}</td>
          <td>{{ a.customer_name }}</td>
          <td>{{ a.service }}</td>
          <td>{{ a.appointment_date }} {{ a.appointment_time }}</td>
          <td><span class="badge badge-{{ a.status.lower().replace(' ', '-') }}">{{ a.status }}</span></td>
          <td>
            <form method="POST" action="{{ url_for('admin_update_appointment_status', id=a.id) }}" style="display:flex; gap:6px;">
              <select name="status" class="form-control" style="width:120px;">
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button type="submit" class="btn btn-outline btn-sm">Update</button>
            </form>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/admin/work.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Work - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <h2>Manage Editing Work Queue</h2>
  <div class="card" style="margin-top: 20px;">
    <table class="table">
      <thead><tr><th>Work ID</th><th>Customer</th><th>File</th><th>Status</th><th>Action / Upload Completed</th></tr></thead>
      <tbody>
        {% for w in work_items %}
        <tr>
          <td>#{{ w.id }}</td>
          <td>{{ w.customer_name }}</td>
          <td><a href="{{ url_for('get_uploaded_file', folder=w.original_filepath.split('/')[0], filename=w.original_filepath.split('/')[1]) }}" target="_blank">Download Raw</a></td>
          <td><span class="badge badge-{{ w.status.lower().replace(' ', '-') }}">{{ w.status }}</span></td>
          <td>
            <form method="POST" action="{{ url_for('admin_upload_completed_work', id=w.id) }}" enctype="multipart/form-data" style="display:flex; gap:6px;">
              <input type="file" name="completed_file" class="form-control" style="width:200px;" required>
              <button type="submit" class="btn btn-success btn-sm">Upload &amp; Complete</button>
            </form>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "templates/admin/payments.html",
    category: "Admin Templates",
    content: `{% extends "base.html" %}
{% block title %}Admin Payments - SnepStudio{% endblock %}
{% block content %}
<div class="container">
  <h2>Payment Transactions</h2>
  <div class="card" style="margin-top: 20px;">
    <table class="table">
      <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Update</th></tr></thead>
      <tbody>
        {% for p in payments %}
        <tr>
          <td>#{{ p.id }}</td>
          <td>{{ p.customer_name }}</td>
          <td>{{ p.service }}</td>
          <td>&#8377;{{ p.amount }}</td>
          <td>{{ p.payment_method }}</td>
          <td><span class="badge badge-{{ p.payment_status.lower() }}">{{ p.payment_status }}</span></td>
          <td>
            <form method="POST" action="{{ url_for('admin_update_payment_status', id=p.id) }}" style="display:flex; gap:6px;">
              <select name="status" class="form-control" style="width:110px;">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <button type="submit" class="btn btn-outline btn-sm">Save</button>
            </form>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </div>
</div>
{% endblock %}`
  },
  {
    path: "README.md",
    category: "Configuration & Docs",
    content: `# SnepStudio - Photography & Editing Management System

Built using Python Flask, PostgreSQL, HTML5, CSS3, JavaScript.

## Setup
\`\`\`bash
python -m venv venv
# On Windows: venv\\Scripts\\activate
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python app.py
\`\`\`

Default Admin: admin / admin123
URL: http://127.0.0.1:5000`
  }
];
