/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Exam Management & Scheduling Module
 * Exposes window.OES_Exams
 */

(function () {
  'use strict';

  function initExamsPage() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('admin')) return;

    const tableBody = document.getElementById('exams-table-body');
    const searchInput = document.getElementById('search-exams');
    const filterStatus = document.getElementById('filter-exam-status');
    const filterSubject = document.getElementById('filter-exam-subject');
    const createExamBtn = document.getElementById('btn-create-exam');
    const modal = document.getElementById('exam-modal');
    const examForm = document.getElementById('exam-form');

    if (!tableBody) return;

    function renderExams() {
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const status = filterStatus ? filterStatus.value : '';
      const subject = filterSubject ? filterSubject.value : '';

      const exams = window.OES_Storage.getExams().filter(e => {
        const matchesQuery = (e.title || '').toLowerCase().includes(query) || (e.id || '').toLowerCase().includes(query);
        const matchesStatus = status ? e.status === status : true;
        const matchesSubject = subject ? e.subject === subject : true;
        return matchesQuery && matchesStatus && matchesSubject;
      });

      const countEl = document.getElementById('exam-count-display');
      if (countEl) countEl.textContent = `${exams.length} Examinations`;

      if (exams.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No examinations match your filter criteria.</td></tr>`;
        return;
      }

      tableBody.innerHTML = exams.map(e => {
        let statusBadge = 'badge-success';
        if (e.status === 'Draft') statusBadge = 'badge-warning';
        if (e.status === 'Scheduled') statusBadge = 'badge-info';
        if (e.status === 'Completed') statusBadge = 'badge-secondary';

        const scheduleDisplay = `${e.startDate} ${e.startTime} to ${e.endDate} ${e.endTime}`;

        return `
          <tr>
            <td><strong>${e.id}</strong></td>
            <td>
              <div style="font-weight:700;">${e.title}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${e.description ? e.description.substring(0, 50) + '...' : ''}</div>
            </td>
            <td><span class="badge badge-primary">${e.subject}</span></td>
            <td>${e.questionIds ? e.questionIds.length : 0} Qs • <strong>${e.totalMarks} Marks</strong></td>
            <td>${e.duration} mins</td>
            <td><span class="badge ${statusBadge}">${e.status}</span></td>
            <td style="font-size:0.8rem; color:var(--text-muted);">${scheduleDisplay}</td>
            <td>
              <div class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="window.OES_Exams.editExam('${e.id}')">✏️</button>
                <button class="btn btn-sm btn-outline-primary" onclick="window.OES_Exams.togglePublish('${e.id}')" title="Toggle Status">${e.status === 'Active' ? '⏸️' : '▶️'}</button>
                <button class="btn btn-sm btn-danger" onclick="window.OES_Exams.deleteExam('${e.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderExams);
    if (filterStatus) filterStatus.addEventListener('change', renderExams);
    if (filterSubject) filterSubject.addEventListener('change', renderExams);

    // Build Question Checklist with Live Total Marks Computation
    function buildQuestionChecklist(selectedIds = [], targetSubject = '') {
      const listContainer = document.getElementById('exam-question-checklist');
      if (!listContainer) return;

      const allQuestions = window.OES_Storage.getQuestions();
      const filteredQuestions = targetSubject ? allQuestions.filter(q => q.subject === targetSubject) : allQuestions;

      if (filteredQuestions.length === 0) {
        listContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-muted);">No questions available for "${targetSubject || 'Selected Subject'}". Please create questions in the Question Bank first.</div>`;
        updateTotalMarks();
        return;
      }

      listContainer.innerHTML = filteredQuestions.map(q => {
        const isChecked = selectedIds.includes(q.id);
        return `
          <label class="form-check" style="padding:0.6rem 0.75rem; border:1px solid var(--border); border-radius:6px; background:var(--surface); margin-bottom:0.4rem; display:flex; align-items:flex-start;">
            <input type="checkbox" class="exam-q-checkbox" value="${q.id}" data-marks="${q.marks || 1}" ${isChecked ? 'checked' : ''} style="margin-top:0.25rem;" />
            <div style="flex:1; margin-left:0.5rem; font-size:0.875rem;">
              <div style="font-weight:600; color:var(--text);">${q.text}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:0.5rem; margin-top:0.2rem;">
                <span>ID: ${q.id}</span>
                <span>• Type: ${q.type}</span>
                <span>• Diff: ${q.difficulty}</span>
                <strong style="color:var(--primary);">• ${q.marks} Marks</strong>
              </div>
            </div>
          </label>
        `;
      }).join('');

      // Add event listeners on checkboxes for real-time recalculation
      const checkboxes = listContainer.querySelectorAll('.exam-q-checkbox');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', updateTotalMarks);
      });

      updateTotalMarks();
    }

    function updateTotalMarks() {
      const checkboxes = document.querySelectorAll('.exam-q-checkbox:checked');
      let total = 0;
      checkboxes.forEach(cb => {
        total += Number(cb.getAttribute('data-marks')) || 1;
      });

      const displayEl = document.getElementById('exam-total-marks-display');
      const inputEl = document.getElementById('exam-total-marks-input');
      if (displayEl) displayEl.textContent = `${total} Marks (${checkboxes.length} Questions Selected)`;
      if (inputEl) inputEl.value = total;
    }

    const subjectSelect = document.getElementById('exam-subject-input');
    if (subjectSelect) {
      subjectSelect.addEventListener('change', () => {
        const selectedCheckboxes = Array.from(document.querySelectorAll('.exam-q-checkbox:checked')).map(cb => cb.value);
        buildQuestionChecklist(selectedCheckboxes, subjectSelect.value);
      });
    }

    // Create Exam Button Click
    if (createExamBtn && modal) {
      createExamBtn.addEventListener('click', () => {
        document.getElementById('exam-modal-title').textContent = 'Create New Examination';
        document.getElementById('exam-mode').value = 'create';
        document.getElementById('exam-id-input').value = 'EX-' + Date.now().toString(36).toUpperCase();
        examForm.reset();

        const now = new Date();
        const startStr = now.toISOString().split('T')[0];
        document.getElementById('exam-start-date').value = startStr;
        document.getElementById('exam-start-time').value = '08:00';

        const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        document.getElementById('exam-end-date').value = future.toISOString().split('T')[0];
        document.getElementById('exam-end-time').value = '23:59';

        buildQuestionChecklist([], subjectSelect ? subjectSelect.value : '');
        modal.classList.add('active');
      });
    }

    const closeModal = () => { if (modal) modal.classList.remove('active'); };
    const closeBtns = document.querySelectorAll('.close-exam-modal');
    closeBtns.forEach(b => b.addEventListener('click', closeModal));

    // Save Exam Form Submit
    if (examForm) {
      examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('exam-id-input').value.trim();
        const title = document.getElementById('exam-title-input').value.trim();
        const subject = document.getElementById('exam-subject-input').value;
        const description = document.getElementById('exam-desc-input').value.trim();
        const duration = Number(document.getElementById('exam-duration-input').value) || 20;
        const passingPercent = Number(document.getElementById('exam-pass-percent-input').value) || 50;
        const startDate = document.getElementById('exam-start-date').value;
        const startTime = document.getElementById('exam-start-time').value;
        const endDate = document.getElementById('exam-end-date').value;
        const endTime = document.getElementById('exam-end-time').value;
        const attemptsAllowed = Number(document.getElementById('exam-attempts-input').value) || 1;
        const status = document.getElementById('exam-status-input').value;

        const checkedBoxes = document.querySelectorAll('.exam-q-checkbox:checked');
        const questionIds = Array.from(checkedBoxes).map(cb => cb.value);

        if (questionIds.length === 0) {
          window.OES_App.showToast('Please select at least one question for the exam.', 'warning');
          return;
        }

        let totalMarks = 0;
        checkedBoxes.forEach(cb => {
          totalMarks += Number(cb.getAttribute('data-marks')) || 1;
        });

        const examData = {
          id,
          title,
          subject,
          description,
          questionIds,
          totalMarks,
          duration,
          passingPercent,
          startDate,
          startTime,
          endDate,
          endTime,
          attemptsAllowed,
          status,
          createdAt: new Date().toISOString().split('T')[0]
        };

        window.OES_Storage.saveExam(examData);
        window.OES_App.showToast('Examination saved successfully!', 'success');
        closeModal();
        renderExams();
      });
    }

    renderExams();
  }

  function editExam(id) {
    const exam = window.OES_Storage.getExamById(id);
    if (!exam) return;

    const modal = document.getElementById('exam-modal');
    document.getElementById('exam-modal-title').textContent = 'Edit Examination';
    document.getElementById('exam-mode').value = 'edit';
    document.getElementById('exam-id-input').value = exam.id;
    document.getElementById('exam-title-input').value = exam.title;
    document.getElementById('exam-subject-input').value = exam.subject;
    document.getElementById('exam-desc-input').value = exam.description || '';
    document.getElementById('exam-duration-input').value = exam.duration;
    document.getElementById('exam-pass-percent-input').value = exam.passingPercent;
    document.getElementById('exam-start-date').value = exam.startDate;
    document.getElementById('exam-start-time').value = exam.startTime;
    document.getElementById('exam-end-date').value = exam.endDate;
    document.getElementById('exam-end-time').value = exam.endTime;
    document.getElementById('exam-attempts-input').value = exam.attemptsAllowed;
    document.getElementById('exam-status-input').value = exam.status;

    // Build checklist with existing selections
    const allQuestions = window.OES_Storage.getQuestions();
    const listContainer = document.getElementById('exam-question-checklist');
    if (listContainer) {
      listContainer.innerHTML = allQuestions.map(q => {
        const isChecked = exam.questionIds && exam.questionIds.includes(q.id);
        return `
          <label class="form-check" style="padding:0.6rem 0.75rem; border:1px solid var(--border); border-radius:6px; background:var(--surface); margin-bottom:0.4rem; display:flex; align-items:flex-start;">
            <input type="checkbox" class="exam-q-checkbox" value="${q.id}" data-marks="${q.marks || 1}" ${isChecked ? 'checked' : ''} style="margin-top:0.25rem;" />
            <div style="flex:1; margin-left:0.5rem; font-size:0.875rem;">
              <div style="font-weight:600; color:var(--text);">${q.text}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:0.5rem; margin-top:0.2rem;">
                <span>ID: ${q.id}</span>
                <span>• Subject: ${q.subject}</span>
                <strong style="color:var(--primary);">• ${q.marks} Marks</strong>
              </div>
            </div>
          </label>
        `;
      }).join('');

      listContainer.querySelectorAll('.exam-q-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
          let total = 0;
          const checked = listContainer.querySelectorAll('.exam-q-checkbox:checked');
          checked.forEach(c => total += Number(c.getAttribute('data-marks')) || 1);
          document.getElementById('exam-total-marks-display').textContent = `${total} Marks (${checked.length} Questions Selected)`;
          document.getElementById('exam-total-marks-input').value = total;
        });
      });

      document.getElementById('exam-total-marks-display').textContent = `${exam.totalMarks} Marks (${exam.questionIds.length} Questions Selected)`;
      document.getElementById('exam-total-marks-input').value = exam.totalMarks;
    }

    modal.classList.add('active');
  }

  function togglePublish(id) {
    const exam = window.OES_Storage.getExamById(id);
    if (!exam) return;

    const newStatus = exam.status === 'Active' ? 'Draft' : 'Active';
    exam.status = newStatus;
    window.OES_Storage.saveExam(exam);
    window.OES_App.showToast(`Exam "${exam.title}" status changed to ${newStatus}.`, 'info');
    initExamsPage();
  }

  function deleteExam(id) {
    window.OES_App.confirmModal({
      title: 'Delete Examination',
      message: `Are you sure you want to delete exam "${id}"? All future sessions will be cancelled.`,
      confirmText: 'Delete Exam',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.OES_Storage.deleteExam(id);
        window.OES_App.showToast(`Exam ${id} deleted.`, 'success');
        initExamsPage();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initExamsPage);

  window.OES_Exams = {
    initExamsPage,
    editExam,
    togglePublish,
    deleteExam
  };

})();

