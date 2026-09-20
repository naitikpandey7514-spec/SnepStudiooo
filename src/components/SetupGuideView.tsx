import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, BookOpen, AlertCircle } from 'lucide-react';

export const SetupGuideView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Quick Launch Card */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4" /> Quick Run Commands
        </div>
        <h2 className="text-xl font-bold text-white mb-2">How to Run SnepStudio Locally in 4 Steps</h2>
        <p className="text-sm text-slate-400 mb-6">
          Clone or extract the project folder, set up your PostgreSQL database, and run the Python Flask server:
        </p>

        <div className="bg-[#0c0e12] border border-[#2e3545] rounded-lg p-4 font-mono text-xs text-slate-200 relative">
          <button
            onClick={() => copySnippet('quick-run', `python -m venv venv\nsource venv/bin/activate  # Or on Windows: venv\\Scripts\\activate\npip install -r requirements.txt\npython app.py`)}
            className="absolute top-3 right-3 bg-[#222735] hover:bg-[#2b3142] text-slate-300 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedId === 'quick-run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === 'quick-run' ? 'Copied' : 'Copy'}
          </button>
          <div className="text-slate-500"># 1. Create and activate virtual environment</div>
          <div className="text-yellow-400">python -m venv venv</div>
          <div className="text-slate-400">source venv/bin/activate  <span className="text-slate-500"># Windows: venv\Scripts\activate</span></div>
          <br />
          <div className="text-slate-500"># 2. Install dependencies</div>
          <div className="text-yellow-400">pip install -r requirements.txt</div>
          <br />
          <div className="text-slate-500"># 3. Start application</div>
          <div className="text-yellow-400">python app.py</div>
          <br />
          <div className="text-slate-500"># 4. Open in browser</div>
          <div className="text-sky-400">http://127.0.0.1:5000</div>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: PostgreSQL Setup */}
        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-yellow-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
            <h3 className="font-bold text-white text-base">PostgreSQL Database Setup</h3>
          </div>
          <p className="text-xs text-slate-400">
            Install PostgreSQL on your operating system and create the dedicated database:
          </p>
          <div className="bg-[#0c0e12] border border-[#2e3545] rounded-lg p-3 font-mono text-xs text-slate-300">
            <div className="text-slate-500"># Enter psql shell</div>
            <div>psql -U postgres</div>
            <div className="text-slate-500 mt-2"># Create the database</div>
            <div className="text-yellow-400">CREATE DATABASE snepstudio;</div>
            <div className="text-slate-500 mt-2"># Exit</div>
            <div>\q</div>
          </div>
          <div className="text-[11px] text-slate-400 bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded">
            <strong>Note:</strong> Table schemas and the default administrator account are automatically created on first boot when you run <code>python app.py</code>!
          </div>
        </div>

        {/* Step 2: Environment Configuration */}
        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-yellow-500 text-slate-950 font-bold flex items-center justify-center text-xs">2</span>
            <h3 className="font-bold text-white text-base">Configure .env File</h3>
          </div>
          <p className="text-xs text-slate-400">
            Copy <code>.env.example</code> to <code>.env</code> and set your database connection details:
          </p>
          <div className="bg-[#0c0e12] border border-[#2e3545] rounded-lg p-3 font-mono text-xs text-slate-300">
            <div className="text-slate-500"># Linux / macOS</div>
            <div>cp .env.example .env</div>
            <div className="text-slate-500 mt-2"># Windows PowerShell</div>
            <div>copy .env.example .env</div>
            <div className="text-slate-500 mt-2"># Contents of .env</div>
            <div className="text-yellow-400">DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snepstudio</div>
            <div className="text-yellow-400">SECRET_KEY=your_secret_key_here</div>
            <div className="text-yellow-400">PORT=5000</div>
          </div>
        </div>

        {/* Step 3: Default Admin Account */}
        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-yellow-500 text-slate-950 font-bold flex items-center justify-center text-xs">3</span>
            <h3 className="font-bold text-white text-base">Default Admin Access</h3>
          </div>
          <p className="text-xs text-slate-400">
            The system auto-provisions a studio administrator account for control panel access:
          </p>
          <div className="bg-[#0c0e12] border border-[#2e3545] rounded-lg p-3 text-xs flex flex-col gap-2">
            <div className="flex justify-between items-center py-1 border-b border-[#222735]">
              <span className="text-slate-400">Admin Login URL</span>
              <code className="text-sky-400">http://127.0.0.1:5000/admin/login</code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#222735]">
              <span className="text-slate-400">Username</span>
              <code className="text-yellow-400 font-bold">admin</code>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Password</span>
              <code className="text-yellow-400 font-bold">admin123</code>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            * Password is cryptographically salted &amp; hashed via Werkzeug security libraries.
          </p>
        </div>

        {/* Step 4: Cloud Deployment */}
        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-yellow-500 text-slate-950 font-bold flex items-center justify-center text-xs">4</span>
            <h3 className="font-bold text-white text-base">Production Cloud Deployment</h3>
          </div>
          <p className="text-xs text-slate-400">
            Ready for one-click deployment to <strong>Render</strong>, <strong>Railway</strong>, or <strong>Cloud Run</strong>:
          </p>
          <div className="bg-[#0c0e12] border border-[#2e3545] rounded-lg p-3 text-xs flex flex-col gap-2 font-mono">
            <div><span className="text-slate-400">Build Command: </span><span className="text-yellow-400">pip install -r requirements.txt</span></div>
            <div><span className="text-slate-400">Start Command: </span><span className="text-yellow-400">gunicorn app:app</span></div>
            <div><span className="text-slate-400">Env Vars: </span><span className="text-sky-400">DATABASE_URL, SECRET_KEY</span></div>
          </div>
        </div>
      </div>

      {/* College Project Viva / Defense Helper */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" /> Academic Presentation &amp; Viva Insights
        </div>
        <h3 className="text-lg font-bold text-white mb-4">Key Technical Answers for College Evaluation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <h4 className="font-bold text-yellow-300 mb-1">Why PostgreSQL instead of MySQL or SQLite?</h4>
            <p className="text-slate-400 leading-relaxed">
              PostgreSQL offers superior transactional integrity (ACID compliance), native timestamp &amp; JSON handling, robust concurrent connection pooling, and strict schema constraints that prevent corrupted appointment and payment ledgers.
            </p>
          </div>
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <h4 className="font-bold text-yellow-300 mb-1">How is SQL Injection prevented?</h4>
            <p className="text-slate-400 leading-relaxed">
              All queries in <code>app.py</code> and <code>database.py</code> use parameterized placeholders (<code>%s</code> with tuples in psycopg2), ensuring user inputs are never concatenated directly into raw SQL strings.
            </p>
          </div>
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <h4 className="font-bold text-yellow-300 mb-1">How are media uploads safeguarded?</h4>
            <p className="text-slate-400 leading-relaxed">
              Uploaded files are checked for allowed extensions (<code>.jpg</code>, <code>.png</code>, <code>.mp4</code>, <code>.mov</code>), sanitized using <code>werkzeug.utils.secure_filename</code>, prefixed with user ID and UNIX epoch to prevent filename collisions, and partitioned into dedicated subfolders.
            </p>
          </div>
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <h4 className="font-bold text-yellow-300 mb-1">How is Authentication handled?</h4>
            <p className="text-slate-400 leading-relaxed">
              Passswords are hashed using <code>generate_password_hash</code> with PBKDF2/SHA256 salts. Client sessions are signed cryptographically using Flask's secure cookie mechanism with route decorators (<code>@login_required</code> and <code>@admin_required</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
