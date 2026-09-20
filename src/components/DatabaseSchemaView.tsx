import React from 'react';
import { Database, Key, Link as LinkIcon, ShieldCheck, ArrowRight } from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const tables = [
    {
      name: "users",
      description: "Stores registered client profiles, contact credentials, and hashed passwords",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", key: "PK", note: "Auto-incrementing client ID" },
        { name: "name", type: "VARCHAR(150)", key: "", note: "Customer's full legal name" },
        { name: "email", type: "VARCHAR(150) UNIQUE", key: "UQ", note: "Unique login identifier" },
        { name: "password_hash", type: "VARCHAR(255)", key: "", note: "Werkzeug secure password hash" },
        { name: "phone", type: "VARCHAR(20)", key: "", note: "Contact mobile number" },
        { name: "address", type: "TEXT", key: "", note: "Default billing and shoot location" },
        { name: "created_at", type: "TIMESTAMP", key: "", note: "DEFAULT CURRENT_TIMESTAMP" },
      ]
    },
    {
      name: "admins",
      description: "Studio administration and manager accounts for staff control panel",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", key: "PK", note: "Auto-incrementing admin ID" },
        { name: "username", type: "VARCHAR(50) UNIQUE", key: "UQ", note: "e.g. 'admin'" },
        { name: "password_hash", type: "VARCHAR(255)", key: "", note: "Werkzeug hash for 'admin123'" },
        { name: "created_at", type: "TIMESTAMP", key: "", note: "DEFAULT CURRENT_TIMESTAMP" },
      ]
    },
    {
      name: "appointments",
      description: "Customer bookings for photography sessions and shoot schedules",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", key: "PK", note: "Appointment booking ID" },
        { name: "user_id", type: "INT NOT NULL", key: "FK", note: "REFERENCES users(id) ON DELETE CASCADE" },
        { name: "service", type: "VARCHAR(100)", key: "", note: "Photography, Wedding Shoot, etc." },
        { name: "appointment_date", type: "DATE NOT NULL", key: "", note: "Scheduled shoot date" },
        { name: "appointment_time", type: "TIME NOT NULL", key: "", note: "Time slot" },
        { name: "customer_name", type: "VARCHAR(150)", key: "", note: "Snapshot of customer name" },
        { name: "phone", type: "VARCHAR(20)", key: "", note: "Direct contact line for photographer" },
        { name: "address", type: "TEXT", key: "", note: "Venue / On-location address" },
        { name: "message", type: "TEXT", key: "", note: "Custom instructions & special requests" },
        { name: "status", type: "VARCHAR(50)", key: "", note: "Pending, Approved, In Progress, Completed, Rejected" },
        { name: "created_at", type: "TIMESTAMP", key: "", note: "Booking creation timestamp" },
      ]
    },
    {
      name: "work",
      description: "Client-uploaded raw media and studio post-production deliverable records",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", key: "PK", note: "Work assignment ID" },
        { name: "user_id", type: "INT NOT NULL", key: "FK", note: "REFERENCES users(id) ON DELETE CASCADE" },
        { name: "appointment_id", type: "INT", key: "FK", note: "REFERENCES appointments(id) ON DELETE SET NULL" },
        { name: "service", type: "VARCHAR(100)", key: "", note: "Photo Editing / Video Editing" },
        { name: "original_filename", type: "VARCHAR(255)", key: "", note: "Uploaded raw file original name" },
        { name: "original_filepath", type: "VARCHAR(255)", key: "", note: "Relative path in uploads/photos or /videos" },
        { name: "file_type", type: "VARCHAR(20)", key: "", note: "'Photo' or 'Video'" },
        { name: "description", type: "TEXT", key: "", note: "Editing notes & colour grading requirements" },
        { name: "status", type: "VARCHAR(50)", key: "", note: "Pending, In Progress, Completed" },
        { name: "completed_filename", type: "VARCHAR(255)", key: "", note: "Final edited master filename" },
        { name: "completed_filepath", type: "VARCHAR(255)", key: "", note: "Relative path in uploads/completed/" },
        { name: "created_at", type: "TIMESTAMP", key: "", note: "Upload timestamp" },
        { name: "completed_at", type: "TIMESTAMP", key: "", note: "Completion / delivery timestamp" },
      ]
    },
    {
      name: "payments",
      description: "Financial transactions, invoices, and payment verification",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", key: "PK", note: "Payment / Invoice transaction ID" },
        { name: "user_id", type: "INT NOT NULL", key: "FK", note: "REFERENCES users(id) ON DELETE CASCADE" },
        { name: "appointment_id", type: "INT NOT NULL", key: "FK", note: "REFERENCES appointments(id) ON DELETE CASCADE" },
        { name: "service", type: "VARCHAR(100)", key: "", note: "Associated service description" },
        { name: "amount", type: "NUMERIC(10, 2)", key: "", note: "Calculated price in INR" },
        { name: "payment_method", type: "VARCHAR(50)", key: "", note: "UPI, Card, Online, Cash" },
        { name: "payment_status", type: "VARCHAR(50)", key: "", note: "Pending, Paid, Failed, Refunded" },
        { name: "payment_date", type: "TIMESTAMP", key: "", note: "Payment settlement timestamp" },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Overview Banner */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
        <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-2">
          <Database className="w-4 h-4" /> Relational Architecture
        </div>
        <h2 className="text-xl font-bold text-white">PostgreSQL Relational Schema &amp; Integrity Rules</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          The SnepStudio database runs on pure PostgreSQL with strong relational integrity constraints. Foreign keys ensure cascading updates and deletions where appropriate, preserving data consistency across user accounts, booking schedules, media uploads, and payment ledgers.
        </p>
      </div>

      {/* Relational Flow Diagram */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-yellow-400" /> Relational Dependencies &amp; Foreign Key Cascade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <div className="text-yellow-400 font-bold mb-1">users &rarr; appointments</div>
            <div className="text-slate-400">1-to-Many Relationship</div>
            <div className="text-slate-500 mt-2 text-[11px]">ON DELETE CASCADE: Deleting a client automatically purges their historical bookings.</div>
          </div>
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <div className="text-yellow-400 font-bold mb-1">appointments &rarr; payments</div>
            <div className="text-slate-400">1-to-1 / 1-to-Many</div>
            <div className="text-slate-500 mt-2 text-[11px]">ON DELETE CASCADE: Every invoice is tied to an appointment booking.</div>
          </div>
          <div className="bg-[#12141a] border border-[#2e3545] p-4 rounded-lg">
            <div className="text-yellow-400 font-bold mb-1">appointments &rarr; work</div>
            <div className="text-slate-400">1-to-Many (Optional)</div>
            <div className="text-slate-500 mt-2 text-[11px]">ON DELETE SET NULL: Work orders preserve their media even if the booking is modified.</div>
          </div>
        </div>
      </div>

      {/* State Machine Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Appointment Status Lifecycle</h3>
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded">Pending</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded">Approved</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded">In Progress</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded">Completed</span>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            * Alternatively may branch to <span className="text-red-400 font-semibold">Rejected</span> or <span className="text-red-400 font-semibold">Cancelled</span> upon studio or client action.
          </div>
        </div>

        <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Post-Production Work Lifecycle</h3>
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded">Raw Uploaded (Pending)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded">Editor Retouching</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded">Master File Delivered</span>
          </div>
          <div className="text-xs text-slate-400 mt-3">
            * Client receives instantaneous access to high-res download once the studio attaches the completed file.
          </div>
        </div>
      </div>

      {/* Individual Tables Details */}
      <div className="flex flex-col gap-6">
        {tables.map(table => (
          <div key={table.name} className="bg-[#181b22] border border-[#2e3545] rounded-xl overflow-hidden">
            <div className="bg-[#14171e] border-b border-[#2e3545] px-6 py-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-yellow-400" />
                <span className="font-mono text-base font-bold text-white">{table.name}</span>
              </div>
              <span className="text-xs text-slate-400">{table.description}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#0f1115] text-slate-400 uppercase text-[11px] border-b border-[#2e3545]">
                    <th className="py-3 px-6">Column</th>
                    <th className="py-3 px-6">Data Type</th>
                    <th className="py-3 px-6">Key</th>
                    <th className="py-3 px-6">Description / Constraint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222735]">
                  {table.columns.map((col, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="py-3 px-6 font-semibold text-slate-200">{col.name}</td>
                      <td className="py-3 px-6 text-yellow-300/90">{col.type}</td>
                      <td className="py-3 px-6">
                        {col.key === 'PK' && (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Key className="w-2.5 h-2.5" /> PK
                          </span>
                        )}
                        {col.key === 'FK' && (
                          <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <LinkIcon className="w-2.5 h-2.5" /> FK
                          </span>
                        )}
                        {col.key === 'UQ' && (
                          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <ShieldCheck className="w-2.5 h-2.5" /> UQ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-slate-400 font-sans">{col.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
