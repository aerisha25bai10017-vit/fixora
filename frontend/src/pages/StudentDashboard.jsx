import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import SLABadge from '../components/SLABadge';

const LOCATION_TYPES = [
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Academic Block', label: 'Academic Block' },
  { value: 'LC', label: 'LC' },
  { value: 'AR', label: 'AR' },
];

export default function StudentDashboard() {
  const [issues, setIssues] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [blockNo, setBlockNo] = useState('');
  const [locationType, setLocationType] = useState('Hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  // ---- Community board: collective problems others have already raised ----
  const [communityIssues, setCommunityIssues] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityFilter, setCommunityFilter] = useState('same'); // 'same' | 'all'
  const [communityCategory, setCommunityCategory] = useState('all');
  const [joiningId, setJoiningId] = useState(null);
  const [joinNotice, setJoinNotice] = useState('');

  const fetchIssues = async () => {
    try {
      // Backend scopes /issues to the logged-in student automatically.
      const res = await API.get('/issues');
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.issues)
        ? data.issues
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setIssues(list);
    } catch (err) {
      console.error('Error fetching grievances:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchCommunityIssues = async () => {
    setCommunityLoading(true);
    try {
      const params = {};
      // "same" mode mirrors whatever the create-form is currently set to,
      // so a student sees matching reports right as they're about to submit.
      if (communityFilter === 'same') {
        params.location_type = locationType;
      }
      if (communityCategory !== 'all') {
        params.category = communityCategory;
      }
      const res = await API.get('/issues/community', { params });
      const list = Array.isArray(res.data?.issues) ? res.data.issues : [];
      setCommunityIssues(list.filter((i) => !i.is_mine));
    } catch (err) {
      console.error('Error fetching community board:', err);
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityFilter, communityCategory, locationType]);

  const handleJoinIssue = async (issueId) => {
    setJoiningId(issueId);
    setJoinNotice('');
    try {
      const res = await API.post(`/issues/${issueId}/join`);
      const updated = res.data?.issue;
      setCommunityIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? { ...i, has_joined: true, supporters_count: updated?.supporters_count ?? i.supporters_count + 1 }
            : i
        )
      );
      setJoinNotice("Added — we've counted you in on this report.");
    } catch (err) {
      setJoinNotice(err.response?.data?.error || 'Could not back this issue right now.');
    } finally {
      setJoiningId(null);
      setTimeout(() => setJoinNotice(''), 3500);
    }
  };

  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('student_name', studentName);
    formData.append('reg_no', regNo);
    formData.append('block_no', blockNo);
    formData.append('location_type', locationType);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('attachment', file);

    try {
      await API.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStudentName('');
      setRegNo('');
      setBlockNo('');
      setLocationType('Hostel');
      setTitle('');
      setDescription('');
      setCategory('Health');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchIssues();
      fetchCommunityIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Student Grievance Portal</h2>
        <p>
          Submit and track your campus concerns in real time.{' '}
          <span className="hand">We've got you covered!</span>
        </p>
      </header>

      <div className="dashboard-grid">
        <section className="card">
          <h3>📌 Submit New Grievance</h3>
          <form onSubmit={handleRaiseIssue} className="form-stack">
            <div className="input-group">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Registration No.</label>
              <input
                type="text"
                placeholder="e.g. 22BCE1234"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Block Type</label>
              <select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                {LOCATION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Block No.</label>
              <input
                type="text"
                placeholder="e.g. Hostel Block B / Academic Block 3"
                value={blockNo}
                onChange={(e) => setBlockNo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Water leak in Hostel Block B"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Block / Type of Issue</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Health">🏥 Health</option>
                <option value="Maintenance">🧰 Maintenance</option>
                <option value="Academic">📚 Academic</option>
                <option value="Personal">🙋 Personal</option>
              </select>
              <span className="field-hint">Your query is routed to the admin who handles this block.</span>
            </div>

            <div className="input-group">
              <label>Description</label>
              <textarea
                placeholder="Provide details about the issue..."
                value={description}
                rows="4"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Attachment (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Submitting...' : 'Submit Grievance'}
            </button>
          </form>
        </section>

        <section className="card">
          <h3>🗂️ Your Reported Grievances</h3>
          <div className="issue-list">
            {fetching ? (
              <p className="empty-state">Loading your grievances...</p>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                Nothing here yet.
                <span className="hand">Raise your first issue on the left →</span>
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="issue-card" data-cat={issue.category}>
                  <div className="issue-card-header">
                    <h4>{issue.title}</h4>
                    <span className="category-pill" data-cat={issue.category}>{issue.category}</span>
                  </div>
                  <p className="issue-meta">
                    {issue.location_type || 'Hostel'} — {issue.block_no || 'N/A'}
                  </p>
                  <p>{issue.description}</p>
                  <div className="issue-card-footer">
                    <StatusBadge status={issue.status} />
                    <SLABadge slaDeadline={issue.sla_deadline} status={issue.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="card community-board">
        <div className="community-board-header">
          <div>
            <h3>🧩 Community Board</h3>
            <p className="community-sub">
              See what others are already reporting.{' '}
              <span className="hand">Back it instead of filing a duplicate!</span>
            </p>
          </div>

          <div className="community-controls">
            <div className="segmented">
              <button
                type="button"
                className={communityFilter === 'same' ? 'active' : ''}
                onClick={() => setCommunityFilter('same')}
              >
                Matching "{locationType}"
              </button>
              <button
                type="button"
                className={communityFilter === 'all' ? 'active' : ''}
                onClick={() => setCommunityFilter('all')}
              >
                All Blocks
              </button>
            </div>
            <select
              value={communityCategory}
              onChange={(e) => setCommunityCategory(e.target.value)}
              className="community-cat-select"
            >
              <option value="all">All Types</option>
              <option value="Health">🏥 Health</option>
              <option value="Maintenance">🧰 Maintenance</option>
              <option value="Academic">📚 Academic</option>
              <option value="Personal">🙋 Personal</option>
            </select>
          </div>
        </div>

        {joinNotice && <div className="join-notice">{joinNotice}</div>}

        {communityLoading ? (
          <p className="empty-state">Loading the community board...</p>
        ) : communityIssues.length === 0 ? (
          <div className="empty-state">
            No open reports match this filter yet.
            <span className="hand">Be the first to flag it →</span>
          </div>
        ) : (
          <div className="community-grid">
            {communityIssues.map((issue) => (
              <div key={issue.id} className="community-card" data-cat={issue.category}>
                <div className="community-card-top">
                  <span className="category-pill" data-cat={issue.category}>
                    {issue.category}
                  </span>
                  <span className="supporters-pill" title="Students affected">
                    🙋 {issue.supporters_count} affected
                  </span>
                </div>

                <h4>{issue.title}</h4>
                <p className="issue-meta">
                  {issue.location_type || 'Hostel'} — {issue.block_no || 'N/A'}
                </p>
                <p className="community-desc">{issue.description}</p>

                <div className="issue-card-footer">
                  <StatusBadge status={issue.status} />
                  <SLABadge slaDeadline={issue.sla_deadline} status={issue.status} />
                </div>

                <button
                  type="button"
                  className="btn-join"
                  disabled={issue.has_joined || joiningId === issue.id}
                  onClick={() => handleJoinIssue(issue.id)}
                >
                  {issue.has_joined
                    ? '✓ You backed this'
                    : joiningId === issue.id
                    ? 'Adding you...'
                    : 'I have this too'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
