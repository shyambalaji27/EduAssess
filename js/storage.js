/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Centralized LocalStorage Management Module
 * Exposes window.OES_Storage
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    USERS: 'oes_users',
    QUESTIONS: 'oes_questions',
    EXAMS: 'oes_exams',
    RESULTS: 'oes_exam_results',
    ACTIVE_SESSION: 'oes_active_session',
    SETTINGS: 'oes_app_settings',
    PDFS: 'oes_pdf_question_banks'
  };

  // Safe JSON Parsing Helper
  function safeJSONParse(str, fallback = null) {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (err) {
      console.error('OES Storage Parse Error:', err);
      return fallback;
    }
  }

  // Generic Get & Save
  function getItem(key, fallback = null) {
    return safeJSONParse(localStorage.getItem(key), fallback);
  }

  function setItem(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('OES Storage Save Error:', err);
      return false;
    }
  }

  function removeItem(key) {
    localStorage.removeItem(key);
  }

  // Sample PDF Base64
  const SAMPLE_PDF_BASE64 = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqIDIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iajMgMCBvYmo8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+L0NvbnRlbnRzIDQgMCBSPj5lbmRvYmogNCAwIG9iajw8L0xlbmd0aCAxMjA+PnN0cmVhbQpCVAovRjEgMTggVGYKNTAgNzUwIFRkCihFZHVBc3Nlc3MgT25saW5lIEV4YW1pbmF0aW9uIFN5c3RlbSAtIFF1ZXN0aW9uIEJhbmsgUERGKVRqCjUwIDcyMCBUZApDb3ZlcmluZyA1MCBDb21wcmVoZW5zaXZlIEV4YW0gUXVlc3Rpb25zLCBBbnN3ZXJzICYgRXhwbGFuYXRpb25zLlRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCjAwMDAwMDAyMTYgMDAwMDAgbgp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM4NgolJUVPRg==";

  // ================= DEMO DATA SEEDING =================
  function seedDemoData(force = false) {
    // 1. Seed Users
    if (force || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      const demoUsers = [
        {
          id: 'admin',
          username: 'admin',
          password: 'Admin@123',
          name: 'System Administrator',
          role: 'admin',
          email: 'admin@oes.edu',
          department: 'Administration',
          year: 'N/A',
          createdAt: '2026-01-01'
        },
        {
          id: 'STU001',
          username: 'STU001',
          password: 'Student@123',
          name: 'Alice Smith',
          role: 'student',
          email: 'alice.smith@university.edu',
          department: 'Computer Science',
          year: '3rd Year',
          createdAt: '2026-01-10'
        },
        {
          id: 'STU002',
          username: 'STU002',
          password: 'Student@123',
          name: 'Bob Johnson',
          role: 'student',
          email: 'bob.j@university.edu',
          department: 'Information Technology',
          year: '2nd Year',
          createdAt: '2026-01-15'
        },
        {
          id: 'STU003',
          username: 'STU003',
          password: 'Student@123',
          name: 'Charlie Brown',
          role: 'student',
          email: 'charlie.b@university.edu',
          department: 'Electrical Engineering',
          year: '1st Year',
          createdAt: '2026-02-01'
        }
      ];
      setItem(STORAGE_KEYS.USERS, demoUsers);
    }

    // 2. Seed Questions (50 Questions per Subject, 200 Questions Total)
    const existingQuestions = getItem(STORAGE_KEYS.QUESTIONS, []);
    if (force || existingQuestions.length < 200) {
      if (window.OES_DEFAULT_QUESTIONS && window.OES_DEFAULT_QUESTIONS.length >= 200) {
        setItem(STORAGE_KEYS.QUESTIONS, window.OES_DEFAULT_QUESTIONS);
      } else if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
        // Fallback default starter questions if data script is delayed
        setItem(STORAGE_KEYS.QUESTIONS, []);
      }
    }

    // 3. Seed Featured Exams
    if (force || !localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      const demoExams = [
        {
          id: 'EX-CN-101',
          title: 'Computer Networks Assessment',
          subject: 'Computer Networks',
          description: 'Comprehensive test on OSI Model, IP addressing, TCP/UDP, and routing protocols.',
          questionIds: ['Q-CN-01', 'Q-CN-02', 'Q-CN-03', 'Q-CN-04', 'Q-CN-05', 'Q-CN-06', 'Q-CN-07', 'Q-CN-08', 'Q-CN-09', 'Q-CN-10'],
          totalMarks: 20,
          duration: 20,
          passingPercent: 60,
          startDate: '2026-01-01',
          startTime: '08:00',
          endDate: '2026-12-31',
          endTime: '23:59',
          attemptsAllowed: 3,
          status: 'Active',
          createdAt: '2026-01-10'
        },
        {
          id: 'EX-CS-102',
          title: 'Cyber Security Fundamentals',
          subject: 'Cyber Security',
          description: 'Assessment covering cryptography, CIA triad, OWASP vulnerabilities, and network security.',
          questionIds: ['Q-CS-01', 'Q-CS-02', 'Q-CS-03', 'Q-CS-04', 'Q-CS-05', 'Q-CS-06', 'Q-CS-07', 'Q-CS-08', 'Q-CS-09', 'Q-CS-10'],
          totalMarks: 10,
          duration: 15,
          passingPercent: 50,
          startDate: '2026-01-01',
          startTime: '08:00',
          endDate: '2026-12-31',
          endTime: '23:59',
          attemptsAllowed: 3,
          status: 'Active',
          createdAt: '2026-01-12'
        },
        {
          id: 'EX-DB-103',
          title: 'Database Management Systems Certification',
          subject: 'Database Management Systems',
          description: 'Evaluation of relational models, SQL constructs, ACID properties, and transaction indexing.',
          questionIds: ['Q-DB-01', 'Q-DB-02', 'Q-DB-03', 'Q-DB-04', 'Q-DB-05', 'Q-DB-06', 'Q-DB-07', 'Q-DB-08', 'Q-DB-09', 'Q-DB-10'],
          totalMarks: 10,
          duration: 15,
          passingPercent: 60,
          startDate: '2026-01-01',
          startTime: '08:00',
          endDate: '2026-12-31',
          endTime: '23:59',
          attemptsAllowed: 2,
          status: 'Active',
          createdAt: '2026-01-15'
        },
        {
          id: 'EX-OS-104',
          title: 'Operating Systems Core Concepts',
          subject: 'Operating Systems',
          description: 'Testing process scheduling, virtual memory paging, deadlocks, and IPC mechanisms.',
          questionIds: ['Q-OS-01', 'Q-OS-02', 'Q-OS-03', 'Q-OS-04', 'Q-OS-05', 'Q-OS-06', 'Q-OS-07', 'Q-OS-08', 'Q-OS-09', 'Q-OS-10'],
          totalMarks: 20,
          duration: 20,
          passingPercent: 50,
          startDate: '2026-01-01',
          startTime: '08:00',
          endDate: '2026-12-31',
          endTime: '23:59',
          attemptsAllowed: 2,
          status: 'Active',
          createdAt: '2026-01-20'
        }
      ];
      setItem(STORAGE_KEYS.EXAMS, demoExams);
    }

    // 4. Seed Historical Results
    if (force || !localStorage.getItem(STORAGE_KEYS.RESULTS)) {
      const demoResults = [
        {
          resultId: 'RES-001',
          studentId: 'STU001',
          studentName: 'Alice Smith',
          examId: 'EX-CN-101',
          examTitle: 'Computer Networks Assessment',
          subject: 'Computer Networks',
          submittedAt: '2026-02-10T14:30:00.000Z',
          totalQuestions: 10,
          attemptedQuestions: 10,
          correctAnswers: 9,
          wrongAnswers: 1,
          unanswered: 0,
          totalMarks: 20,
          obtainedMarks: 18,
          percentage: 90,
          passed: true,
          timeTakenSeconds: 780,
          breakdown: []
        },
        {
          resultId: 'RES-002',
          studentId: 'STU002',
          studentName: 'Bob Johnson',
          examId: 'EX-CS-102',
          examTitle: 'Cyber Security Fundamentals',
          subject: 'Cyber Security',
          submittedAt: '2026-02-12T10:15:00.000Z',
          totalQuestions: 10,
          attemptedQuestions: 9,
          correctAnswers: 8,
          wrongAnswers: 1,
          unanswered: 1,
          totalMarks: 10,
          obtainedMarks: 8,
          percentage: 80,
          passed: true,
          timeTakenSeconds: 610,
          breakdown: []
        }
      ];
      setItem(STORAGE_KEYS.RESULTS, demoResults);
    }

    // 5. Seed Initial PDF Question Banks
    if (force || !localStorage.getItem(STORAGE_KEYS.PDFS)) {
      const demoPdfs = [
        {
          id: 'PDF-CN-01',
          title: 'Computer Networks 50-Question Master Bank',
          subject: 'Computer Networks',
          description: 'Official 50-question collection covering OSI, TCP/UDP, IP Subnetting, and Routing protocols with full solutions.',
          fileName: 'Computer_Networks_Question_Bank.pdf',
          fileSize: '245 KB',
          fileData: SAMPLE_PDF_BASE64,
          uploadedBy: 'Administrator',
          uploadedAt: '2026-01-15'
        },
        {
          id: 'PDF-CS-02',
          title: 'Cyber Security Comprehensive Question Bank',
          subject: 'Cyber Security',
          description: '50 questions on Cryptography, CIA Triad, OWASP Top 10 vulnerabilities, and network security defenses.',
          fileName: 'Cyber_Security_Question_Bank.pdf',
          fileSize: '310 KB',
          fileData: SAMPLE_PDF_BASE64,
          uploadedBy: 'Administrator',
          uploadedAt: '2026-01-18'
        },
        {
          id: 'PDF-DB-03',
          title: 'Database Management Systems 50 Questions & Solutions',
          subject: 'Database Management Systems',
          description: '50 relational schema, SQL queries, B+ tree indexing, and ACID transaction questions.',
          fileName: 'DBMS_Question_Bank.pdf',
          fileSize: '280 KB',
          fileData: SAMPLE_PDF_BASE64,
          uploadedBy: 'Administrator',
          uploadedAt: '2026-01-20'
        },
        {
          id: 'PDF-OS-04',
          title: 'Operating Systems Complete Question Repository',
          subject: 'Operating Systems',
          description: '50-question bank covering CPU scheduling, memory management, virtual memory paging, and deadlocks.',
          fileName: 'Operating_Systems_Question_Bank.pdf',
          fileSize: '295 KB',
          fileData: SAMPLE_PDF_BASE64,
          uploadedBy: 'Administrator',
          uploadedAt: '2026-01-22'
        }
      ];
      setItem(STORAGE_KEYS.PDFS, demoPdfs);
    }

    // 6. Settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setItem(STORAGE_KEYS.SETTINGS, { theme: 'light' });
    }
  }

  // Auto-initialize demo data on script execution
  seedDemoData(false);

  // ================= CRUD API =================

  // --- Users API ---
  function getUsers() {
    return getItem(STORAGE_KEYS.USERS, []);
  }

  function getUserById(id) {
    const users = getUsers();
    return users.find(u => u.id === id || u.username === id) || null;
  }

  function saveUser(user) {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex > -1) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    return setItem(STORAGE_KEYS.USERS, users);
  }

  function deleteUser(id) {
    const users = getUsers().filter(u => u.id !== id);
    return setItem(STORAGE_KEYS.USERS, users);
  }

  // --- Questions API ---
  function getQuestions() {
    // If local storage has fewer than 200 questions but default questions are available, update automatically
    const qs = getItem(STORAGE_KEYS.QUESTIONS, []);
    if (qs.length < 200 && window.OES_DEFAULT_QUESTIONS && window.OES_DEFAULT_QUESTIONS.length >= 200) {
      setItem(STORAGE_KEYS.QUESTIONS, window.OES_DEFAULT_QUESTIONS);
      return window.OES_DEFAULT_QUESTIONS;
    }
    return qs;
  }

  function getQuestionById(id) {
    const questions = getQuestions();
    return questions.find(q => q.id === id) || null;
  }

  function saveQuestion(question) {
    const questions = getQuestions();
    const idx = questions.findIndex(q => q.id === question.id);
    if (idx > -1) {
      questions[idx] = question;
    } else {
      questions.push(question);
    }
    return setItem(STORAGE_KEYS.QUESTIONS, questions);
  }

  function deleteQuestion(id) {
    const questions = getQuestions().filter(q => q.id !== id);
    return setItem(STORAGE_KEYS.QUESTIONS, questions);
  }

  // --- PDF Question Banks API ---
  function getPdfs() {
    return getItem(STORAGE_KEYS.PDFS, []);
  }

  function getPdfById(id) {
    const pdfs = getPdfs();
    return pdfs.find(p => p.id === id) || null;
  }

  function savePdf(pdf) {
    const pdfs = getPdfs();
    const idx = pdfs.findIndex(p => p.id === pdf.id);
    if (idx > -1) {
      pdfs[idx] = pdf;
    } else {
      pdfs.unshift(pdf); // latest on top
    }
    return setItem(STORAGE_KEYS.PDFS, pdfs);
  }

  function deletePdf(id) {
    const pdfs = getPdfs().filter(p => p.id !== id);
    return setItem(STORAGE_KEYS.PDFS, pdfs);
  }

  // --- Exams API ---
  function getExams() {
    return getItem(STORAGE_KEYS.EXAMS, []);
  }

  function getExamById(id) {
    const exams = getExams();
    return exams.find(e => e.id === id) || null;
  }

  function saveExam(exam) {
    const exams = getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx > -1) {
      exams[idx] = exam;
    } else {
      exams.push(exam);
    }
    return setItem(STORAGE_KEYS.EXAMS, exams);
  }

  function deleteExam(id) {
    const exams = getExams().filter(e => e.id !== id);
    return setItem(STORAGE_KEYS.EXAMS, exams);
  }

  // --- Results API ---
  function getResults() {
    return getItem(STORAGE_KEYS.RESULTS, []);
  }

  function getResultsByStudent(studentId) {
    return getResults().filter(r => r.studentId === studentId);
  }

  function getResultById(resultId) {
    return getResults().find(r => r.resultId === resultId) || null;
  }

  function saveResult(result) {
    const results = getResults();
    results.unshift(result);
    return setItem(STORAGE_KEYS.RESULTS, results);
  }

  // --- Active Exam Session API ---
  function getActiveSession() {
    return getItem(STORAGE_KEYS.ACTIVE_SESSION, null);
  }

  function saveActiveSession(session) {
    return setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
  }

  function clearActiveSession() {
    removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }

  // --- Settings API ---
  function getSettings() {
    return getItem(STORAGE_KEYS.SETTINGS, { theme: 'light' });
  }

  function saveSettings(settings) {
    return setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // --- System Backup & Restore ---
  function exportBackupJSON() {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: {
        users: getUsers(),
        questions: getQuestions(),
        exams: getExams(),
        results: getResults(),
        pdfs: getPdfs(),
        settings: getSettings()
      }
    };
    return JSON.stringify(payload, null, 2);
  }

  function importBackupJSON(jsonStr) {
    const parsed = safeJSONParse(jsonStr);
    if (!parsed || !parsed.data) {
      return { success: false, message: 'Invalid backup JSON file.' };
    }
    const { users, questions, exams, results, pdfs, settings } = parsed.data;
    if (users) setItem(STORAGE_KEYS.USERS, users);
    if (questions) setItem(STORAGE_KEYS.QUESTIONS, questions);
    if (exams) setItem(STORAGE_KEYS.EXAMS, exams);
    if (results) setItem(STORAGE_KEYS.RESULTS, results);
    if (pdfs) setItem(STORAGE_KEYS.PDFS, pdfs);
    if (settings) setItem(STORAGE_KEYS.SETTINGS, settings);
    return { success: true, message: 'Backup restored successfully!' };
  }

  function resetAllData() {
    seedDemoData(true);
    return { success: true, message: 'All demo data reset to default.' };
  }

  // Export to global window object
  window.OES_Storage = {
    KEYS: STORAGE_KEYS,
    getUsers,
    getUserById,
    saveUser,
    deleteUser,
    getQuestions,
    getQuestionById,
    saveQuestion,
    deleteQuestion,
    getPdfs,
    getPdfById,
    savePdf,
    deletePdf,
    getExams,
    getExamById,
    saveExam,
    deleteExam,
    getResults,
    getResultsByStudent,
    getResultById,
    saveResult,
    getActiveSession,
    saveActiveSession,
    clearActiveSession,
    getSettings,
    saveSettings,
    exportBackupJSON,
    importBackupJSON,
    resetAllData
  };

})();
