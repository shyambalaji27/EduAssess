/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Student Dashboard & Exam Catalog Controller
 * Exposes window.OES_Student
 */

(function () {
  'use strict';

  function initStudentDashboard() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('student')) return;

    const user = window.OES_Auth.getCurrentUser();
    if (!user) return;

    // Fill Student Information
    const nameEls = document.querySelectorAll('.student-greeting-name');
    nameEls.forEach(el => el.textContent = user.name || user.username);

    const idEls = document.querySelectorAll('.student-display-id');
    idEls.forEach(el => el.textContent = user.id || user.username);

    renderStudentMetrics(user.id);
    renderAvailableExams(user.id);
    renderMyExamsHistory(user.id);
  }

  function renderStudentMetrics(studentId) {
    const allExams = window.OES_Storage.getExams().filter(e => e.status !== 'Draft');
    const myResults = window.OES_Storage.getResultsByStudent(studentId);

    const now = new Date();
    const upcomingCount = allExams.filter(e => {
      const start = new Date(e.startDate + 'T' + e.startTime);
      return start > now;
    }).length;

    let avgScore = 0;
    if (myResults.length > 0) {
      const sum = myResults.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
      avgScore = Math.round((sum / myResults.length) * 10) / 10;
    }

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('student-stat-available', allExams.length);
    setEl('student-stat-completed', myResults.length);
    setEl('student-stat-upcoming', upcomingCount);
    setEl('student-stat-avg-score', `${avgScore}%`);
  }

  function renderAvailableExams(studentId) {
    const container = document.getElementById('available-exams-grid');
    if (!container) return;

    const allExams = window.OES_Storage.getExams().filter(e => e.status !== 'Draft');
    const myResults = window.OES_Storage.getResultsByStudent(studentId);

    if (allExams.length === 0) {
      container.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">
          <h3>No Examinations Currently Scheduled</h3>
          <p>Please check back later or contact your instructor.</p>
        </div>
      `;
      return;
    }

    const now = new Date();

    container.innerHTML = allExams.map(exam => {
      const start = new Date(exam.startDate + 'T' + exam.startTime);
      const end = new Date(exam.endDate + 'T' + exam.endTime);

      const attemptsMade = myResults.filter(r => r.examId === exam.id).length;
      const attemptsAllowed = exam.attemptsAllowed || 1;
      const attemptsLeft = Math.max(0, attemptsAllowed - attemptsMade);

      let canTake = true;
      let statusBadge = '<span class="badge badge-success">Available</span>';
      let buttonText = 'Start Examination';
      let buttonDisabled = false;

      if (exam.status !== 'Active') {
        canTake = false;
        statusBadge = '<span class="badge badge-secondary">Inactive</span>';
        buttonText = 'Not Available';
        buttonDisabled = true;
      } else if (now < start) {
        canTake = false;
        statusBadge = '<span class="badge badge-info">Upcoming</span>';
        buttonText = 'Opens ' + start.toLocaleDateString();
        buttonDisabled = true;
      } else if (now > end) {
        canTake = false;
        statusBadge = '<span class="badge badge-danger">Expired</span>';
        buttonText = 'Exam Closed';
        buttonDisabled = true;
      } else if (attemptsLeft <= 0) {
        canTake = false;
        statusBadge = '<span class="badge badge-warning">Attempts Exhausted</span>';
        buttonText = 'Max Attempts Reached';
        buttonDisabled = true;
      }

      return `
        <div class="card exam-card">
          <div class="exam-card-header">
            <div>
              <div class="exam-subject-tag">${exam.subject}</div>
              <div class="exam-title-text">${exam.title}</div>
            </div>
            <div>${statusBadge}</div>
          </div>

          <p class="text-muted" style="font-size:0.875rem; margin-bottom:1rem; flex:1;">
            ${exam.description || 'No detailed instructions provided.'}
          </p>

          <div class="exam-meta-list">
            <div class="exam-meta-item">
              <span>❓ Questions:</span>
              <strong>${exam.questionIds ? exam.questionIds.length : 0}</strong>
            </div>
            <div class="exam-meta-item">
              <span>🎯 Total Marks:</span>
              <strong>${exam.totalMarks}</strong>
            </div>
            <div class="exam-meta-item">
              <span>⏱️ Duration:</span>
              <strong>${exam.duration} mins</strong>
            </div>
            <div class="exam-meta-item">
              <span>🔄 Attempts:</span>
              <strong>${attemptsLeft} of ${attemptsAllowed} left</strong>
            </div>
          </div>

          <div style="font-size:0.8rem; color:var(--text-light); margin-bottom:1rem;">
            Window: ${start.toLocaleDateString()} ${exam.startTime} – ${end.toLocaleDateString()} ${exam.endTime}
          </div>

          <button class="btn btn-primary btn-block" style="width:100%;"
                  ${buttonDisabled ? 'disabled' : ''}
                  onclick="window.OES_Student.startExam('${exam.id}')">
            ${buttonText}
          </button>
        </div>
      `;
    }).join('');
  }

  function renderMyExamsHistory(studentId) {
    const tbody = document.getElementById('my-exams-tbody');
    if (!tbody) return;

    const results = window.OES_Storage.getResultsByStudent(studentId);

    if (results.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2.5rem; color:var(--text-muted);">You have not taken any examinations yet. Choose an exam from Available Examinations above.</td></tr>`;
      return;
    }

    tbody.innerHTML = results.map(r => {
      const dateStr = new Date(r.submittedAt).toLocaleDateString() + ' ' + new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const badgeClass = r.passed ? 'badge-success' : 'badge-danger';
      const statusLabel = r.passed ? 'PASS' : 'FAIL';

      return `
        <tr>
          <td><strong>${r.examTitle}</strong></td>
          <td><span class="badge badge-secondary">${r.subject}</span></td>
          <td>${r.obtainedMarks} / ${r.totalMarks}</td>
          <td><strong>${r.percentage}%</strong></td>
          <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
          <td>${dateStr}</td>
          <td>
            <a href="student-results.html?resultId=${r.resultId}" class="btn btn-sm btn-outline-primary">
              🔍 View Report
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  function startExam(examId) {
    window.location.href = `exam-instructions.html?id=${encodeURIComponent(examId)}`;
  }

  document.addEventListener('DOMContentLoaded', initStudentDashboard);

  window.OES_Student = {
    initStudentDashboard,
    startExam
  };

})();

