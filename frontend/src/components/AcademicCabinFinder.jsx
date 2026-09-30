import React, { useState, useMemo, useEffect } from 'react';
import { FACULTY_CABINS, CABIN_BLOCKS, CABIN_STATUSES } from '../data/facultyCabins';
import API from '../api/axiosInstance';

export default function AcademicCabinFinder({ onSelectFacultyForGrievance }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedCabin, setCopiedCabin] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [selectedGuideFloor, setSelectedGuideFloor] = useState('all');
  const [apiCabins, setApiCabins] = useState(null);

  // Pinned Proctor state saved in localStorage
  const [pinnedProctor, setPinnedProctor] = useState(() => {
    try {
      const saved = localStorage.getItem('fixora_pinned_proctor');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handlePinProctor = (faculty) => {
    setPinnedProctor(faculty);
    try {
      localStorage.setItem('fixora_pinned_proctor', JSON.stringify(faculty));
    } catch (e) {
      console.warn('Could not save pinned proctor', e);
    }
  };

  const handleUnpinProctor = () => {
    setPinnedProctor(null);
    try {
      localStorage.removeItem('fixora_pinned_proctor');
    } catch (e) {
      console.warn('Could not clear pinned proctor', e);
    }
  };

  // Attempt to fetch fresh data from backend, fallback to client dataset
  useEffect(() => {
    let isMounted = true;
    API.get('/academic/cabins')
      .then((res) => {
        if (isMounted && res.data?.cabins && Array.isArray(res.data.cabins)) {
          setApiCabins(res.data.cabins);
        }
      })
      .catch((err) => {
        // Silent fallback to bundled data
        console.warn('Using bundled faculty cabins dataset', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const cabinList = apiCabins || FACULTY_CABINS;

  // Filter cabins
  const filteredCabins = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cabinList.filter((item) => {
      // Name or search term match
      const nameMatch = !term || (
        item.name.toLowerCase().includes(term) ||
        item.cabinNo.toLowerCase().includes(term) ||
        (item.phone && item.phone.toLowerCase().includes(term)) ||
        (item.remark && item.remark.toLowerCase().includes(term)) ||
        (item.fullLocation && item.fullLocation.toLowerCase().includes(term))
      );

      // Block filter
      const blockMatch =
        selectedBlock === 'All Blocks' || item.block === selectedBlock;

      // Status filter
      const statusMatch =
        selectedStatus === 'All Status' ||
        item.status.toLowerCase() === selectedStatus.toLowerCase();

      return nameMatch && blockMatch && statusMatch;
    });
  }, [cabinList, searchTerm, selectedBlock, selectedStatus]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBlock, selectedStatus, pageSize]);

  // Pagination calculation
  const totalItems = filteredCabins.length;
  const isAllPages = pageSize === 'all';
  const totalPages = isAllPages ? 1 : Math.ceil(totalItems / pageSize);
  const displayedCabins = useMemo(() => {
    if (isAllPages) return filteredCabins;
    const start = (currentPage - 1) * pageSize;
    return filteredCabins.slice(start, start + pageSize);
  }, [filteredCabins, currentPage, pageSize, isAllPages]);

  const handleCopyCabin = (cabinNo, location) => {
    const text = `${cabinNo} (${location || 'VIT Bhopal'})`;
    navigator.clipboard?.writeText(text);
    setCopiedCabin(cabinNo);
    setTimeout(() => setCopiedCabin(null), 2000);
  };

  const handleCopyPhone = (phone) => {
    if (!phone) return;
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBlock('All Blocks');
    setSelectedStatus('All Status');
  };

  // Helper to highlight matched query in faculty name
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'FC';
    const clean = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Ar\.)\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'FC';
  };

  // Color generator for faculty avatar based on name
  const getAvatarBg = (name) => {
    const colors = [
      'var(--teal)',
      'var(--marigold)',
      'var(--coral)',
      'var(--sky)',
      '#7b5ea7',
      '#3f88c5',
      '#e06d53'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('occupied')) return 'status-occupied';
    if (s.includes('allot')) return 'status-allotted';
    if (s.includes('vacant')) return 'status-vacant';
    return 'status-pending';
  };

  return (
    <div className="academic-cabin-container">
      {/* Header section */}
      <div className="academic-header">
        <div className="academic-header-text">
          <div className="academic-badge-tag">
            <span>🏛️</span> Academic Block Directory
          </div>
          <h2>Faculty & Proctor Cabin Locator</h2>
          <p>
            Find where your faculty proctor or professor sits.{' '}
            <span className="hand">Search with faculty name to get instant cabin details!</span>
          </p>
        </div>

        <div className="academic-header-actions">
          <button
            type="button"
            className="btn-guide-toggle"
            onClick={() => setShowLocationGuide(!showLocationGuide)}
          >
            <span>{showLocationGuide ? '✕ Close Guide' : '🗺️ Floor & Block Guide'}</span>
          </button>
        </div>
      </div>

      {/* Pinned Proctor Highlight Banner */}
      {pinnedProctor && (
        <div className="card pinned-proctor-banner">
          <div className="pinned-proctor-top">
            <span className="pinned-badge">⭐ Your Assigned Faculty Proctor</span>
            <button
              type="button"
              className="btn-unpin-proctor"
              onClick={handleUnpinProctor}
              title="Remove pinned proctor"
            >
              ✕ Unpin
            </button>
          </div>

          <div className="pinned-proctor-body">
            <div
              className="pinned-proctor-avatar"
              style={{ backgroundColor: getAvatarBg(pinnedProctor.name) }}
            >
              {getInitials(pinnedProctor.name)}
            </div>

            <div className="pinned-proctor-info">
              <h3 className="pinned-proctor-name">{pinnedProctor.name}</h3>
              <p className="pinned-location">
                📍 <strong>{pinnedProctor.cabinNo}</strong> — {pinnedProctor.fullLocation}
              </p>
              {pinnedProctor.phone && (
                <p className="pinned-phone">
                  📞 <a href={`tel:${pinnedProctor.phone.split('/')[0].trim()}`}>{pinnedProctor.phone}</a>
                </p>
              )}
              {pinnedProctor.remark && (
                <span className="pinned-remark-chip">ℹ️ {pinnedProctor.remark}</span>
              )}
            </div>

            <div className="pinned-proctor-actions">
              <button
                type="button"
                className="btn-copy-chip"
                onClick={() => handleCopyCabin(pinnedProctor.cabinNo, pinnedProctor.fullLocation)}
              >
                {copiedCabin === pinnedProctor.cabinNo ? '✓ Copied' : '📋 Copy Cabin'}
              </button>
              {onSelectFacultyForGrievance && (
                <button
                  type="button"
                  className="btn-primary btn-pinned-contact"
                  onClick={() => onSelectFacultyForGrievance(pinnedProctor)}
                >
                  📝 Contact / Raise Grievance
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive location reference modal / drawer */}
      {showLocationGuide && (
        <div className="academic-guide-card card">
          <div className="guide-card-header">
            <div>
              <h4>🗺️ VIT Bhopal Cabin Numbering & Floor Navigator</h4>
              <span className="guide-hint">Click a floor to see its layout, amenities, and cabin range:</span>
            </div>
          </div>

          {/* Interactive Floor Switcher */}
          <div className="guide-floor-tabs">
            {[
              { id: 'all', label: 'All Overview' },
              { id: 'G', label: 'Ground Floor', range: 'G-01 to G-22' },
              { id: '1', label: '1st Floor', range: 'A-101 to A-122' },
              { id: '2', label: '2nd Floor', range: 'A-201 to A-250' },
              { id: '3', label: '3rd Floor', range: 'A-301 to A-326, B-301 to B-315' },
              { id: '4', label: '4th Floor', range: 'A-401, B-401, C-401' },
              { id: '5', label: '5th Floor', range: 'A-501, B-501, C-501' },
              { id: 'AB', label: 'Academic Block AB', range: 'AB-011 to AB-510' },
            ].map((fl) => (
              <button
                key={fl.id}
                type="button"
                className={`guide-floor-btn ${selectedGuideFloor === fl.id ? 'active' : ''}`}
                onClick={() => setSelectedGuideFloor(fl.id)}
              >
                {fl.label}
              </button>
            ))}
          </div>

          {selectedGuideFloor === 'all' ? (
            <div className="guide-grid">
              <div className="guide-item">
                <span className="guide-prefix">G-01 to G-22</span>
                <p>Ground Floor Academic Wing</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">A-101 to A-122</span>
                <p>Block A • 1st Floor</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">A-201 to A-250</span>
                <p>Block A • 2nd Floor</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">A-301 to A-326</span>
                <p>Block A • 3rd Floor</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">A-401 to A-426</span>
                <p>Block A • 4th Floor</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">A-501 to A-526</span>
                <p>Block A • 5th Floor</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">B-301 to B-515</span>
                <p>Block B • 3rd, 4th, 5th Floors</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">C-401 to C-540</span>
                <p>Block C • 4th & 5th Floors</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">AB-011 to AB-510</span>
                <p>Academic Block (AB) • All Floors</p>
              </div>
              <div className="guide-item">
                <span className="guide-prefix">PAT & Library</span>
                <p>Placement Office & Central Library</p>
              </div>
            </div>
          ) : (
            <div className="floor-schematic-view">
              <div className="schematic-header">
                <h5>
                  Floor Layout Schematic:{' '}
                  {selectedGuideFloor === 'G'
                    ? 'Ground Floor'
                    : selectedGuideFloor === 'AB'
                    ? 'Academic Block (AB)'
                    : `${selectedGuideFloor}th Floor`}
                </h5>
                <button
                  type="button"
                  className="btn-filter-floor-instant"
                  onClick={() => {
                    if (selectedGuideFloor === 'G') setSelectedBlock('Ground Floor');
                    else if (selectedGuideFloor === 'AB') setSelectedBlock('Academic Block (AB)');
                    else if (selectedGuideFloor === '1' || selectedGuideFloor === '2') setSelectedBlock('Block A');
                    else if (selectedGuideFloor === '3') setSelectedBlock('Block B');
                    else if (selectedGuideFloor === '4' || selectedGuideFloor === '5') setSelectedBlock('Block C');
                    setShowLocationGuide(false);
                  }}
                >
                  Filter cabins on this floor →
                </button>
              </div>
              <div className="schematic-nodes">
                <div className="schematic-node landmark">
                  <span>🛗</span>
                  <strong>Lifts & Main Stairs</strong>
                  <small>Entry Point</small>
                </div>
                <div className="schematic-arrow">───►</div>
                <div className="schematic-node cabins">
                  <span>👨‍🏫</span>
                  <strong>Faculty Cabins Corridor</strong>
                  <small>
                    {selectedGuideFloor === 'G' && 'G-01 to G-22'}
                    {selectedGuideFloor === '1' && 'A-101 to A-122'}
                    {selectedGuideFloor === '2' && 'A-201 to A-250'}
                    {selectedGuideFloor === '3' && 'A-301 to A-326 | B-301 to B-315'}
                    {selectedGuideFloor === '4' && 'A-401 to A-426 | B-401 | C-401'}
                    {selectedGuideFloor === '5' && 'A-501 | B-501 | C-501 to C-540'}
                    {selectedGuideFloor === 'AB' && 'AB-011 to AB-510'}
                  </small>
                </div>
                <div className="schematic-arrow">───►</div>
                <div className="schematic-node amenities">
                  <span>🚻</span>
                  <strong>Water Cooler & Washrooms</strong>
                  <small>Wing Junction</small>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Card */}
      <div className="card academic-search-card">
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="academic-search-input"
            placeholder="Search by faculty name (e.g. Dr. Praveen Lalwani, Dr. Baseera, Ankit Pal, Shweta)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Block Filter Pills */}
        <div className="block-filter-bar">
          <span className="filter-label">Quick Filter:</span>
          <div className="block-filter-chips">
            {CABIN_BLOCKS.map((block) => (
              <button
                key={block}
                type="button"
                className={`filter-chip ${selectedBlock === block ? 'active' : ''}`}
                onClick={() => setSelectedBlock(block)}
              >
                {block}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary controls: Status, View mode, count */}
        <div className="academic-controls-row">
          <div className="controls-left">
            <div className="select-wrapper">
              <label>Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="academic-select"
              >
                {CABIN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrapper">
              <label>Per page:</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="academic-select"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">All (313)</option>
              </select>
            </div>

            {(searchTerm || selectedBlock !== 'All Blocks' || selectedStatus !== 'All Status') && (
              <button type="button" className="btn-reset-filters" onClick={clearFilters}>
                ✕ Reset Filters
              </button>
            )}
          </div>

          <div className="controls-right">
            <span className="results-count">
              Showing <strong>{filteredCabins.length}</strong> of {cabinList.length} faculty
            </span>

            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
              >
                🪟 Cards
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                📑 Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      {filteredCabins.length === 0 ? (
        <div className="card empty-academic-state">
          <div className="empty-icon">🔎</div>
          <h3>No faculty or cabin found</h3>
          <p>
            We couldn't find any results matching "<strong>{searchTerm}</strong>" with the current filters.
          </p>
          <div className="empty-suggestions">
            <p>Tips:</p>
            <ul>
              <li>Check spelling of the faculty's first or last name</li>
              <li>Try searching with cabin number like <code>A-101</code> or <code>G-05</code></li>
              <li>Reset filters to search across all blocks and statuses</li>
            </ul>
          </div>
          <button type="button" className="btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="faculty-cards-grid">
          {displayedCabins.map((faculty) => {
            const isCopied = copiedCabin === faculty.cabinNo;
            const isPhoneCopied = copiedPhone === faculty.phone;
            const isVacant = faculty.status === 'Vacant';

            return (
              <div
                key={`${faculty.sno}-${faculty.cabinNo}`}
                className={`faculty-cabin-card card ${isVacant ? 'vacant-card' : ''}`}
              >
                <div className="card-top-row">
                  <div className="faculty-avatar" style={{ backgroundColor: getAvatarBg(faculty.name) }}>
                    {getInitials(faculty.name)}
                  </div>
                  <div className="faculty-identity">
                    <h4 className="faculty-name">
                      {highlightMatch(faculty.name, searchTerm)}
                    </h4>
                    <span className="faculty-sno">S.No: #{faculty.sno}</span>
                  </div>
                  <span className={`status-pill ${getStatusBadgeClass(faculty.status)}`}>
                    <span className="status-dot" />
                    {faculty.status}
                  </span>
                </div>

                <div className="cabin-badge-highlight">
                  <div className="cabin-badge-inner">
                    <span className="cabin-label">Cabin No</span>
                    <span className="cabin-number">{faculty.cabinNo}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-copy-chip"
                    onClick={() => handleCopyCabin(faculty.cabinNo, faculty.fullLocation)}
                    title="Copy Cabin & Location"
                  >
                    {isCopied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>

                <div className="cabin-details-list">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <div className="detail-content">
                      <span className="detail-title">Location:</span>
                      <strong className="detail-val">{faculty.fullLocation}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">🏢</span>
                    <div className="detail-content">
                      <span className="detail-title">Building:</span>
                      <span className="detail-val">{faculty.building}</span>
                    </div>
                  </div>

                  {faculty.phone && (
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <div className="detail-content">
                        <span className="detail-title">Contact:</span>
                        <div className="phone-actions">
                          <a href={`tel:${faculty.phone.split('/')[0].trim()}`} className="phone-link">
                            {faculty.phone}
                          </a>
                          <button
                            type="button"
                            className="btn-copy-phone"
                            onClick={() => handleCopyPhone(faculty.phone)}
                            title="Copy phone number"
                          >
                            {isPhoneCopied ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {faculty.remark && (
                    <div className="detail-item remark-item">
                      <span className="detail-icon">ℹ️</span>
                      <div className="detail-content">
                        <span className="detail-title">Note / Remark:</span>
                        <span className="detail-remark">{faculty.remark}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className={`btn-pin-toggle ${pinnedProctor?.cabinNo === faculty.cabinNo ? 'is-pinned' : ''}`}
                    onClick={() => {
                      if (pinnedProctor?.cabinNo === faculty.cabinNo) {
                        handleUnpinProctor();
                      } else {
                        handlePinProctor(faculty);
                      }
                    }}
                    title={
                      pinnedProctor?.cabinNo === faculty.cabinNo
                        ? 'Click to unpin proctor'
                        : 'Pin this faculty member as your official proctor'
                    }
                  >
                    {pinnedProctor?.cabinNo === faculty.cabinNo ? '⭐ My Proctor' : '☆ Set as My Proctor'}
                  </button>

                  {onSelectFacultyForGrievance && (
                    <button
                      type="button"
                      className="btn-file-faculty-issue"
                      onClick={() => onSelectFacultyForGrievance(faculty)}
                      title="File an academic issue related to this cabin/faculty"
                    >
                      <span>📝 Raise Grievance</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card table-container">
          <table className="academic-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cabin No.</th>
                <th>Faculty / Proctor Name</th>
                <th>Location & Floor</th>
                <th>Mobile Number</th>
                <th>Status</th>
                <th>Remark / Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedCabins.map((faculty) => {
                const isCopied = copiedCabin === faculty.cabinNo;
                return (
                  <tr key={`${faculty.sno}-${faculty.cabinNo}`}>
                    <td className="table-sno">{faculty.sno}</td>
                    <td>
                      <span className="table-cabin-tag">{faculty.cabinNo}</span>
                    </td>
                    <td>
                      <div className="table-faculty-cell">
                        <div
                          className="table-avatar"
                          style={{ backgroundColor: getAvatarBg(faculty.name) }}
                        >
                          {getInitials(faculty.name)}
                        </div>
                        <span className="table-faculty-name">
                          {highlightMatch(faculty.name, searchTerm)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="table-location">{faculty.fullLocation}</span>
                    </td>
                    <td>
                      {faculty.phone ? (
                        <a href={`tel:${faculty.phone.split('/')[0].trim()}`} className="phone-link">
                          {faculty.phone}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusBadgeClass(faculty.status)}`}>
                        <span className="status-dot" />
                        {faculty.status}
                      </span>
                    </td>
                    <td>
                      {faculty.remark ? (
                        <span className="table-remark">{faculty.remark}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className={`table-action-btn ${pinnedProctor?.cabinNo === faculty.cabinNo ? 'table-pin-active' : ''}`}
                          onClick={() => {
                            if (pinnedProctor?.cabinNo === faculty.cabinNo) {
                              handleUnpinProctor();
                            } else {
                              handlePinProctor(faculty);
                            }
                          }}
                          title={pinnedProctor?.cabinNo === faculty.cabinNo ? 'Unpin proctor' : 'Pin as My Proctor'}
                        >
                          {pinnedProctor?.cabinNo === faculty.cabinNo ? '⭐' : '☆'}
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleCopyCabin(faculty.cabinNo, faculty.fullLocation)}
                          title="Copy Cabin Number"
                        >
                          {isCopied ? '✓' : '📋'}
                        </button>
                        {onSelectFacultyForGrievance && (
                          <button
                            type="button"
                            className="table-action-btn issue-btn"
                            onClick={() => onSelectFacultyForGrievance(faculty)}
                            title="Raise Academic Grievance"
                          >
                            📝
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!isAllPages && totalPages > 1 && (
        <div className="academic-pagination">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="pagination-ellipsis">... {totalPages}</span>
            )}
          </div>

          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
