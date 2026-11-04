/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Exam Room Runtime Engine
 * Manages question rendering, response recording, palette state,
 * timer synchronization, and automatic submission.
 * Exposes window.OES_ExamEngine
 */

(function () {
  'use strict';

  let currentExam = null;
  let examQuestions = [];
  let currentIndex = 0;
  let userAnswers = {}; // { qId: ['opt1', 'opt2'] }
  let questionStates = {}; // { qId: 'not-visited' | 'not-answered' | 'answered' | 'marked-review' | 'answered-review' }
  let currentUser = null;
  let startTime = null;

  function initExamRoom() {
    if (!window.OES_Auth || !window.OES_Auth.checkAuth('student')) return;
    currentUser = window.OES_Auth.getCurrentUser();

    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');

    if (!examId) {
      window.location.href = 'student-dashboard.html';
      return;
    }

    currentExam = window.OES_Storage.getExamById(examId);
    if (!currentExam) {
      alert('Examination not found or invalid.');
      window.location.href = 'student-dashboard.html';
      return;
    }

    // Retrieve questions for this exam
    const allQuestions = window.OES_Storage.getQuestions();
    const qMap = new Map();
    allQuestions.forEach(q => qMap.set(q.id, q));

    examQuestions = (currentExam.questionIds || []).map(id => qMap.get(id)).filter(Boolean);

    if (examQuestions.length === 0) {
      alert('This examination does not contain any questions.');
      window.location.href = 'student-dashboard.html';
      return;
    }

    // Fill UI Header
    const titleEl = document.getElementById('exam-room-title');
    const subjEl = document.getElementById('exam-room-subject');
    const studentEl = document.getElementById('exam-room-student');

    if (titleEl) titleEl.textContent = currentExam.title;
    if (subjEl) subjEl.textContent = `${currentExam.subject} • ${examQuestions.length} Questions • ${currentExam.totalMarks} Total Marks`;
    if (studentEl) studentEl.textContent = `${currentUser.name} (${currentUser.id})`;

    // Check for existing active session to restore state upon refresh
    const existingSession = window.OES_Storage.getActiveSession();
    let initialSeconds = currentExam.duration * 60;

    if (existingSession && existingSession.examId === examId && existingSession.studentId === currentUser.id) {
      initialSeconds = existingSession.remainingSeconds;
      userAnswers = existingSession.userAnswers || {};
      questionStates = existingSession.questionStates || {};
      currentIndex = existingSession.currentIndex || 0;
      startTime = existingSession.startTime || Date.now();
    } else {
      // Initialize fresh question states
      examQuestions.forEach((q, idx) => {
        questionStates[q.id] = idx === 0 ? 'not-answered' : 'not-visited';
        userAnswers[q.id] = [];
      });
      startTime = Date.now();
      syncSession(initialSeconds);
    }

    // Start Timer
    startCountdown(initialSeconds);

    // Setup action buttons
    document.getElementById('btn-prev-q').addEventListener('click', prevQuestion);
    document.getElementById('btn-next-q').addEventListener('click', nextQuestion);
    document.getElementById('btn-clear-resp').addEventListener('click', clearCurrentResponse);
    document.getElementById('btn-mark-review').addEventListener('click', toggleMarkForReview);
    document.getElementById('btn-finish-exam').addEventListener('click', promptSubmitExam);

    // Render Question Palette and First Question
    renderPalette();
    renderCurrentQuestion();
  }

  function startCountdown(seconds) {
    const timerDigits = document.getElementById('timer-countdown');
    const timerWrapper = document.getElementById('timer-wrapper');

    window.OES_Timer.startTimer({
      initialSeconds: seconds,
      syncKey: 'oes_active_session',
      onTick: (remSeconds, formattedTime) => {
        if (timerDigits) timerDigits.textContent = formattedTime;

        if (timerWrapper) {
          if (remSeconds <= 300 && remSeconds > 60) {
            timerWrapper.className = 'exam-timer-wrapper timer-warning';
          } else if (remSeconds <= 60) {
            timerWrapper.className = 'exam-timer-wrapper timer-danger';
          } else {
            timerWrapper.className = 'exam-timer-wrapper';
          }
        }
      },
      onExpire: () => {
        alert('Time is up! Your examination will now be automatically submitted.');
        finalizeSubmission(true);
      }
    });
  }

  function syncSession(remSeconds = null) {
    const remaining = remSeconds !== null ? remSeconds : window.OES_Timer.getRemainingSeconds();
    window.OES_Storage.saveActiveSession({
      examId: currentExam.id,
      studentId: currentUser.id,
      remainingSeconds: remaining,
      userAnswers,
      questionStates,
      currentIndex,
      startTime
    });
  }

  function renderCurrentQuestion() {
    const q = examQuestions[currentIndex];
    if (!q) return;

    // Update state from not-visited to not-answered if viewing without answer
    if (questionStates[q.id] === 'not-visited') {
      questionStates[q.id] = 'not-answered';
    }

    // Header badges
    document.getElementById('q-current-num').textContent = `Question ${currentIndex + 1} of ${examQuestions.length}`;
    document.getElementById('q-current-marks').textContent = `${q.marks || 1} Mark${(q.marks || 1) > 1 ? 's' : ''}`;
    document.getElementById('q-current-type').textContent = q.type === 'MultipleSelect' ? 'Multiple Select' : (q.type === 'TrueFalse' ? 'True / False' : 'Multiple Choice');
    document.getElementById('q-current-text').textContent = q.text;

    // Render Options
    const optionsContainer = document.getElementById('q-options-container');
    const selectedAnswers = userAnswers[q.id] || [];

    const isMulti = q.type === 'MultipleSelect';

    optionsContainer.innerHTML = (q.options || []).map((opt, i) => {
      const isSelected = selectedAnswers.includes(opt);
      const letter = String.fromCharCode(65 + i);

      return `
        <div class="option-item ${isSelected ? 'selected' : ''}" onclick="window.OES_ExamEngine.selectOption('${q.id}', '${encodeURIComponent(opt)}', ${isMulti})">
          <div class="option-indicator">${isSelected ? '✓' : letter}</div>
          <div class="option-label-text">${opt}</div>
        </div>
      `;
    }).join('');

    // Previous / Next button states
    document.getElementById('btn-prev-q').disabled = currentIndex === 0;
    const nextBtn = document.getElementById('btn-next-q');
    if (currentIndex === examQuestions.length - 1) {
      nextBtn.textContent = 'Review & Submit';
    } else {
      nextBtn.textContent = 'Save & Next →';
    }

    // Update Mark for Review button text
    const isReviewed = questionStates[q.id] === 'marked-review' || questionStates[q.id] === 'answered-review';
    document.getElementById('btn-mark-review').textContent = isReviewed ? '★ Marked for Review' : '☆ Mark for Review';

    renderPalette();
    syncSession();
  }

  function selectOption(qId, encodedOpt, isMulti) {
    const opt = decodeURIComponent(encodedOpt);
    if (!userAnswers[qId]) userAnswers[qId] = [];

    if (isMulti) {
      const idx = userAnswers[qId].indexOf(opt);
      if (idx > -1) {
        userAnswers[qId].splice(idx, 1);
      } else {
        userAnswers[qId].push(opt);
      }
    } else {
      userAnswers[qId] = [opt];
    }

    // Update question state
    const isAnswered = userAnswers[qId].length > 0;
    const isReview = questionStates[qId] === 'marked-review' || questionStates[qId] === 'answered-review';

    if (isAnswered) {
      questionStates[qId] = isReview ? 'answered-review' : 'answered';
    } else {
      questionStates[qId] = isReview ? 'marked-review' : 'not-answered';
    }

    renderCurrentQuestion();
  }

  function clearCurrentResponse() {
    const q = examQuestions[currentIndex];
    if (!q) return;

    userAnswers[q.id] = [];
    const isReview = questionStates[q.id] === 'marked-review' || questionStates[q.id] === 'answered-review';
    questionStates[q.id] = isReview ? 'marked-review' : 'not-answered';

    renderCurrentQuestion();
    window.OES_App.showToast('Response cleared for this question.', 'info', 2000);
  }

  function toggleMarkForReview() {
    const q = examQuestions[currentIndex];
    if (!q) return;

    const isAnswered = (userAnswers[q.id] || []).length > 0;
    const current = questionStates[q.id];

    if (current === 'marked-review' || current === 'answered-review') {
      questionStates[q.id] = isAnswered ? 'answered' : 'not-answered';
    } else {
      questionStates[q.id] = isAnswered ? 'answered-review' : 'marked-review';
    }

    renderCurrentQuestion();
  }

  function nextQuestion() {
    if (currentIndex < examQuestions.length - 1) {
      currentIndex++;
      renderCurrentQuestion();
    } else {
      promptSubmitExam();
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      renderCurrentQuestion();
    }
  }

  function jumpToQuestion(index) {
    if (index >= 0 && index < examQuestions.length) {
      currentIndex = index;
      renderCurrentQuestion();
    }
  }

  // --- Render 5-State Question Palette Grid ---
  function renderPalette() {
    const grid = document.getElementById('palette-numbers-grid');
    if (!grid) return;

    let answeredCount = 0;
    let notAnsweredCount = 0;
    let notVisitedCount = 0;
    let markedCount = 0;
    let answeredReviewCount = 0;

    grid.innerHTML = examQuestions.map((q, idx) => {
      const state = questionStates[q.id] || 'not-visited';

      if (state === 'answered') answeredCount++;
      else if (state === 'not-answered') notAnsweredCount++;
      else if (state === 'marked-review') markedCount++;
      else if (state === 'answered-review') answeredReviewCount++;
      else notVisitedCount++;

      const isCurrent = idx === currentIndex;

      return `
        <div class="q-btn state-${state} ${isCurrent ? 'current' : ''}"
             onclick="window.OES_ExamEngine.jumpToQuestion(${idx})"
             title="Question ${idx + 1} (${state})">
          ${idx + 1}
        </div>
      `;
    }).join('');

    // Update legend counter badges
    const setBadge = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setBadge('count-answered', answeredCount);
    setBadge('count-not-answered', notAnsweredCount);
    setBadge('count-not-visited', notVisitedCount);
    setBadge('count-marked-review', markedCount);
    setBadge('count-answered-review', answeredReviewCount);
  }

  // --- Prompt Confirmation & Finalize Submission ---
  function promptSubmitExam() {
    let answered = 0;
    let unanswered = 0;
    let review = 0;

    examQuestions.forEach(q => {
      const ans = userAnswers[q.id] || [];
      if (ans.length > 0) answered++;
      else unanswered++;

      const st = questionStates[q.id];
      if (st === 'marked-review' || st === 'answered-review') review++;
    });

    const modal = document.getElementById('exam-submission-modal');
    document.getElementById('sub-total-q').textContent = examQuestions.length;
    document.getElementById('sub-answered-q').textContent = answered;
    document.getElementById('sub-unanswered-q').textContent = unanswered;
    document.getElementById('sub-review-q').textContent = review;

    modal.classList.add('active');
  }

  function finalizeSubmission(isAutoSubmit = false) {
    window.OES_Timer.stopTimer();

    // Evaluate
    const evaluation = window.OES_Evaluation.evaluateExam(currentExam, userAnswers, examQuestions);
    const timeTaken = Math.max(1, Math.round((Date.now() - (startTime || Date.now())) / 1000));

    const resultRecord = {
      resultId: 'RES-' + Date.now().toString(36).toUpperCase(),
      studentId: currentUser.id,
      studentName: currentUser.name || currentUser.username,
      examId: currentExam.id,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: timeTaken,
      ...evaluation
    };

    // Save Result
    window.OES_Storage.saveResult(resultRecord);

    // Clear active session
    window.OES_Storage.clearActiveSession();

    // Redirect to Result Screen
    window.location.href = `student-results.html?resultId=${resultRecord.resultId}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initExamRoom();

    const cancelSubBtn = document.getElementById('btn-cancel-submission');
    const confirmSubBtn = document.getElementById('btn-confirm-submission');

    if (cancelSubBtn) {
      cancelSubBtn.addEventListener('click', () => {
        document.getElementById('exam-submission-modal').classList.remove('active');
      });
    }

    if (confirmSubBtn) {
      confirmSubBtn.addEventListener('click', () => {
        confirmSubBtn.disabled = true;
        confirmSubBtn.textContent = 'Submitting & Evaluating...';
        finalizeSubmission(false);
      });
    }
  });

  window.OES_ExamEngine = {
    initExamRoom,
    selectOption,
    jumpToQuestion,
    finalizeSubmission
  };

})();

