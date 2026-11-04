/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Exam Countdown Timer & Session Persistence
 * Exposes window.OES_Timer
 */

(function () {
  'use strict';

  let timerInterval = null;
  let remainingSeconds = 0;
  let onTickCallback = null;
  let onExpireCallback = null;

  function formatTime(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function startTimer({ initialSeconds, onTick, onExpire, syncKey = null }) {
    stopTimer();

    remainingSeconds = Math.max(0, Math.floor(initialSeconds));
    onTickCallback = onTick;
    onExpireCallback = onExpire;

    // Trigger initial tick
    if (typeof onTickCallback === 'function') {
      onTickCallback(remainingSeconds, formatTime(remainingSeconds));
    }

    timerInterval = setInterval(() => {
      remainingSeconds--;

      // Sync remaining time with active session in LocalStorage
      if (syncKey && window.OES_Storage) {
        const session = window.OES_Storage.getActiveSession();
        if (session) {
          session.remainingSeconds = remainingSeconds;
          window.OES_Storage.saveActiveSession(session);
        }
      }

      if (typeof onTickCallback === 'function') {
        onTickCallback(remainingSeconds, formatTime(remainingSeconds));
      }

      if (remainingSeconds <= 0) {
        stopTimer();
        if (typeof onExpireCallback === 'function') {
          onExpireCallback();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function getRemainingSeconds() {
    return remainingSeconds;
  }

  window.OES_Timer = {
    startTimer,
    stopTimer,
    formatTime,
    getRemainingSeconds
  };

})();

