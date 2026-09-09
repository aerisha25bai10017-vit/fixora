import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';
import StatsChart from '../components/StatsChart';

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [fetching, setFetching] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (locationTypeFilter) params.location_type = locationTypeFilter;
      if (blockFilter) params.block_no = blockFilter;

      const [issuesRes, statsRes] = await Promise.all([
        API.get('/issues', { params }),
        API.get('/stats'),
      ]);
      const issuesData = issuesRes.data;
      const issuesList = Array.isArray(issuesData)
        ? issuesData
        : Array.isArray(issuesData?.issues)
        ? issuesData.issues
        : Array.isArray(issuesData?.data)
        ? issuesData.data
        : [];
      setIssues(issuesList);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setFetching(false);
    }
  }, [statusFilter, categoryFilter, locationTypeFilter, blockFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/issues/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const categories = ['Health', 'Maintenance', 'Academic', 'Personal'];

  const displayedIssues = issues.filter((issue) => {
    if (locationTypeFilter && issue.location_type !== locationTypeFilter) return false;
    if (blockFilter && !(issue.block_no || '').toLowerCase().includes(blockFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Control Center</h2>
        <p>
          Queries the Super Admin has assigned to your block — update status and track SLAs.{' '}
          <span className="hand">Nothing slips through.</span>
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

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3>🗃️ All Campus Grievances</h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All types</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={locationTypeFilter} onChange={(e) => setLocationTypeFilter(e.target.value)}>
              <option value="">All Blocks</option>
              <option value="Hostel">Hostel</option>
              <option value="Academic Block">Academic Block</option>
              <option value="LC">LC</option>
              <option value="AR">AR</option>
            </select>
            <input
              type="text"
              placeholder="Filter by block no..."
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              style={{ minWidth: '160px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Reg No.</th>
                <th>Block</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>SLA Timer</th>
                <th>Assigned Admin</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan={9} className="empty-state">Loading grievances...</td></tr>
              ) : displayedIssues.length === 0 ? (
                <tr><td colSpan={9} className="empty-state">No grievances assigned to your block yet.</td></tr>
              ) : (
                displayedIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.student_name || '—'}</td>
                    <td>{issue.reg_no || '—'}</td>
                    <td>{issue.location_type || 'Hostel'} · {issue.block_no || '—'}</td>
                    <td><strong>{issue.title}</strong></td>
                    <td><span className="category-pill" data-cat={issue.category}>{issue.category}</span></td>
                    <td><StatusBadge status={issue.status} /></td>
                    <td><SLABadge slaDeadline={issue.sla_deadline} status={issue.status} /></td>
                    <td>
                      <span className="assignee-chip">
                        {issue.assignee_name || issue.assigned_to_name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={issue.status}
                        onChange={(e) => updateStatus(issue.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
