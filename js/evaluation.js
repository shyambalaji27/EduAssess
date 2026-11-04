/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Automatic Evaluation Engine Module
 * Exposes window.OES_Evaluation
 */

(function () {
  'use strict';

  /**
   * Evaluates student submissions against question bank data
   * @param {Object} exam - The exam object with questionIds, passingPercent, totalMarks
   * @param {Object} userAnswers - Key-value map: { questionId: [selectedOptions] }
   * @param {Array} questions - Array of question objects
   * @returns {Object} Comprehensive evaluation summary
   */
  function evaluateExam(exam, userAnswers = {}, questions = []) {
    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q.id, q));

    let totalMarks = 0;
    let obtainedMarks = 0;
    let attemptedCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const breakdown = [];

    // Evaluate each question in the exam
    exam.questionIds.forEach((qId, index) => {
      const q = questionMap.get(qId);
      if (!q) return;

      const qMarks = Number(q.marks) || 1;
      totalMarks += qMarks;

      const rawUserAns = userAnswers[qId];
      // Normalize user answer into an array of trimmed strings
      let userSelected = [];
      if (Array.isArray(rawUserAns)) {
        userSelected = rawUserAns.map(a => String(a).trim());
      } else if (rawUserAns !== undefined && rawUserAns !== null && rawUserAns !== '') {
        userSelected = [String(rawUserAns).trim()];
      }

      const isAttempted = userSelected.length > 0;
      const correctList = (q.correct || []).map(a => String(a).trim());

      let isCorrect = false;

      if (!isAttempted) {
        unansweredCount++;
        isCorrect = false;
      } else {
        attemptedCount++;
        // Compare answers based on Question Type
        if (q.type === 'MultipleSelect') {
          // Exact Set Match: size must match, and every user option must be in correctList
          const setA = new Set(userSelected);
          const setB = new Set(correctList);
          if (setA.size === setB.size && [...setA].every(item => setB.has(item))) {
            isCorrect = true;
          } else {
            isCorrect = false;
          }
        } else {
          // MCQ or TrueFalse: single choice matching
          if (userSelected.length > 0 && correctList.includes(userSelected[0])) {
            isCorrect = true;
          } else {
            isCorrect = false;
          }
        }

        if (isCorrect) {
          correctCount++;
          obtainedMarks += qMarks;
        } else {
          wrongCount++;
        }
      }

      breakdown.push({
        index: index + 1,
        questionId: q.id,
        text: q.text,
        subject: q.subject,
        topic: q.topic || '',
        type: q.type,
        options: q.options || [],
        userAnswers: userSelected,
        correctAnswers: correctList,
        isAttempted,
        isCorrect,
        marksAwarded: isCorrect ? qMarks : 0,
        maxMarks: qMarks,
        explanation: q.explanation || 'No explanation provided.'
      });
    });

    // Guard against divide by zero
    const safeTotalMarks = totalMarks > 0 ? totalMarks : 1;
    const rawPercentage = (obtainedMarks / safeTotalMarks) * 100;
    const percentage = Math.round(rawPercentage * 100) / 100; // 2 decimal places

    const passingPercent = Number(exam.passingPercent) || 50;
    const passed = percentage >= passingPercent;

    return {
      totalQuestions: exam.questionIds.length,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      totalMarks,
      obtainedMarks,
      percentage,
      passingPercent,
      passed,
      breakdown
    };
  }

  window.OES_Evaluation = {
    evaluateExam
  };

})();

