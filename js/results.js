/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Result Processing, Reporting & Export Module
 * Exposes window.OES_Results
 */

(function () {
  'use strict';

  // --- 1. Student Result Screen Controller ---
  function initStudentResults() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('student')) return;
    const user = window.OES_Auth.getCurrentUser();
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const resultId = urlParams.get('resultId');

    const myResults = window.OES_Storage.getResultsByStudent(user.id);
    let targetResult = null;

    if (resultId) {
      targetResult = window.OES_Storage.getResultById(resultId);
      // Privacy Guard: Prevent viewing other students' results
      if (targetResult && targetResult.studentId !== user.id) {
        window.OES_App.showToast('Access denied: You cannot view results belonging to another student.', 'danger');
        targetResult = null;
      }
    } else if (myResults.length > 0) {
      targetResult = myResults[0]; // latest result
    }

    if (!targetResult) {
      const container = document.getElementById('student-result-container');
      if (container) {
        container.innerHTML = `
          <div class="card" style="text-align:center; padding:3rem;">
            <h3>No Examination Result Found</h3>
            <p class="text-muted">You have not completed this examination or no results are currently available.</p>
            <a href="student-dashboard.html" class="btn btn-primary" style="margin-top:1rem;">Back to Dashboard</a>
          </div>
        `;
      }
      return;
    }

    renderStudentResultDetails(targetResult, user);
    renderStudentResultHistory(user.id);
  }

  function renderStudentResultDetails(res, user) {
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('res-exam-title', res.examTitle);
    setEl('res-subject', res.subject);
    setEl('res-student-name', res.studentName || user.name);
    setEl('res-student-id', res.studentId);
    setEl('res-date', new Date(res.submittedAt).toLocaleString());

    setEl('res-percentage', `${res.percentage}%`);
    setEl('res-score-summary', `${res.obtainedMarks} / ${res.totalMarks} Marks`);

    // Status Banner
    const statusBanner = document.getElementById('res-status-banner');
    if (statusBanner) {
      statusBanner.className = `result-status-banner ${res.passed ? 'pass' : 'fail'}`;
      statusBanner.innerHTML = res.passed ? '🏆 Examination Passed' : '⚠️ Needs Improvement (Failed)';
    }

    setEl('res-correct-count', res.correctAnswers);
    setEl('res-wrong-count', res.wrongAnswers);
    setEl('res-unanswered-count', res.unanswered);
    setEl('res-time-taken', formatSeconds(res.timeTakenSeconds || 0));

    // Question-by-Question Review List
    const reviewListContainer = document.getElementById('res-questions-review-list');
    if (reviewListContainer && res.breakdown) {
      reviewListContainer.innerHTML = res.breakdown.map((item, idx) => {
        let statusClass = 'correct-answer';
        let statusBadge = '<span class="badge badge-success">Correct (+ ' + item.marksAwarded + ' pt)</span>';

        if (!item.isAttempted) {
          statusClass = 'unanswered-answer';
          statusBadge = '<span class="badge badge-warning">Unanswered (0 pt)</span>';
        } else if (!item.isCorrect) {
          statusClass = 'wrong-answer';
          statusBadge = '<span class="badge badge-danger">Incorrect (0 pt)</span>';
        }

        const userAnsText = item.userAnswers && item.userAnswers.length > 0 ? item.userAnswers.join(', ') : 'None (Skipped)';
        const correctAnsText = item.correctAnswers ? item.correctAnswers.join(', ') : 'N/A';

        return `
          <div class="review-item ${statusClass}">
            <div class="review-header">
              <div>
                <strong>Question ${idx + 1}</strong>
                <span class="text-muted" style="font-size:0.8rem; margin-left:0.5rem;">[${item.type}]</span>
              </div>
              <div>${statusBadge}</div>
            </div>

            <div style="font-weight:600; font-size:1.05rem; margin-bottom:1rem; color:var(--text);">${item.text}</div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; margin-bottom:0.75rem;">
              <div style="background:var(--bg); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border);">
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); display:block;">Your Answer</span>
                <span style="font-weight:600; color:${item.isCorrect ? 'var(--success)' : (item.isAttempted ? 'var(--danger)' : 'var(--warning)')};">${userAnsText}</span>
              </div>

              <div style="background:var(--bg); padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--border);">
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); display:block;">Correct Answer</span>
                <span style="font-weight:600; color:var(--success);">${correctAnsText}</span>
              </div>
            </div>

            ${item.explanation ? `
              <div class="explanation-box">
                <strong>💡 Explanation:</strong> ${item.explanation}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  function renderStudentResultHistory(studentId) {
    const tbody = document.getElementById('res-history-tbody');
    if (!tbody) return;

    const myResults = window.OES_Storage.getResultsByStudent(studentId);
    if (myResults.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No other examinations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = myResults.map(r => `
      <tr>
        <td><strong>${r.examTitle}</strong></td>
        <td>${r.subject}</td>
        <td>${r.obtainedMarks} / ${r.totalMarks}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td><span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
        <td>
          <a href="student-results.html?resultId=${r.resultId}" class="btn btn-sm btn-secondary">Switch</a>
        </td>
      </tr>
    `).join('');
  }

  // --- 2. Admin Results & Reporting Module ---
  function initAdminResults() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('admin')) return;

    const tableBody = document.getElementById('admin-results-tbody');
    const searchInput = document.getElementById('search-admin-results');
    const filterExam = document.getElementById('filter-result-exam');
    const filterSubject = document.getElementById('filter-result-subject');
    const filterStatus = document.getElementById('filter-result-status');
    const exportCsvBtn = document.getElementById('btn-export-csv');

    if (!tableBody) return;

    // Populate Exam Filter Dropdown
    if (filterExam) {
      const exams = window.OES_Storage.getExams();
      filterExam.innerHTML = '<option value="">All Examinations</option>' + exams.map(e => `<option value="${e.title}">${e.title}</option>`).join('');
    }

    function renderAdminResults() {
      const allResults = window.OES_Storage.getResults();

      // Top Statistics Calculation
      const totalCount = allResults.length;
      const uniqueStudents = new Set(allResults.map(r => r.studentId)).size;

      let passCount = 0;
      let highest = 0;
      let lowest = allResults.length > 0 ? 100 : 0;
      let sum = 0;

      allResults.forEach(r => {
        const p = Number(r.percentage) || 0;
        sum += p;
        if (p > highest) highest = p;
        if (p < lowest) lowest = p;
        if (r.passed) passCount++;
      });

      const avg = totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 0;
      const passPct = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
      const failPct = totalCount > 0 ? 100 - passPct : 0;

      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setEl('metric-total-conducted', totalCount);
      setEl('metric-total-students-part', uniqueStudents);
      setEl('metric-avg-score', `${avg}%`);
      setEl('metric-highest-score', `${highest}%`);
      setEl('metric-lowest-score', `${lowest}%`);
      setEl('metric-pass-percent', `${passPct}%`);
      setEl('metric-fail-percent', `${failPct}%`);

      // Filter Table
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const examVal = filterExam ? filterExam.value : '';
      const subjectVal = filterSubject ? filterSubject.value : '';
      const statusVal = filterStatus ? filterStatus.value : '';

      const filtered = allResults.filter(r => {
        const matchQuery = (r.studentId || '').toLowerCase().includes(query) ||
                           (r.studentName || '').toLowerCase().includes(query) ||
                           (r.examTitle || '').toLowerCase().includes(query);
        const matchExam = examVal ? r.examTitle === examVal : true;
        const matchSubj = subjectVal ? r.subject === subjectVal : true;
        const matchStatus = statusVal ? (statusVal === 'PASS' ? r.passed : !r.passed) : true;
        return matchQuery && matchExam && matchSubj && matchStatus;
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No examination records found matching criteria.</td></tr>`;
        return;
      }

      tableBody.innerHTML = filtered.map(r => `
        <tr>
          <td><strong>${r.resultId}</strong></td>
          <td>
            <div style="font-weight:700;">${r.studentName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${r.studentId}</div>
          </td>
          <td>${r.examTitle}</td>
          <td><span class="badge badge-secondary">${r.subject}</span></td>
          <td>${r.obtainedMarks} / ${r.totalMarks}</td>
          <td><strong>${r.percentage}%</strong></td>
          <td><span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
          <td>${new Date(r.submittedAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="window.OES_Results.viewAdminResultDetail('${r.resultId}')">
              📄 Inspect
            </button>
          </td>
        </tr>
      `).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderAdminResults);
    if (filterExam) filterExam.addEventListener('change', renderAdminResults);
    if (filterSubject) filterSubject.addEventListener('change', renderAdminResults);
    if (filterStatus) filterStatus.addEventListener('change', renderAdminResults);

    // CSV Export Handler
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const allResults = window.OES_Storage.getResults();
        if (allResults.length === 0) {
          window.OES_App.showToast('No result records available to export.', 'warning');
          return;
        }

        const headers = ['Result ID', 'Student ID', 'Student Name', 'Exam Title', 'Subject', 'Obtained Marks', 'Total Marks', 'Percentage', 'Status', 'Submitted At'];
        const csvRows = [headers.join(',')];

        allResults.forEach(r => {
          const row = [
            `"${r.resultId}"`,
            `"${r.studentId}"`,
            `"${r.studentName}"`,
            `"${r.examTitle}"`,
            `"${r.subject}"`,
            r.obtainedMarks,
            r.totalMarks,
            r.percentage,
            r.passed ? 'PASS' : 'FAIL',
            `"${new Date(r.submittedAt).toISOString()}"`
          ];
          csvRows.push(row.join(','));
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', `oes-examination-results-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.OES_App.showToast('Examination report exported as CSV successfully!', 'success');
      });
    }

    renderAdminResults();
  }

  function viewAdminResultDetail(resultId) {
    const res = window.OES_Storage.getResultById(resultId);
    if (!res) return;

    let contentHtml = `
      <div style="margin-bottom:1.5rem; border-bottom:1px solid var(--border); padding-bottom:1rem;">
        <h4>${res.examTitle}</h4>
        <div style="font-size:0.9rem; color:var(--text-muted); display:flex; gap:1rem; margin-top:0.35rem;">
          <span>Candidate: <strong>${res.studentName}</strong> (${res.studentId})</span>
          <span>Score: <strong>${res.obtainedMarks}/${res.totalMarks} (${res.percentage}%)</strong></span>
          <span class="badge ${res.passed ? 'badge-success' : 'badge-danger'}">${res.passed ? 'PASS' : 'FAIL'}</span>
        </div>
      </div>
      <div style="max-height:480px; overflow-y:auto; padding-right:0.5rem;">
    `;

    if (res.breakdown && res.breakdown.length > 0) {
      contentHtml += res.breakdown.map((item, idx) => `
        <div style="border:1px solid var(--border); border-radius:8px; padding:1rem; margin-bottom:0.75rem; background:var(--surface);">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <strong>Q${idx + 1}: ${item.text}</strong>
            <span class="badge ${item.isCorrect ? 'badge-success' : (item.isAttempted ? 'badge-danger' : 'badge-warning')}">
              ${item.isCorrect ? 'Correct (' + item.marksAwarded + ' pt)' : (item.isAttempted ? 'Wrong' : 'Skipped')}
            </span>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted);">
            <div>Candidate's Answer: <strong style="color:var(--text);">${item.userAnswers.join(', ') || 'None'}</strong></div>
            <div>Correct Answer: <strong style="color:var(--success);">${item.correctAnswers.join(', ')}</strong></div>
            ${item.explanation ? `<div style="margin-top:0.35rem; color:var(--info);">💡 ${item.explanation}</div>` : ''}
          </div>
        </div>
      `).join('');
    } else {
      contentHtml += `<p class="text-muted">No individual question breakdown recorded for this legacy attempt.</p>`;
    }

    contentHtml += `</div>`;

    let modal = document.getElementById('admin-inspect-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-inspect-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width:720px;">
          <div class="modal-header">
            <h3>Candidate Answer Sheet</h3>
            <button class="btn-close" onclick="document.getElementById('admin-inspect-modal').classList.remove('active')">&times;</button>
          </div>
          <div class="modal-body" id="admin-inspect-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('admin-inspect-modal').classList.remove('active')">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    document.getElementById('admin-inspect-body').innerHTML = contentHtml;
    modal.classList.add('active');
  }

  function formatSeconds(secs) {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('student-result-container')) initStudentResults();
    if (document.getElementById('admin-results-tbody')) initAdminResults();
  });

  window.OES_Results = {
    initStudentResults,
    initAdminResults,
    viewAdminResultDetail
  };

})();

