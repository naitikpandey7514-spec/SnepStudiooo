import os
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

        # Validation
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

            # Check if email exists
            cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
            if cur.fetchone():
                flash("Email already exists. Please use another email or login.", "warning")
                return render_template("register.html")

            # Hash password securely
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

        # Appointment statistics
        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s;", (user_id,))
        stats["total_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s AND status = 'Pending';", (user_id,))
        stats["pending_appointments"] = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM appointments WHERE user_id = %s AND status = 'Approved';", (user_id,))
        stats["approved_appointments"] = cur.fetchone()["count"]

        # Work statistics
        cur.execute("SELECT COUNT(*) AS count FROM work WHERE user_id = %s AND status = 'Completed';", (user_id,))
        stats["completed_work"] = cur.fetchone()["count"]

        # Payment statistics
        cur.execute("SELECT COUNT(*) AS count FROM payments WHERE user_id = %s AND payment_status = 'Pending';", (user_id,))
        stats["pending_payments"] = cur.fetchone()["count"]

        # Recent appointments
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

            # Insert appointment
            cur.execute(
                """
                INSERT INTO appointments (user_id, service, appointment_date, appointment_time, customer_name, phone, address, message, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Pending') RETURNING id;
                """,
                (user_id, service, appointment_date, appointment_time, customer_name, phone, address, message)
            )
            appointment_id = cur.fetchone()["id"]

            # Automatically create pending payment record
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

    # Pre-populate user info
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

        # Choose folder based on extension
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

        # Lookup service associated with appointment if provided
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

    # Get user's appointments for dropdown
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

# ----------------- Secure File Download -----------------
@app.route("/uploads/<folder>/<filename>")
def get_uploaded_file(folder, filename):
    safe_folders = {"photos", "videos", "completed"}
    if folder not in safe_folders:
        abort(404)

    target_dir = os.path.join(UPLOAD_FOLDER, folder)
    return send_from_directory(target_dir, filename)

# ----------------- Admin Authentication -----------------
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

# ----------------- Admin Dashboard & Operations -----------------
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
    app.run(host="0.0.0.0", port=port, debug=True)
