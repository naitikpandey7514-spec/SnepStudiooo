# SnepStudio - Photography & Editing Management System

SnepStudio is a comprehensive, production-ready web application designed for professional photography studios, photoshoot reservations, and digital photo/video post-production editing management. Built specifically for college project presentations, portfolio showcases, and real-world studio deployment using **Python Flask**, **PostgreSQL**, and modern responsive web technologies.

---

## 1. Project Overview

SnepStudio bridges the gap between photography clients and studio administrators:
- **Clients** can explore transparent service pricing, schedule on-location or studio photoshoots, upload high-resolution media for post-processing, monitor real-time editing workflows, simulate secure invoice payments, and download finalized master assets.
- **Studio Administrators** maintain complete oversight via a secure management dashboard: approving or adjusting booking schedules, reviewing uploaded raw assets, toggling editing states, attaching completed master files, managing client profiles, and tracking revenue.

---

## 2. Key Features

### Client Portal
- **User Registration & Authentication**: Secure sign-up with client contact details, encrypted sessions, and password hashing using Werkzeug.
- **Service Catalog**: Individual service rates (Photography, Wedding Shoot, Pre-Wedding Shoot, Photo Editing, Video Editing). No recurring subscriptions.
- **Appointment Booking**: Select session dates, preferred time slots, shoot venue addresses, and custom creative requirements.
- **Media Upload Center**: Securely upload raw images (`.jpg`, `.jpeg`, `.png`, `.webp`) and video footage (`.mp4`, `.mov`) with automatic size verification (up to 50MB).
- **Project Progress Tracker**: Real-time visibility into editing statuses (`Pending`, `In Progress`, `Completed`).
- **One-Click Master Asset Downloads**: Access and download finished, high-resolution edited files once released by the studio.
- **Simulated Payment Gateway & Tax Invoice**: Make simulated service payments across multiple modes (UPI, Card, Online, Cash) and generate clean, print-ready studio tax invoices.

### Studio Admin Management
- **Protected Admin Panel**: Dedicated administrative authentication separate from customer logins.
- **Studio Analytics**: Real-time KPI cards tracking total registered users, bookings, pending reviews, active editing queues, and collected revenue.
- **Client Directory**: Searchable list of all registered customers with full contact and billing details (passwords securely hidden).
- **Appointment Management**: Filter by status, search by customer, and transition bookings through `Pending` &rarr; `Approved` &rarr; `In Progress` &rarr; `Completed` or `Rejected`.
- **Post-Production Pipeline**: Download client-uploaded raw files, mark jobs `In Progress`, upload the final retouched files, and mark jobs `Completed`.
- **Payment & Revenue Tracking**: Audit financial records, verify payment status, and update receipt states.

---

## 3. Technology Stack

- **Backend Framework**: Python 3.10+ / Flask 3.0
- **Database**: PostgreSQL
- **Database Driver**: `psycopg2-binary` (parameterized queries for SQL injection prevention)
- **Templating**: Jinja2
- **Password Security**: `werkzeug.security` (`generate_password_hash`, `check_password_hash`)
- **Frontend**: HTML5, CSS3 (Custom Responsive Photography Theme), Vanilla JavaScript
- **Environment Management**: `python-dotenv`

---

## 4. Folder Structure

```text
SnepStudio/
│
├── app.py                     # Main Flask application and route handlers
├── database.py                # PostgreSQL connection manager and schema initialization
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variables template
├── README.md                  # Complete project documentation
│
├── uploads/                   # Media storage directory
│   ├── photos/                # Raw customer uploaded photos
│   ├── videos/                # Raw customer uploaded videos
│   └── completed/             # Studio completed edited masters
│
├── templates/                 # Jinja2 HTML templates
│   ├── base.html              # Base layout with navbar, alerts, and footer
│   ├── index.html             # Homepage with Hero, Services, About, and Contact
│   ├── register.html          # Client registration form
│   ├── login.html             # Client login form
│   ├── dashboard.html         # Client dashboard with quick stats
│   ├── appointment.html       # Appointment booking form
│   ├── my_appointments.html   # Customer appointments list and actions
│   ├── my_work.html           # Customer work list and download portal
│   ├── upload_work.html       # Media upload form with validation
│   │
│   ├── admin/
│   │   ├── login.html         # Admin login page
│   │   ├── dashboard.html     # Admin dashboard with system metrics
│   │   ├── users.html         # Registered customer directory
│   │   ├── appointments.html  # Appointment management and status updater
│   │   ├── work.html          # Post-production editing queue and file upload
│   │   └── payments.html      # Financial transaction management
│   │
│   └── invoice/
│       ├── invoice.html       # Printable tax invoice page
│       └── pay.html           # Simulated payment screen
│
└── static/
    ├── style.css              # Modern photography-themed stylesheet
    └── script.js              # Interactive client-side validation and toggles
```

---

## 5. PostgreSQL Installation

### On Ubuntu / Debian Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib libpq-dev
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### On Windows:
1. Download the official PostgreSQL installer from: https://www.postgresql.org/download/windows/
2. Run the installer and remember the superuser (`postgres`) password you configure during setup.
3. Keep default port `5432` selected.

### On macOS (Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

---

## 6. Database Creation

Open your terminal or `psql` command line tool and create the dedicated database:

```bash
# Enter the PostgreSQL interactive shell
psql -U postgres
```

Inside the PostgreSQL shell:
```sql
-- Create the SnepStudio database
CREATE DATABASE snepstudio;

-- Verify database creation
\l

-- Exit the psql shell
\q
```

---

## 7. Python Environment & Setup

Navigate to the project root directory in your terminal:

```bash
cd SnepStudio
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **On Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```
- **On Windows**:
  ```cmd
  venv\Scripts\activate
  ```

---

## 8. Installing Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

---

## 9. Environment Variables Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```ini
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/snepstudio
SECRET_KEY=your-random-secure-secret-key
PORT=5000
```

---

## 10. Running the Application

Initialize the database tables and start the Flask server:

```bash
python app.py
```

The application will initialize all PostgreSQL tables automatically and start the local server:
```text
 * Running on http://127.0.0.1:5000
 * Application ready for requests
```

Open your browser and navigate to:
```text
http://127.0.0.1:5000
```

---

## 11. Default Admin Credentials

The system automatically provisions a pre-configured studio administrator account upon initial database startup:

- **Admin Login URL**: `http://127.0.0.1:5000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

*(Passwords are stored as secure hashes using Werkzeug).*

---

## 12. Deployment Guide (Production / Online Hosting)

SnepStudio is deployment-ready for standard cloud hosting platforms such as **Render**, **Railway**, **Heroku**, or **Cloud Run / VPS**.

### Deploying on Render / Railway:
1. Create a managed **PostgreSQL instance** on your cloud provider. Copy the provided `Internal Database URL` or `External Database URL`.
2. Push your project repository to GitHub.
3. Create a **New Web Service** and link your repository.
4. Set Build Command:
   ```bash
   pip install -r requirements.txt
   ```
5. Set Start Command:
   ```bash
   gunicorn app:app
   ```
6. Add Environment Variables:
   - `DATABASE_URL`: Your cloud PostgreSQL connection string
   - `SECRET_KEY`: A strong random string
   - `PYTHON_VERSION`: `3.10.12` (or above)
7. Deploy. The tables and default administrator will automatically initialize on first boot!
