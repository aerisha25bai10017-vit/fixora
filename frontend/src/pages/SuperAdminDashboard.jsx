import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import StatsChart from '../components/StatsChart';

const BLOCKS = ['Health', 'Maintenance', 'Academic', 'Personal'];

function unwrapList(data, key) {
  return Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];
}

export default function SuperAdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [admins, setAdmins] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState('queries'); // 'queries' | 'admins'

  // New-admin form state
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', department: BLOCKS[0] });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (blockFilter) params.category = blockFilter;

      const [issuesRes, statsRes, adminsRes] = await Promise.all([
        API.get('/issues', { params }),
        API.get('/stats'),
        API.get('/admins').catch(() => ({ data: { admins: [] } })),
      ]);

      setIssues(unwrapList(issuesRes.data, 'issues'));
      setStats(statsRes.data);
      setAdmins(unwrapList(adminsRes.data, 'admins'));
    } catch (err) {
      console.error('Error fetching super admin data:', err);
    } finally {
      setFetching(false);
    }
  }, [statusFilter, blockFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignAdmin = async (issueId, adminId) => {
    if (!adminId) return;
    try {
      await API.put(`/issues/${issueId}/assign`, { assigned_to: adminId });
      fetchData();
    } catch (err) {
      console.error('Failed to assign admin:', err);
      alert(err.response?.data?.error || 'Failed to assign admin.');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg('');
    try {
      await API.post('/admins', newAdmin);
      setCreateMsg(`✅ Admin account created for the ${newAdmin.department} block.`);
      setNewAdmin({ name: '', email: '', password: '', department: BLOCKS[0] });
      fetchData();
    } catch (err) {
      setCreateMsg(`❌ ${err.response?.data?.error || 'Failed to create admin.'}`);
    } finally {
      setCreating(false);
    }
  };

  const adminsForBlock = (block) => admins.filter((a) => a.department === block);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>👑 Super Admin Control Center</h2>
        <p>
          Every query, across every block. Assign each one to the admin who owns it.{' '}
          <span className="hand">You call the shots.</span>
        </p>
      </header>

      <div className="stat-strip">
        <div className="stat-pill"><div className="num">{stats.pending ?? '–'}</div><div className="lbl">Pending</div></div>
        <div className="stat-pill"><div className="num">{stats.inProgress ?? '–'}</div><div className="lbl">In Progress</div></div>
        <div className="stat-pill"><div className="num">{stats.resolved ?? '–'}</div><div className="lbl">Resolved</div></div>
        <div className="stat-pill"><div className="num">{stats.escalated ?? '–'}</div><div className="lbl">Escalated</div></div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>📊 Overview Statistics</h3>
        <StatsChart stats={stats} />
      </div>

      <div className="superadmin-tabs">
        <button className={tab === 'queries' ? 'active' : ''} onClick={() => setTab('queries')}>
          🗃️ All Queries
        </button>
        <button className={tab === 'admins' ? 'active' : ''} onClick={() => setTab('admins')}>
          🧑‍💼 Manage Admins
        </button>
      </div>

      {tab === 'queries' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h3>Every Grievance Raised</h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
              <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)}>
                <option value="">All blocks</option>
                {BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Block</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>SLA Timer</th>
                  <th>Assign to Admin</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={6} className="empty-state">Loading grievances...</td></tr>
                ) : issues.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No grievances raised yet.</td></tr>
                ) : (
                  issues.map((issue) => {
                    const eligibleAdmins = adminsForBlock(issue.category);
                    return (
                      <tr key={issue.id}>
                        <td>{issue.student_name || '—'}</td>
                        <td><span className="category-pill" data-cat={issue.category}>{issue.category}</span></td>
                        <td><strong>{issue.title}</strong></td>
                        <td><StatusBadge status={issue.status} /></td>
                        <td><SLABadge slaDeadline={issue.sla_deadline} status={issue.status} /></td>
                        <td>
                          <select
                            defaultValue=""
                            className="status-select"
                            onChange={(e) => assignAdmin(issue.id, e.target.value)}
                          >
                            <option value="" disabled>
                              {issue.assignee_name ? `→ ${issue.assignee_name}` : 'Unassigned'}
                            </option>
                            {(eligibleAdmins.length ? eligibleAdmins : admins).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.department})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'admins' && (
        <div className="dashboard-grid">
          <section className="card">
            <h3>➕ Create New Admin</h3>
            <form onSubmit={handleCreateAdmin} className="form-stack">
              <div className="input-group">
                <label>Full name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Temporary password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Block to manage</label>
                <select
                  value={newAdmin.department}
                  onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })}
                >
                  {BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {createMsg && <div className={createMsg.startsWith('✅') ? 'auth-switch' : 'auth-error'}>{createMsg}</div>}
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>🧑‍💼 Admins by Block</h3>
            {BLOCKS.map((block) => (
              <div key={block} className="block-group">
                <h4 className="block-group-title">
                  <span className="category-pill" data-cat={block}>{block}</span>
                </h4>
                {adminsForBlock(block).length === 0 ? (
                  <p className="empty-state">No admin assigned to this block yet.</p>
                ) : (
                  <ul className="admin-list">
                    {adminsForBlock(block).map((a) => (
                      <li key={a.id} className="admin-list-item">
                        <span>{a.name}</span>
                        <span className="admin-email">{a.email}</span>
                        <span className="admin-load">{a.open_issue_count} open</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
