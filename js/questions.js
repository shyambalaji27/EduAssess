/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Question Bank & PDF Repository Management Module
 * Exposes window.OES_Questions
 */

(function () {
  'use strict';

  function initQuestionsPage() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('admin')) return;

    // --- Tab Switching ---
    const tabQuestions = document.getElementById('tab-questions-btn');
    const tabPdfs = document.getElementById('tab-pdfs-btn');
    const paneQuestions = document.getElementById('pane-questions');
    const panePdfs = document.getElementById('pane-pdfs');

    if (tabQuestions && tabPdfs) {
      tabQuestions.addEventListener('click', () => {
        tabQuestions.classList.add('active');
        tabPdfs.classList.remove('active');
        paneQuestions.style.display = 'block';
        panePdfs.style.display = 'none';
      });

      tabPdfs.addEventListener('click', () => {
        tabPdfs.classList.add('active');
        tabQuestions.classList.remove('active');
        paneQuestions.style.display = 'none';
        panePdfs.style.display = 'block';
        renderPdfs();
      });
    }

    // --- 1. Questions Management ---
    const tableBody = document.getElementById('questions-table-body');
    const searchInput = document.getElementById('search-questions');
    const filterSubject = document.getElementById('filter-question-subject');
    const filterDifficulty = document.getElementById('filter-question-difficulty');
    const filterType = document.getElementById('filter-question-type');
    const addQuestionBtn = document.getElementById('btn-add-question');
    const modal = document.getElementById('question-modal');
    const questionForm = document.getElementById('question-form');
    const typeSelect = document.getElementById('q-type-select');

    function renderQuestions() {
      if (!tableBody) return;
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const subject = filterSubject ? filterSubject.value : '';
      const difficulty = filterDifficulty ? filterDifficulty.value : '';
      const type = filterType ? filterType.value : '';

      const questions = window.OES_Storage.getQuestions().filter(q => {
        const matchesQuery = (q.text || '').toLowerCase().includes(query) ||
                             (q.id || '').toLowerCase().includes(query) ||
                             (q.topic || '').toLowerCase().includes(query);
        const matchesSubject = subject ? q.subject === subject : true;
        const matchesDifficulty = difficulty ? q.difficulty === difficulty : true;
        const matchesType = type ? q.type === type : true;
        return matchesQuery && matchesSubject && matchesDifficulty && matchesType;
      });

      const totalCountEl = document.getElementById('question-count-display');
      if (totalCountEl) totalCountEl.textContent = `${questions.length} Questions (50 per Topic)`;

      if (questions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No questions match your filter criteria.</td></tr>`;
        return;
      }

      tableBody.innerHTML = questions.map(q => {
        let diffBadge = 'badge-success';
        if (q.difficulty === 'Medium') diffBadge = 'badge-warning';
        if (q.difficulty === 'Hard') diffBadge = 'badge-danger';

        let typeBadge = 'badge-primary';
        if (q.type === 'TrueFalse') typeBadge = 'badge-info';
        if (q.type === 'MultipleSelect') typeBadge = 'badge-purple';

        return `
          <tr>
            <td><strong>${q.id}</strong></td>
            <td>
              <div style="font-weight:600; max-width:420px; line-height:1.4;">${q.text}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Topic: ${q.topic || 'General'}</div>
            </td>
            <td><span class="badge badge-secondary">${q.subject}</span></td>
            <td><span class="badge ${typeBadge}">${q.type}</span></td>
            <td><span class="badge ${diffBadge}">${q.difficulty}</span></td>
            <td><strong>${q.marks} pt${q.marks > 1 ? 's' : ''}</strong></td>
            <td>
              <div class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="window.OES_Questions.editQuestion('${q.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="window.OES_Questions.deleteQuestion('${q.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderQuestions);
    if (filterSubject) filterSubject.addEventListener('change', renderQuestions);
    if (filterDifficulty) filterDifficulty.addEventListener('change', renderQuestions);
    if (filterType) filterType.addEventListener('change', renderQuestions);

    // Dynamic Options Builder based on Question Type
    function updateOptionsUI(type, existingOptions = [], existingCorrect = []) {
      const container = document.getElementById('options-builder-container');
      if (!container) return;

      if (type === 'TrueFalse') {
        const correctVal = existingCorrect.length > 0 ? existingCorrect[0] : 'True';
        container.innerHTML = `
          <div class="form-group">
            <label class="form-label">Correct Value</label>
            <div style="display:flex; gap:1.5rem; margin-top:0.5rem;">
              <label class="form-check">
                <input type="radio" name="tf_answer" value="True" ${correctVal === 'True' ? 'checked' : ''} required />
                <span>True</span>
              </label>
              <label class="form-check">
                <input type="radio" name="tf_answer" value="False" ${correctVal === 'False' ? 'checked' : ''} />
                <span>False</span>
              </label>
            </div>
          </div>
        `;
      } else if (type === 'MultipleSelect') {
        const opts = existingOptions.length === 4 ? existingOptions : ['', '', '', ''];
        container.innerHTML = `
          <label class="form-label">Options & Correct Answers (Check all that apply)</label>
          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            ${[0, 1, 2, 3].map(i => `
              <div class="input-group" style="display:flex; align-items:center; gap:0.5rem;">
                <input type="checkbox" name="ms_correct" value="${i}" ${existingCorrect.includes(opts[i]) && opts[i] ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);" />
                <input type="text" class="form-control opt-text-input" placeholder="Option ${i + 1}" value="${opts[i] || ''}" required />
              </div>
            `).join('')}
          </div>
          <small class="text-muted" style="display:block; margin-top:0.35rem;">Check the boxes next to all correct answer options.</small>
        `;
      } else {
        const opts = existingOptions.length === 4 ? existingOptions : ['', '', '', ''];
        container.innerHTML = `
          <label class="form-label">Answer Options (Select the one correct answer)</label>
          <div style="display:flex; flex-direction:column; gap:0.65rem;">
            ${[0, 1, 2, 3].map(i => `
              <div class="input-group" style="display:flex; align-items:center; gap:0.5rem;">
                <input type="radio" name="mcq_correct" value="${i}" ${existingCorrect.includes(opts[i]) || (i === 0 && existingCorrect.length === 0) ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);" required />
                <input type="text" class="form-control opt-text-input" placeholder="Option ${i + 1}" value="${opts[i] || ''}" required />
              </div>
            `).join('')}
          </div>
          <small class="text-muted" style="display:block; margin-top:0.35rem;">Select the radio button next to the correct choice.</small>
        `;
      }
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', () => updateOptionsUI(typeSelect.value));
    }

    // Add Question Modal Trigger
    if (addQuestionBtn && modal) {
      addQuestionBtn.addEventListener('click', () => {
        document.getElementById('question-modal-title').textContent = 'Add New Question';
        document.getElementById('q-mode').value = 'create';
        document.getElementById('q-id').value = 'Q-' + Date.now().toString(36).toUpperCase();
        questionForm.reset();
        typeSelect.value = 'MCQ';
        updateOptionsUI('MCQ');
        modal.classList.add('active');
      });
    }

    const closeModal = () => { if (modal) modal.classList.remove('active'); };
    const closeBtns = document.querySelectorAll('.close-question-modal');
    closeBtns.forEach(b => b.addEventListener('click', closeModal));

    // Save Question Form
    if (questionForm) {
      questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('q-id').value.trim();
        const text = document.getElementById('q-text').value.trim();
        const subject = document.getElementById('q-subject').value.trim();
        const topic = document.getElementById('q-topic').value.trim();
        const difficulty = document.getElementById('q-difficulty').value;
        const type = typeSelect.value;
        const marks = Number(document.getElementById('q-marks').value) || 1;
        const explanation = document.getElementById('q-explanation').value.trim();

        let options = [];
        let correct = [];

        if (type === 'TrueFalse') {
          options = ['True', 'False'];
          const checkedRadio = document.querySelector('input[name="tf_answer"]:checked');
          correct = [checkedRadio ? checkedRadio.value : 'True'];
        } else if (type === 'MultipleSelect') {
          const optInputs = document.querySelectorAll('.opt-text-input');
          options = Array.from(optInputs).map(inp => inp.value.trim());

          const checkedBoxes = document.querySelectorAll('input[name="ms_correct"]:checked');
          checkedBoxes.forEach(cb => {
            const index = Number(cb.value);
            if (options[index]) correct.push(options[index]);
          });

          if (correct.length === 0) {
            window.OES_App.showToast('Please check at least one correct option for Multiple Select question.', 'warning');
            return;
          }
        } else {
          const optInputs = document.querySelectorAll('.opt-text-input');
          options = Array.from(optInputs).map(inp => inp.value.trim());

          const checkedRadio = document.querySelector('input[name="mcq_correct"]:checked');
          const index = checkedRadio ? Number(checkedRadio.value) : 0;
          correct = [options[index] || options[0]];
        }

        const question = {
          id,
          text,
          subject,
          topic,
          difficulty,
          type,
          options,
          correct,
          marks,
          explanation
        };

        window.OES_Storage.saveQuestion(question);
        window.OES_App.showToast('Question saved successfully!', 'success');
        closeModal();
        renderQuestions();
      });
    }

    // --- 2. PDF Question Banks Management ---
    const pdfsTableBody = document.getElementById('pdfs-table-body');
    const uploadPdfBtn = document.getElementById('btn-upload-pdf-modal');
    const pdfModal = document.getElementById('pdf-upload-modal');
    const pdfForm = document.getElementById('pdf-upload-form');
    const filterPdfSubject = document.getElementById('filter-pdf-subject');

    function renderPdfs() {
      if (!pdfsTableBody) return;
      const subject = filterPdfSubject ? filterPdfSubject.value : '';

      const pdfs = window.OES_Storage.getPdfs().filter(p => {
        return subject ? p.subject === subject : true;
      });

      const countEl = document.getElementById('pdf-count-display');
      if (countEl) countEl.textContent = `${pdfs.length} PDF Question Banks`;

      if (pdfs.length === 0) {
        pdfsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No PDF question banks uploaded yet. Click "Upload PDF Question Bank" above.</td></tr>`;
        return;
      }

      pdfsTableBody.innerHTML = pdfs.map(pdf => `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text); font-size:1rem;">📄 ${pdf.title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">File: ${pdf.fileName || 'document.pdf'}</div>
          </td>
          <td><span class="badge badge-primary">${pdf.subject}</span></td>
          <td style="max-width:240px; font-size:0.85rem; color:var(--text-muted);">${pdf.description || 'No description'}</td>
          <td><span style="font-family:monospace; font-size:0.85rem;">${pdf.fileSize || 'N/A'}</span></td>
          <td style="font-size:0.85rem; color:var(--text-muted);">${pdf.uploadedAt || '2026-01-01'}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-sm btn-secondary" onclick="window.OES_Questions.previewPdf('${pdf.id}')" title="Preview PDF in Viewer">
                👁️ View
              </button>
              <button class="btn btn-sm btn-outline-primary" onclick="window.OES_Questions.downloadPdf('${pdf.id}')" title="Download PDF">
                📥 Download
              </button>
              <button class="btn btn-sm btn-danger" onclick="window.OES_Questions.deletePdf('${pdf.id}')" title="Delete PDF">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    if (filterPdfSubject) filterPdfSubject.addEventListener('change', renderPdfs);

    if (uploadPdfBtn && pdfModal) {
      uploadPdfBtn.addEventListener('click', () => {
        pdfForm.reset();
        pdfModal.classList.add('active');
      });
    }

    const closePdfModal = () => { if (pdfModal) pdfModal.classList.remove('active'); };
    const closePdfBtns = document.querySelectorAll('.close-pdf-modal');
    closePdfBtns.forEach(b => b.addEventListener('click', closePdfModal));

    // Handle Upload PDF Submit
    if (pdfForm) {
      pdfForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('pdf-title-input').value.trim();
        const subject = document.getElementById('pdf-subject-input').value;
        const desc = document.getElementById('pdf-desc-input').value.trim();
        const fileInput = document.getElementById('pdf-file-input');

        if (!fileInput.files || fileInput.files.length === 0) {
          window.OES_App.showToast('Please select a PDF file to upload.', 'warning');
          return;
        }

        const file = fileInput.files[0];
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          window.OES_App.showToast('Only PDF (.pdf) documents are supported.', 'danger');
          return;
        }

        // Check file size (recommend < 5MB for LocalStorage)
        const sizeKB = Math.round(file.size / 1024);
        const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result;
          const newPdf = {
            id: 'PDF-' + Date.now().toString(36).toUpperCase(),
            title,
            subject,
            description: desc,
            fileName: file.name,
            fileSize: sizeStr,
            fileData: base64Data,
            uploadedBy: 'Administrator',
            uploadedAt: new Date().toISOString().split('T')[0]
          };

          const saved = window.OES_Storage.savePdf(newPdf);
          if (saved) {
            window.OES_App.showToast(`PDF Question Bank "${title}" uploaded and available to students!`, 'success');
            closePdfModal();
            renderPdfs();
          } else {
            window.OES_App.showToast('Failed to save PDF to storage. File may be too large.', 'danger');
          }
        };

        reader.readAsDataURL(file);
      });
    }

    renderQuestions();
    renderPdfs();
  }

  function editQuestion(id) {
    const q = window.OES_Storage.getQuestionById(id);
    if (!q) return;

    const modal = document.getElementById('question-modal');
    document.getElementById('question-modal-title').textContent = 'Edit Question';
    document.getElementById('q-mode').value = 'edit';
    document.getElementById('q-id').value = q.id;
    document.getElementById('q-text').value = q.text;
    document.getElementById('q-subject').value = q.subject;
    document.getElementById('q-topic').value = q.topic || '';
    document.getElementById('q-difficulty').value = q.difficulty;
    document.getElementById('q-marks').value = q.marks;
    document.getElementById('q-explanation').value = q.explanation || '';

    const typeSelect = document.getElementById('q-type-select');
    typeSelect.value = q.type;

    const container = document.getElementById('options-builder-container');
    if (q.type === 'TrueFalse') {
      const correctVal = q.correct && q.correct.length ? q.correct[0] : 'True';
      container.innerHTML = `
        <div class="form-group">
          <label class="form-label">Correct Value</label>
          <div style="display:flex; gap:1.5rem; margin-top:0.5rem;">
            <label class="form-check">
              <input type="radio" name="tf_answer" value="True" ${correctVal === 'True' ? 'checked' : ''} required />
              <span>True</span>
            </label>
            <label class="form-check">
              <input type="radio" name="tf_answer" value="False" ${correctVal === 'False' ? 'checked' : ''} />
              <span>False</span>
            </label>
          </div>
        </div>
      `;
    } else if (q.type === 'MultipleSelect') {
      const opts = q.options && q.options.length ? q.options : ['', '', '', ''];
      container.innerHTML = `
        <label class="form-label">Options & Correct Answers (Check all that apply)</label>
        <div style="display:flex; flex-direction:column; gap:0.65rem;">
          ${opts.map((opt, i) => `
            <div class="input-group" style="display:flex; align-items:center; gap:0.5rem;">
              <input type="checkbox" name="ms_correct" value="${i}" ${q.correct && q.correct.includes(opt) ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);" />
              <input type="text" class="form-control opt-text-input" placeholder="Option ${i + 1}" value="${opt}" required />
            </div>
          `).join('')}
        </div>
      `;
    } else {
      const opts = q.options && q.options.length ? q.options : ['', '', '', ''];
      container.innerHTML = `
        <label class="form-label">Answer Options (Select the one correct answer)</label>
        <div style="display:flex; flex-direction:column; gap:0.65rem;">
          ${opts.map((opt, i) => `
            <div class="input-group" style="display:flex; align-items:center; gap:0.5rem;">
              <input type="radio" name="mcq_correct" value="${i}" ${q.correct && q.correct.includes(opt) ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--primary);" required />
              <input type="text" class="form-control opt-text-input" placeholder="Option ${i + 1}" value="${opt}" required />
            </div>
          `).join('')}
        </div>
      `;
    }

    modal.classList.add('active');
  }

  function deleteQuestion(id) {
    window.OES_App.confirmModal({
      title: 'Delete Question',
      message: `Are you sure you want to delete question "${id}"?`,
      confirmText: 'Delete Question',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.OES_Storage.deleteQuestion(id);
        window.OES_App.showToast(`Question ${id} deleted.`, 'success');
        initQuestionsPage();
      }
    });
  }

  // --- PDF Viewer & Downloader ---
  function previewPdf(id) {
    const pdf = window.OES_Storage.getPdfById(id);
    if (!pdf || !pdf.fileData) {
      window.OES_App.showToast('PDF data not found.', 'danger');
      return;
    }

    let viewerModal = document.getElementById('pdf-viewer-modal');
    if (!viewerModal) {
      viewerModal = document.createElement('div');
      viewerModal.id = 'pdf-viewer-modal';
      viewerModal.className = 'modal-overlay';
      viewerModal.innerHTML = `
        <div class="modal-content" style="max-width:900px; height:85vh; display:flex; flex-direction:column;">
          <div class="modal-header">
            <h3 id="pdf-viewer-title">PDF Preview</h3>
            <button class="btn-close" onclick="document.getElementById('pdf-viewer-modal').classList.remove('active')">&times;</button>
          </div>
          <div class="modal-body" style="flex:1; padding:0;">
            <iframe id="pdf-viewer-frame" style="width:100%; height:100%; border:none;"></iframe>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('pdf-viewer-modal').classList.remove('active')">Close</button>
            <button id="pdf-viewer-dl-btn" class="btn btn-primary">Download PDF</button>
          </div>
        </div>
      `;
      document.body.appendChild(viewerModal);
    }

    document.getElementById('pdf-viewer-title').textContent = pdf.title;
    document.getElementById('pdf-viewer-frame').src = pdf.fileData;

    document.getElementById('pdf-viewer-dl-btn').onclick = () => {
      downloadPdf(pdf.id);
    };

    viewerModal.classList.add('active');
  }

  function downloadPdf(id) {
    const pdf = window.OES_Storage.getPdfById(id);
    if (!pdf || !pdf.fileData) return;

    const link = document.createElement('a');
    link.href = pdf.fileData;
    link.download = pdf.fileName || `${pdf.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.OES_App.showToast(`Downloading "${pdf.title}"...`, 'info');
  }

  function deletePdf(id) {
    window.OES_App.confirmModal({
      title: 'Delete PDF Document',
      message: `Are you sure you want to delete this PDF question bank? Students will no longer be able to access it.`,
      confirmText: 'Delete PDF',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        window.OES_Storage.deletePdf(id);
        window.OES_App.showToast('PDF question bank removed.', 'success');
        initQuestionsPage();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initQuestionsPage);

  window.OES_Questions = {
    initQuestionsPage,
    editQuestion,
    deleteQuestion,
    previewPdf,
    downloadPdf,
    deletePdf
  };

})();
