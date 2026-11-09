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
    PDFS: 'oes_pdf_question_banks',
    VIDEOS: 'oes_video_modules'
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

  
  function extractYoutubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
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

    
    // 6. Seed Video Modules for all Subjects
    if (force || !localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
      const demoVideos = [
        // Computer Networks
        {
          id: 'VID-CN-01',
          subject: 'Computer Networks',
          moduleNumber: 1,
          moduleTitle: 'Module 1: OSI 7-Layer Architecture & TCP/IP Model',
          topic: 'Layer 1 to Layer 7 Protocols, Encapsulation & Packet Flow',
          description: 'Master the fundamental architecture of modern computer networking, OSI layers, and TCP/IP protocol suite.',
          youtubeUrl: 'https://www.youtube.com/watch?v=IPvYjXCsTg8',
          duration: '1 hr 45 mins',
          instructor: 'freeCodeCamp'
        },
        {
          id: 'VID-CN-02',
          subject: 'Computer Networks',
          moduleNumber: 2,
          moduleTitle: 'Module 2: IPv4 Addressing, Subnetting & CIDR Calculations',
          topic: 'Subnet Masks, Slash Notation, Network & Broadcast IDs',
          description: 'Step-by-step visual tutorial on binary subnetting, CIDR notation, and IP address allocation.',
          youtubeUrl: 'https://www.youtube.com/watch?v=ecC38311k6s',
          duration: '35 mins',
          instructor: 'NetworkChuck'
        },
        {
          id: 'VID-CN-03',
          subject: 'Computer Networks',
          moduleNumber: 3,
          moduleTitle: 'Module 3: Routing Protocols (RIP, OSPF, BGP) & Algorithms',
          topic: 'Dijkstra SPF, Distance Vector, Autonomous Systems',
          description: 'Comprehensive breakdown of interior and exterior gateway routing protocols across internetworks.',
          youtubeUrl: 'https://www.youtube.com/watch?v=rYod3DeeIl4',
          duration: '42 mins',
          instructor: 'Cisco Networking Guide'
        },
        {
          id: 'VID-CN-04',
          subject: 'Computer Networks',
          moduleNumber: 4,
          moduleTitle: 'Module 4: Transport Layer Protocols (TCP vs UDP)',
          topic: 'TCP 3-Way Handshake, Flow Control & Congestion Windows',
          description: 'Deep dive into connection-oriented TCP guarantees, sequence numbering, and UDP datagram sockets.',
          youtubeUrl: 'https://www.youtube.com/watch?v=uwoD5YsGACg',
          duration: '28 mins',
          instructor: 'Computer Science Lessons'
        },
        {
          id: 'VID-CN-05',
          subject: 'Computer Networks',
          moduleNumber: 5,
          moduleTitle: 'Module 5: Application Layer (DNS, HTTP/HTTPS, DHCP)',
          topic: 'Name Resolution, TLS Handshake, Port Numbers',
          description: 'Understand how DNS queries resolve, how SSL/TLS secures web traffic, and dynamic host configuration.',
          youtubeUrl: 'https://www.youtube.com/watch?v=27r4BsXZ1J0',
          duration: '32 mins',
          instructor: 'PowerCert Animated Videos'
        },
        {
          id: 'VID-CN-06',
          subject: 'Computer Networks',
          moduleNumber: 6,
          moduleTitle: 'Module 6: Network Security, Firewalls & VPNs',
          topic: 'Packet Filtering, State inspection, IPsec Tunneling',
          description: 'Core concepts of network defense, perimeter firewalls, DMZ architecture, and encrypted tunneling.',
          youtubeUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
          duration: '38 mins',
          instructor: 'Eli the Computer Guy'
        },

        // Cyber Security
        {
          id: 'VID-CS-01',
          subject: 'Cyber Security',
          moduleNumber: 1,
          moduleTitle: 'Module 1: Information Security & CIA Triad Fundamentals',
          topic: 'Confidentiality, Integrity, Availability & Threat Models',
          description: 'Foundational principles of cybersecurity, threat taxonomy, risk assessment, and security controls.',
          youtubeUrl: 'https://www.youtube.com/watch?v=U_P23SqJaDc',
          duration: '2 hrs 10 mins',
          instructor: 'freeCodeCamp'
        },
        {
          id: 'VID-CS-02',
          subject: 'Cyber Security',
          moduleNumber: 2,
          moduleTitle: 'Module 2: Cryptography (Symmetric, Asymmetric & Hashing)',
          topic: 'AES, DES, RSA Public Key, SHA-256, Digital Signatures',
          description: 'Learn mathematical foundations of modern cryptography, key exchanges, and digital certificates.',
          youtubeUrl: 'https://www.youtube.com/watch?v=jhXCTbFnK8o',
          duration: '45 mins',
          instructor: 'Gate Smashers'
        },
        {
          id: 'VID-CS-03',
          subject: 'Cyber Security',
          moduleNumber: 3,
          moduleTitle: 'Module 3: Network Attacks (MITM, DoS/DDoS, ARP Spoofing)',
          topic: 'Packet Interception, Amplification Attacks, Session Hijacking',
          description: 'Detailed technical analysis of classic network attacks and hands-on packet capture defense strategies.',
          youtubeUrl: 'https://www.youtube.com/watch?v=-enHfpM-jdY',
          duration: '30 mins',
          instructor: 'NetworkChuck'
        },
        {
          id: 'VID-CS-04',
          subject: 'Cyber Security',
          moduleNumber: 4,
          moduleTitle: 'Module 4: Web Security & OWASP Top 10 (SQLi, XSS, CSRF)',
          topic: 'Injection Attacks, Cross-Site Scripting, Parameterized Queries',
          description: 'In-depth exploration of the most prevalent web application vulnerabilities and prevention standards.',
          youtubeUrl: 'https://www.youtube.com/watch?v=2_lswM1S264',
          duration: '50 mins',
          instructor: 'freeCodeCamp'
        },
        {
          id: 'VID-CS-05',
          subject: 'Cyber Security',
          moduleNumber: 5,
          moduleTitle: 'Module 5: Defensive Architectures (Firewalls, WAF, IDS/IPS)',
          topic: 'Layer 7 Filtering, Signature vs Anomaly Detection, SIEM',
          description: 'Building multi-tiered security operations centers, firewall configurations, and intrusion prevention.',
          youtubeUrl: 'https://www.youtube.com/watch?v=kDEX1HXybrk',
          duration: '36 mins',
          instructor: 'Cyber Security Academy'
        },
        {
          id: 'VID-CS-06',
          subject: 'Cyber Security',
          moduleNumber: 6,
          moduleTitle: 'Module 6: Ethical Hacking & Penetration Testing Workflow',
          topic: 'Reconnaissance, Scanning, Exploitation & Reporting',
          description: 'End-to-end guide to penetration testing methodologies, vulnerability discovery, and remediation.',
          youtubeUrl: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
          duration: '1 hr 15 mins',
          instructor: 'Edureka'
        },

        // Database Management Systems
        {
          id: 'VID-DB-01',
          subject: 'Database Management Systems',
          moduleNumber: 1,
          moduleTitle: 'Module 1: Database Architecture & Relational Model Basics',
          topic: 'Three-Schema Architecture, Schemas, Instances & Tuples',
          description: 'Foundations of database systems, physical vs logical data independence, and relational definitions.',
          youtubeUrl: 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
          duration: '1 hr 20 mins',
          instructor: 'freeCodeCamp'
        },
        {
          id: 'VID-DB-02',
          subject: 'Database Management Systems',
          moduleNumber: 2,
          moduleTitle: 'Module 2: Entity-Relationship (ER) Diagrams & Relational Algebra',
          topic: 'Entities, Relationships, Cardinality & Select/Project/Join',
          description: 'Conceptual data modeling with ER diagrams and mathematical foundation of relational query operations.',
          youtubeUrl: 'https://www.youtube.com/watch?v=4Z9KEBexzcc',
          duration: '40 mins',
          instructor: 'Gate Smashers'
        },
        {
          id: 'VID-DB-03',
          subject: 'Database Management Systems',
          moduleNumber: 3,
          moduleTitle: 'Module 3: SQL Mastery (DDL, DML, Joins, Subqueries & Aggregation)',
          topic: 'SELECT, INNER/LEFT/RIGHT JOIN, GROUP BY, HAVING',
          description: 'Master structured query language with practical examples across complex multi-table queries.',
          youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeRR3h4',
          duration: '1 hr 05 mins',
          instructor: 'Programming with Mosh'
        },
        {
          id: 'VID-DB-04',
          subject: 'Database Management Systems',
          moduleNumber: 4,
          moduleTitle: 'Module 4: Database Normalization (1NF, 2NF, 3NF, BCNF)',
          topic: 'Functional Dependencies, Prime Attributes, Lossless Joins',
          description: 'Eliminate data anomalies and redundancies using step-by-step normal form decompositions.',
          youtubeUrl: 'https://www.youtube.com/watch?v=UrYLYV7WSHM',
          duration: '48 mins',
          instructor: 'Knowledge Gate'
        },
        {
          id: 'VID-DB-05',
          subject: 'Database Management Systems',
          moduleNumber: 5,
          moduleTitle: 'Module 5: Transactions, Concurrency Control & ACID Properties',
          topic: 'Atomicity, Consistency, Isolation, Durability, 2PL, Deadlocks',
          description: 'Understand schedules, serializability, lock-based protocols, and crash recovery with write-ahead logs.',
          youtubeUrl: 'https://www.youtube.com/watch?v=r0bKqZ5E2eI',
          duration: '52 mins',
          instructor: 'Gate Smashers'
        },
        {
          id: 'VID-DB-06',
          subject: 'Database Management Systems',
          moduleNumber: 6,
          moduleTitle: 'Module 6: Indexing Techniques (B-Trees, B+ Trees) & Query Optimization',
          topic: 'Clustered vs Secondary Indexes, Search Trees, Query Plans',
          description: 'How database engines achieve logarithmic search times using balanced B+ tree index pages.',
          youtubeUrl: 'https://www.youtube.com/watch?v=aZjYr87r1b8',
          duration: '38 mins',
          instructor: 'Abdul Bari'
        },

        // Operating Systems
        {
          id: 'VID-OS-01',
          subject: 'Operating Systems',
          moduleNumber: 1,
          moduleTitle: 'Module 1: Operating System Architectures & System Calls',
          topic: 'Dual-Mode Execution, Microkernels vs Monolithic, Traps',
          description: 'Introduction to operating systems, CPU modes, user/kernel transitions, and system call interfaces.',
          youtubeUrl: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
          duration: '1 hr 10 mins',
          instructor: 'Neso Academy'
        },
        {
          id: 'VID-OS-02',
          subject: 'Operating Systems',
          moduleNumber: 2,
          moduleTitle: 'Module 2: Process Management, PCB & Context Switching',
          topic: 'Process States (Ready, Running, Blocked), PCB, fork()',
          description: 'Process life-cycle, process control blocks, CPU context switching overhead, and process hierarchies.',
          youtubeUrl: 'https://www.youtube.com/watch?v=OrM7nZcxXZU',
          duration: '34 mins',
          instructor: 'Gate Smashers'
        },
        {
          id: 'VID-OS-03',
          subject: 'Operating Systems',
          moduleNumber: 3,
          moduleTitle: 'Module 3: CPU Scheduling Algorithms (FCFS, SJF, Round Robin)',
          topic: 'Gantt Charts, Turnaround & Waiting Time, Preemption',
          description: 'Comparative study and calculations for uniprocessor CPU scheduling policies.',
          youtubeUrl: 'https://www.youtube.com/watch?v=zFnrUVqtiOY',
          duration: '45 mins',
          instructor: 'Neso Academy'
        },
        {
          id: 'VID-OS-04',
          subject: 'Operating Systems',
          moduleNumber: 4,
          moduleTitle: 'Module 4: Process Synchronization, Semaphores & Mutex Locks',
          topic: 'Critical Section, Race Conditions, Counting Semaphores',
          description: 'Solving mutual exclusion, classic concurrency problems (Producer-Consumer, Dining Philosophers).',
          youtubeUrl: 'https://www.youtube.com/watch?v=ph2bu_Z2K0E',
          duration: '48 mins',
          instructor: 'Gate Smashers'
        },
        {
          id: 'VID-OS-05',
          subject: 'Operating Systems',
          moduleNumber: 5,
          moduleTitle: 'Module 5: Deadlocks (Coffman Conditions & Banker Algorithm)',
          topic: 'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait',
          description: 'Deadlock avoidance using Dijkstra Banker algorithm, resource allocation graphs, and recovery.',
          youtubeUrl: 'https://www.youtube.com/watch?v=rWFhm_iZphk',
          duration: '42 mins',
          instructor: 'Neso Academy'
        },
        {
          id: 'VID-OS-06',
          subject: 'Operating Systems',
          moduleNumber: 6,
          moduleTitle: 'Module 6: Virtual Memory, Paging & Page Replacement (FIFO, LRU)',
          topic: 'Page Tables, TLB, Page Faults, Thrashing & Belady Anomaly',
          description: 'How modern memory managers map virtual pages to physical frames and handle replacement policies.',
          youtubeUrl: 'https://www.youtube.com/watch?v=qcBIvxIDCqc',
          duration: '50 mins',
          instructor: 'Gate Smashers'
        }
      ];

      // Add thumbnail & embedId
      demoVideos.forEach(v => {
        v.embedId = extractYoutubeId(v.youtubeUrl);
        v.thumbnail = 'https://img.youtube.com/vi/' + v.embedId + '/hqdefault.jpg';
      });

      setItem(STORAGE_KEYS.VIDEOS, demoVideos);
    }

    // 7. Settings
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

  
  // --- Video Modules API ---
  function getVideoModules() {
    return getItem(STORAGE_KEYS.VIDEOS, []);
  }

  function getVideoModuleById(id) {
    const list = getVideoModules();
    return list.find(v => v.id === id) || null;
  }

  function saveVideoModule(video) {
    const list = getVideoModules();
    if (!video.embedId && video.youtubeUrl) {
      video.embedId = extractYoutubeId(video.youtubeUrl);
    }
    if (!video.thumbnail && video.embedId) {
      video.thumbnail = 'https://img.youtube.com/vi/' + video.embedId + '/hqdefault.jpg';
    }
    const idx = list.findIndex(v => v.id === video.id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...video };
    } else {
      list.unshift(video);
    }
    return setItem(STORAGE_KEYS.VIDEOS, list);
  }

  function deleteVideoModule(id) {
    const list = getVideoModules().filter(v => v.id !== id);
    return setItem(STORAGE_KEYS.VIDEOS, list);
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
        videos: getVideoModules(),
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
    if (parsed.data.videos) setItem(STORAGE_KEYS.VIDEOS, parsed.data.videos);
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
    getVideoModules,
    getVideoModuleById,
    saveVideoModule,
    deleteVideoModule,
    extractYoutubeId,
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
