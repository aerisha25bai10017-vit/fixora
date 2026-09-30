import React, { useState } from 'react';
import API from '../api/axiosInstance';

const STEPS = [
  { id: 'submitted', label: 'Submitted', icon: '📝' },
  { id: 'assigned', label: 'Assigned', icon: '👤' },
  { id: 'in_progress', label: 'In Progress', icon: '⚙️' },
  { id: 'resolved', label: 'Resolved', icon: '✅' },
];

export default function GrievanceProgressStepper({ issue, onUpdate }) {
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);
  const [userRating, setUserRating] = useState(() => {
    return Number(localStorage.getItem(`issue_rating_${issue.id}`)) || 0;
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(() => {
    return Boolean(localStorage.getItem(`issue_rating_${issue.id}`));
  });

  const getStepStatus = (index) => {
    const s = issue.status;
    if (s === 'resolved') return 'completed';

    if (s === 'escalated') {
      if (index <= 1) return 'completed';
      if (index === 2) return 'escalated';
      return 'pending';
    }

    if (s === 'in_progress') {
      if (index < 2) return 'completed';
      if (index === 2) return 'active';
      return 'pending';
    }

    // s === 'pending'
    if (index === 0) return issue.assigned_to ? 'completed' : 'active';
    if (index === 1 && issue.assigned_to) return 'active';
    return 'pending';
  };

  const handleRate = async (stars) => {
    setUserRating(stars);
    localStorage.setItem(`issue_rating_${issue.id}`, stars);
    setRatingSubmitted(true);
    try {
      await API.post(`/issues/${issue.id}/feedback`, { rating: stars });
    } catch (e) {
      console.warn('Feedback recorded locally', e);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setSubmittingReopen(true);
    try {
      await API.post(`/issues/${issue.id}/reopen`, { reason: reopenReason });
      setShowReopenModal(false);
      setReopenReason('');
      localStorage.removeItem(`issue_rating_${issue.id}`);
      setUserRating(0);
      setRatingSubmitted(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reopen grievance');
    } finally {
      setSubmittingReopen(false);
    }
  };

  return (
    <div className="stepper-wrapper">
      {/* 4-Step Visual Progress Bar */}
      <div className="progress-stepper" role="progressbar" aria-label="Grievance resolution progress">
        {STEPS.map((step, idx) => {
          const stepStatus = getStepStatus(idx);
          return (
            <div key={step.id} className={`step-item ${stepStatus}`}>
              <div className="step-circle" title={`${step.label} (${stepStatus})`}>
                <span className="step-icon">{step.icon}</span>
              </div>
              <span className="step-label">{step.label}</span>
              {idx < STEPS.length - 1 && (
                <div
                  className={`step-line ${
                    stepStatus === 'completed' ? 'line-filled' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Escalation Alert */}
      {issue.status === 'escalated' && (
        <div className="stepper-escalation-banner">
          <span>⚠️ SLA Overdue: This ticket has been automatically escalated to higher management.</span>
        </div>
      )}

      {/* Assigned staff information */}
      {issue.assignee_name && (
        <div className="stepper-assignee-hint">
          <span>Assigned to: <strong>{issue.assignee_name}</strong></span>
        </div>
      )}

      {/* Resolved section: Rating & Reopen */}
      {issue.status === 'resolved' && (
        <div className="resolved-action-box">
          <div className="rating-box">
            <span className="rating-label">
              {ratingSubmitted ? 'Your satisfaction rating:' : 'Rate the resolution:'}
            </span>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${
                    (hoverRating || userRating) >= star ? 'filled' : ''
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              {userRating > 0 && (
                <span className="rating-score-text">({userRating}/5)</span>
              )}
            </div>
            {ratingSubmitted && (
              <span className="rating-thank-you">✓ Thank you for your feedback!</span>
            )}
          </div>

          <button
            type="button"
            className="btn-reopen-trigger"
            onClick={() => setShowReopenModal(true)}
            title="Problem still not solved? Reopen ticket"
          >
            🔄 Problem Persists? Re-open Issue
          </button>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="reopen-modal-overlay">
          <div className="card reopen-modal-card">
            <h4>🔄 Re-Open Grievance #{issue.id}</h4>
            <p className="reopen-desc">
              If the problem was not satisfactorily resolved or has recurred, please explain what is still wrong.
            </p>
            <form onSubmit={handleReopen}>
              <textarea
                className="reopen-textarea"
                rows="3"
                placeholder="e.g. The water tap was fixed but started leaking again this morning..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                required
              />
              <div className="reopen-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowReopenModal(false)}
                  disabled={submittingReopen}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingReopen || !reopenReason.trim()}
                >
                  {submittingReopen ? 'Reopening...' : 'Confirm & Re-open'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
