/**
 * ONLINE EXAMINATION AND ASSESSMENT SYSTEM
 * Authentication and Access Guard Module
 * Exposes window.OES_Auth
 */

(function () {
  'use strict';

  const AUTH_SESSION_KEY = 'oes_current_user';

  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    }
  }

  /**
   * Login or Auto-Register function
   */
  function login(username, password, expectedRole = null, studentExtraData = {}) {
    if (!window.OES_Storage) {
      return { success: false, message: 'Storage service not initialized.' };
    }

    const cleanUsername = (username || '').trim();
    if (!cleanUsername) {
      return { success: false, message: 'Please enter a valid Username or Student ID.' };
    }

    const users = window.OES_Storage.getUsers();
    const cleanLower = cleanUsername.toLowerCase();

    // Check if user already exists
    const existingUser = users.find(u =>
      (u.username && u.username.toLowerCase() === cleanLower) ||
      (u.id && u.id.toLowerCase() === cleanLower)
    );

    if (existingUser) {
      // Role validation
      if (expectedRole && existingUser.role !== expectedRole) {
        return {
          success: false,
          message: `Access denied. This account has role "${existingUser.role.toUpperCase()}" and cannot sign in through the ${expectedRole.toUpperCase()} portal.`
        };
      }

      // Password verification
      if (existingUser.password !== password) {
        return { success: false, message: 'Incorrect password. Please verify and try again.' };
      }

      setCurrentUser(existingUser);
      return { success: true, user: existingUser, isNew: false };
    }

    // If user does not exist AND expectedRole is 'student', AUTO-PROVISION / REGISTER ON THE FLY!
    if (expectedRole === 'student') {
      const displayName = studentExtraData.name && studentExtraData.name.trim()
        ? studentExtraData.name.trim()
        : cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

      const newStudent = {
        id: cleanUsername.toUpperCase(),
        username: cleanUsername.toUpperCase(),
        password: password || 'Student@123',
        name: displayName,
        role: 'student',
        email: studentExtraData.email || `${cleanLower.replace(/\s+/g, '.')}@university.edu`,
        department: studentExtraData.department || 'Computer Science',
        year: studentExtraData.year || '1st Year',
        createdAt: new Date().toISOString().split('T')[0]
      };

      window.OES_Storage.saveUser(newStudent);
      setCurrentUser(newStudent);
      return { success: true, user: newStudent, isNew: true };
    }

    return {
      success: false,
      message: 'Invalid credentials. User does not exist.'
    };
  }

  /**
   * Explicit student registration
   */
  function registerStudent(name, id, password, department = 'Computer Science', year = '1st Year', email = '') {
    if (!window.OES_Storage) {
      return { success: false, message: 'Storage service not initialized.' };
    }

    const cleanId = (id || '').trim().toUpperCase();
    const cleanName = (name || '').trim();

    if (!cleanId || !cleanName) {
      return { success: false, message: 'Full Name and Student ID are required.' };
    }

    const users = window.OES_Storage.getUsers();
    const existing = users.find(u => u.id.toUpperCase() === cleanId || u.username.toUpperCase() === cleanId);

    if (existing) {
      // If already exists with matching password, log them in
      if (existing.password === password) {
        setCurrentUser(existing);
        return { success: true, user: existing, message: `Welcome back, ${existing.name}!` };
      }
      return { success: false, message: `Student ID "${cleanId}" is already registered. If this is your ID, please sign in with your password.` };
    }

    const newStudent = {
      id: cleanId,
      username: cleanId,
      password: password || 'Student@123',
      name: cleanName,
      role: 'student',
      email: email.trim() || `${cleanId.toLowerCase()}@university.edu`,
      department: department || 'Computer Science',
      year: year || '1st Year',
      createdAt: new Date().toISOString().split('T')[0]
    };

    window.OES_Storage.saveUser(newStudent);
    setCurrentUser(newStudent);
    return { success: true, user: newStudent, message: `Account created! Welcome, ${cleanName}.` };
  }

  function logout() {
    setCurrentUser(null);
    window.location.href = 'index.html';
  }

  /**
   * Route Guard: Protects dashboard and exam pages
   */
  function checkAuth(requiredRole = null) {
    const user = getCurrentUser();

    if (!user) {
      if (requiredRole === 'admin') {
        window.location.href = 'admin-login.html';
      } else {
        window.location.href = 'student-login.html';
      }
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'student-dashboard.html';
      }
      return false;
    }

    return true;
  }

  // Setup login forms on page load
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Admin Login Form Handler
    const adminForm = document.getElementById('admin-login-form');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');
        const errorEl = document.getElementById('admin-login-error');

        const result = login(usernameInput.value, passwordInput.value, 'admin');
        if (result.success) {
          if (window.OES_App) window.OES_App.showToast('Login successful! Redirecting to Admin Dashboard...', 'success');
          setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
          }, 400);
        } else {
          if (errorEl) {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
          }
          if (window.OES_App) window.OES_App.showToast(result.message, 'danger');
        }
      });
    }

    // 2. Student Login Form Handler (with Auto-Provisioning for Any ID)
    const studentForm = document.getElementById('student-login-form');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('student-id');
        const nameInput = document.getElementById('student-name-optional');
        const passwordInput = document.getElementById('student-password');
        const errorEl = document.getElementById('student-login-error');

        const customName = nameInput ? nameInput.value.trim() : '';

        const result = login(idInput.value, passwordInput.value, 'student', { name: customName });
        if (result.success) {
          const toastMsg = result.isNew
            ? `Account created! Welcome ${result.user.name} (${result.user.id}). Redirecting...`
            : `Welcome back, ${result.user.name}! Redirecting...`;

          if (window.OES_App) window.OES_App.showToast(toastMsg, 'success');
          setTimeout(() => {
            window.location.href = 'student-dashboard.html';
          }, 500);
        } else {
          if (errorEl) {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
          }
          if (window.OES_App) window.OES_App.showToast(result.message, 'danger');
        }
      });
    }

    // 3. New Student Explicit Registration Form Handler
    const studentRegisterForm = document.getElementById('student-register-form');
    if (studentRegisterForm) {
      studentRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-student-name').value;
        const id = document.getElementById('reg-student-id').value;
        const password = document.getElementById('reg-student-pwd').value;
        const dept = document.getElementById('reg-student-dept').value;
        const year = document.getElementById('reg-student-year').value;
        const email = document.getElementById('reg-student-email') ? document.getElementById('reg-student-email').value : '';
        const errorEl = document.getElementById('student-reg-error');

        const result = registerStudent(name, id, password, dept, year, email);
        if (result.success) {
          if (window.OES_App) window.OES_App.showToast(`Welcome, ${result.user.name}! Account registered. Entering dashboard...`, 'success');
          setTimeout(() => {
            window.location.href = 'student-dashboard.html';
          }, 500);
        } else {
          if (errorEl) {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
          }
          if (window.OES_App) window.OES_App.showToast(result.message, 'danger');
        }
      });
    }

    // 4. Password Toggle Handlers
    const toggleBtns = document.querySelectorAll('.pwd-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          btn.textContent = isPassword ? 'Hide' : 'Show';
        }
      });
    });

    // 5. Quick Demo Fill Pills
    const demoPills = document.querySelectorAll('[data-demo-user]');
    demoPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const user = pill.getAttribute('data-demo-user');
        const pass = pill.getAttribute('data-demo-pass');
        const name = pill.getAttribute('data-demo-name') || '';

        const userInput = document.getElementById('admin-username') || document.getElementById('student-id');
        const passInput = document.getElementById('admin-password') || document.getElementById('student-password');
        const nameInput = document.getElementById('student-name-optional');

        if (userInput && passInput) {
          userInput.value = user;
          passInput.value = pass;
          if (nameInput && name) nameInput.value = name;
          if (window.OES_App) window.OES_App.showToast(`Filled credentials for ${user}`, 'info');
        }
      });
    });

    // 6. Logout Buttons
    const logoutBtns = document.querySelectorAll('.btn-logout, #btn-logout');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.OES_App) {
          window.OES_App.confirmModal({
            title: 'Sign Out',
            message: 'Are you sure you want to end your current session?',
            confirmText: 'Sign Out',
            confirmClass: 'btn-danger',
            onConfirm: () => logout()
          });
        } else {
          logout();
        }
      });
    });
  });

  window.OES_Auth = {
    getCurrentUser,
    login,
    registerStudent,
    logout,
    checkAuth
  };

})();
