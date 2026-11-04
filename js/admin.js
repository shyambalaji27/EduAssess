/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Admin Dashboard & Student Management Controller
 * Exposes window.OES_Admin
 */

(function () {
  'use strict';

  let performanceChart = null;
  let passFailChart = null;

  function initAdminDashboard() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('admin')) return;

    renderStats();
    renderCharts();
    renderRecentResultsTable();
    initStudentManagement();
    initSettingsBackup();
  }

  // --- 1. Compute & Render Real LocalStorage Statistics ---
  function renderStats() {
    const students = window.OES_Storage.getUsers().filter(u => u.role === 'student');
    const exams = window.OES_Storage.getExams();
    const questions = window.OES_Storage.getQuestions();
    const results = window.OES_Storage.getResults();

    const now = new Date();
    const upcomingExams = exams.filter(e => {
      if (e.status === 'Draft') return false;
      const start = new Date(e.startDate + 'T' + e.startTime);
      return start > now;
    });

    let avgScore = 0;
    if (results.length > 0) {
      const sum = results.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
      avgScore = Math.round((sum / results.length) * 10) / 10;
    }

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('stat-total-students', students.length);
    setEl('stat-total-exams', exams.length);
    setEl('stat-total-questions', questions.length);
    setEl('stat-completed-exams', results.length);
    setEl('stat-upcoming-exams', upcomingExams.length);
    setEl('stat-avg-score', `${avgScore}%`);
  }

  // --- 2. Render Visual Charts using Chart.js with Canvas Fallback ---
  function renderCharts() {
    const results = window.OES_Storage.getResults();
    const subjectScores = {};
    const subjectCounts = {};

    let passCount = 0;
    let failCount = 0;

    results.forEach(r => {
      const subj = r.subject || 'General';
      subjectScores[subj] = (subjectScores[subj] || 0) + (Number(r.percentage) || 0);
      subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;

      if (r.passed) passCount++;
      else failCount++;
    });

    const subjectLabels = Object.keys(subjectScores);
    const subjectAverages = subjectLabels.map(s => Math.round(subjectScores[s] / subjectCounts[s]));

    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
      // Bar Chart: Subject Performance
      const ctxBar = document.getElementById('subjectPerformanceChart');
      if (ctxBar) {
        if (performanceChart) performanceChart.destroy();
        performanceChart = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: subjectLabels.length ? subjectLabels : ['No Data'],
            datasets: [{
              label: 'Average Score (%)',
              data: subjectAverages.length ? subjectAverages : [0],
              backgroundColor: 'rgba(79, 70, 229, 0.8)',
              borderColor: '#4F46E5',
              borderWidth: 1.5,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: v => v + '%' }
              }
            }
          }
        });
      }

      // Doughnut Chart: Pass vs Fail
      const ctxPie = document.getElementById('passFailChart');
      if (ctxPie) {
        if (passFailChart) passFailChart.destroy();
        passFailChart = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: ['Passed', 'Failed'],
            datasets: [{
              data: [passCount || 1, failCount],
              backgroundColor: ['#16A34A', '#DC2626'],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
    }
  }

  // --- 3. Recent Results Table ---
  function renderRecentResultsTable() {
    const tbody = document.getElementById('recent-results-tbody');
    if (!tbody) return;

    const results = window.OES_Storage.getResults().slice(0, 5); // top 5
    if (results.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No examination submissions recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = results.map(r => {
      const dateStr = new Date(r.submittedAt).toLocaleDateString() + ' ' + new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const badgeClass = r.passed ? 'badge-success' : 'badge-danger';
      const statusLabel = r.passed ? 'PASS' : 'FAIL';

      return `
        <tr>
          <td><strong>${r.studentId}</strong></td>
          <td>${r.studentName}</td>
          <td>${r.examTitle}</td>
          <td>${r.obtainedMarks} / ${r.totalMarks}</td>
          <td><strong>${r.percentage}%</strong></td>
          <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
          <td>${dateStr}</td>
        </tr>
      `;
    }).join('');
  }

  // --- 4. Student Management Module ---
  function initStudentManagement() {
    const tableBody = document.getElementById('students-table-body');
    const searchInput = document.getElementById('search-students');
    const deptFilter = document.getElementById('filter-student-dept');
    const addStudentBtn = document.getElementById('btn-add-student');
    const modal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');

    if (!tableBody) return;

    function renderStudents() {
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const dept = deptFilter ? deptFilter.value : '';

      const students = window.OES_Storage.getUsers().filter(u => {
        if (u.role !== 'student') return false;
        const matchQuery = (u.id || '').toLowerCase().includes(query) || (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
        const matchDept = dept ? u.department === dept : true;
        return matchQuery && matchDept;
      });

      if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No students found matching criteria.</td></tr>`;
        return;
      }

      tableBody.innerHTML = students.map(s => `
        <tr>
          <td><strong>${s.id}</strong></td>
          <td>${s.name}</td>
          <td>${s.email}</td>
          <td><span class="badge badge-primary">${s.department || 'N/A'}</span></td>
          <td>${s.year || 'N/A'}</td>
          <td><span style="font-family:monospace; background:var(--bg); padding:0.2rem 0.4rem; border-radius:4px;">${s.password}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-secondary" onclick="window.OES_Admin.editStudent('${s.id}')">✏️ Edit</button>
              <button class="btn btn-sm btn-outline-primary" onclick="window.OES_Admin.viewStudentHistory('${s.id}')">📊 History</button>
              <button class="btn btn-sm btn-danger" onclick="window.OES_Admin.deleteStudent('${s.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderStudents);
    if (deptFilter) deptFilter.addEventListener('change', renderStudents);

    // Add Student Button
    if (addStudentBtn && modal) {
      addStudentBtn.addEventListener('click', () => {
        document.getElementById('student-modal-title').textContent = 'Add New Student';
        document.getElementById('edit-student-mode').value = 'create';
        document.getElementById('student-id-input').removeAttribute('readonly');
        studentForm.reset();
        modal.classList.add('active');
      });
    }

    // Modal close
    const closeModal = () => { if (modal) modal.classList.remove('active'); };
    const closeBtns = document.querySelectorAll('.close-student-modal');
    closeBtns.forEach(b => b.addEventListener('click', closeModal));

    // Save Student Form
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mode = document.getElementById('edit-student-mode').value;
        const id = document.getElementById('student-id-input').value.trim();
        const name = document.getElementById('student-name-input').value.trim();
        const email = document.getElementById('student-email-input').value.trim();
        const dept = document.getElementById('student-dept-input').value;
        const year = document.getElementById('student-year-input').value;
        const pwd = document.getElementById('student-pwd-input').value.trim();

        if (!id || !name || !pwd) {
          window.OES_App.showToast('Please fill all required fields.', 'warning');
          return;
        }

        // Check uniqueness if creating
        if (mode === 'create') {
          const exists = window.OES_Storage.getUserById(id);
          if (exists) {
            window.OES_App.showToast(`Student with ID "${id}" already exists.`, 'danger');
            return;
          }
        }

        const studentData = {
          id,
          username: id,
          name,
          email,
          department: dept,
          year,
          password: pwd,
          role: 'student',
          createdAt: new Date().toISOString().split('T')[0]
        };

        window.OES_Storage.saveUser(studentData);
        window.OES_App.showToast(`Student account ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
        closeModal();
        renderStudents();
        renderStats();
      });
    }

    renderStudents();
  }

  function editStudent(id) {
    const student = window.OES_Storage.getUserById(id);
    if (!student) return;

    const modal = document.getElementById('student-modal');
    document.getElementById('student-modal-title').textContent = 'Edit Student Details';
    document.getElementById('edit-student-mode').value = 'edit';

    const idInput = document.getElementById('student-id-input');
    idInput.value = student.id;
    idInput.setAttribute('readonly', 'true');

    document.getElementById('student-name-input').value = student.name || '';
    document.getElementById('student-email-input').value = student.email || '';
    document.getElementById('student-dept-input').value = student.department || 'Computer Science';
    document.getElementById('student-year-input').value = student.year || '1st Year';
    document.getElementById('student-pwd-input').value = student.password || '';

    modal.classList.add('active');
  }

  function deleteStudent(id) {
    window.OES_App.confirmModal({
      title: 'Delete Student Account',
      message: `Are you sure you want to delete student account "${id}"? All associated login credentials will be removed.`,
      confirmText: 'Delete Student',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.OES_Storage.deleteUser(id);
        window.OES_App.showToast(`Student account ${id} deleted.`, 'success');
        initStudentManagement();
        renderStats();
      }
    });
  }

  function viewStudentHistory(studentId) {
    const student = window.OES_Storage.getUserById(studentId);
    const results = window.OES_Storage.getResultsByStudent(studentId);

    let contentHtml = `
      <div style="margin-bottom:1.5rem;">
        <h4>${student ? student.name : studentId} (${studentId})</h4>
        <p class="text-muted">${student ? student.email : ''} • ${student ? student.department : ''}</p>
      </div>
    `;

    if (results.length === 0) {
      contentHtml += `<p class="text-muted" style="text-align:center; padding:1.5rem;">This student has not completed any examinations yet.</p>`;
    } else {
      contentHtml += `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Marks</th>
                <th>%</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(r => `
                <tr>
                  <td><strong>${r.examTitle}</strong></td>
                  <td>${r.obtainedMarks} / ${r.totalMarks}</td>
                  <td>${r.percentage}%</td>
                  <td><span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
                  <td>${new Date(r.submittedAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    let modal = document.getElementById('history-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'history-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width:680px;">
          <div class="modal-header">
            <h3>Student Examination History</h3>
            <button class="btn-close" onclick="document.getElementById('history-modal').classList.remove('active')">&times;</button>
          </div>
          <div class="modal-body" id="history-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('history-modal').classList.remove('active')">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('history-modal-body').innerHTML = contentHtml;
    modal.classList.add('active');
  }

  // --- 5. Data Backup & Reset Settings ---
  function initSettingsBackup() {
    const exportBtn = document.getElementById('btn-export-json');
    const importFileInput = document.getElementById('import-json-file');
    const resetBtn = document.getElementById('btn-reset-demo');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = window.OES_Storage.exportBackupJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oes-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.OES_App.showToast('System data exported successfully!', 'success');
      });
    }

    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = window.OES_Storage.importBackupJSON(event.target.result);
          if (res.success) {
            window.OES_App.showToast('Backup restored successfully! Refreshing...', 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            window.OES_App.showToast(res.message, 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.OES_App.confirmModal({
          title: 'Reset Application Data',
          message: 'This will reset all questions, exams, student accounts, and examination results back to default demo data. Are you sure?',
          confirmText: 'Reset Demo Data',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            window.OES_Storage.resetAllData();
            window.OES_App.showToast('All demo data has been reset! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 1000);
          }
        });
      });
    }
  }

  // Auto-init on page load
  document.addEventListener('DOMContentLoaded', initAdminDashboard);

  window.OES_Admin = {
    initAdminDashboard,
    editStudent,
    deleteStudent,
    viewStudentHistory,
    renderStats
  };

})();

