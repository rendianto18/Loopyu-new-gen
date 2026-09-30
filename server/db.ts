import fs from "fs";
import path from "path";
import { INITIAL_8_LEVELS } from "../src/data/levelsData.ts";
import {
  LevelConfig,
  User,
  ClassRoom,
  Team,
  TeamMemberRecord,
  Assignment,
  AssignmentProgress,
  TeamActivity,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  ReflectionTemplate,
  ReflectionSubmission,
  FormalTest,
  TestQuestion,
  TestAttempt,
  AppSettings,
  AuditLog,
} from "../src/types/index.ts";
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_TEAMS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ASSIGNMENT_PROGRESS,
  INITIAL_TEAM_ACTIVITIES,
  INITIAL_QUIZZES,
  INITIAL_QUIZ_QUESTIONS,
  INITIAL_REFLECTIONS,
  INITIAL_TESTS,
  INITIAL_TEST_QUESTIONS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
} from "./classroomSeed.ts";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  points: number;
  coins: number;
  badges: string[];
  isOnline: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  levelId?: number;
  assignedTo: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  tags: string[];
  solutionCode?: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type { LevelConfig };

export interface AttemptLog {
  id: string;
  levelId: number;
  userId: string;
  userName: string;
  success: boolean;
  stepsTaken: number;
  batteriesCollected: number;
  totalBatteries: number;
  blocksUsed: number;
  isEfficient: boolean;
  hintsUsedCount: number;
  scoreAwarded: number;
  feedbackGiven: string;
  timestamp: string;
}

export interface ReflectionResponse {
  id: string;
  levelId: number;
  userId: string;
  userName: string;
  answers: { questionId: string; answer: string }[];
  submittedAt: string;
}

export interface AssessmentRecord {
  id: string;
  type: "pretest" | "posttest";
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: number; selectedOption: number; isCorrect: boolean }[];
  submittedAt: string;
}

export interface AppNotification {
  id: string;
  type: "task_status" | "task_created" | "mission_completed" | "hint_requested" | "badge_earned" | "review_requested";
  title: string;
  message: string;
  taskId?: string;
  levelId?: number;
  userName?: string;
  read: boolean;
  createdAt: string;
}

export interface DatabaseData {
  team: TeamMember[];
  tasks: TaskItem[];
  levels: LevelConfig[];
  attempts: AttemptLog[];
  reflections: ReflectionResponse[];
  assessments: AssessmentRecord[];
  notifications: AppNotification[];

  // Classroom & Team Entities
  users: User[];
  classes: ClassRoom[];
  teams: Team[];
  teamMembers: TeamMemberRecord[];
  assignments: Assignment[];
  assignmentProgress: AssignmentProgress[];
  teamActivities: TeamActivity[];
  quizzes: Quiz[];
  quizQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  reflectionTemplates: ReflectionTemplate[];
  reflectionSubmissions: ReflectionSubmission[];
  tests: FormalTest[];
  testQuestions: TestQuestion[];
  testAttempts: TestAttempt[];
  settings: AppSettings;
  auditLogs: AuditLog[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "loopia.db.json");

const INITIAL_LEVELS = INITIAL_8_LEVELS as unknown as LevelConfig[];
const LEGACY_INITIAL_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Temukan Pola",
    focus: "Mengenali Pola Berulang",
    stageEL: "1. Eksplorasi Nyata",
    description: "Bantu robot Loopi mengenali urutan langkah berulang dengan menjalankan perintah secara teratur.",
    instruction: "Bantu Loopi mengambil semua 4 baterai di lintasan lurus!",
    gridSize: { rows: 5, cols: 8 },
    startPos: { x: 1, y: 2, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 2 },
      { id: "b2", x: 3, y: 2 },
      { id: "b3", x: 4, y: 2 },
      { id: "b4", x: 5, y: 2 },
    ],
    allowedBlocks: ["move_forward", "take_battery"],
    maxBlocksForEfficiency: 8,
    maxBlocksLimit: 8,
    hints: {
      hint1: "Perhatikan apakah ada pasangan perintah yang kamu susun berulang kali?",
      hint2: "Amati polanya: setiap langkah robot adalah 'Maju' lalu dilanjutkan dengan 'Ambil Baterai'.",
      hint3: "Pola: [Maju → Ambil Baterai] diulang sebanyak 4 kali.",
    },
    reflectionQuestions: [
      {
        id: "ref-1-1",
        question: "Apa urutan tindakan yang kamu lakukan secara berulang-ulang?",
        placeholder: "Contoh: Saya melakukan maju lalu ambil baterai sebanyak 4 kali...",
      },
      {
        id: "ref-1-2",
        question: "Bagaimana rasanya jika kamu harus mengetik instruksi untuk 100 baterai secara manual?",
        placeholder: "Tuliskan pendapatmu tentang waktu dan kerapian kode...",
      },
    ],
  },
  {
    id: 2,
    name: "Ayo Mengulang!",
    focus: "Perulangan for (int i = 0; i < n; i++)",
    stageEL: "2. Refleksi Pola",
    description: "Gunakan loop for ala bahasa C agar perintah yang sama dapat berjalan otomatis dan kodenya ringkas terstruktur.",
    instruction: "Gunakan 1 loop for (int i = 0; i < 4; i++) untuk mengambil 4 baterai di lintasan!",
    gridSize: { rows: 5, cols: 8 },
    startPos: { x: 1, y: 2, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 2 },
      { id: "b2", x: 3, y: 2 },
      { id: "b3", x: 4, y: 2 },
      { id: "b4", x: 5, y: 2 },
    ],
    allowedBlocks: ["move_forward", "take_battery", "repeat"],
    maxBlocksForEfficiency: 3,
    maxBlocksLimit: 4,
    hints: {
      hint1: "Berapa kali pola [Maju + Ambil Baterai] harus diulang?",
      hint2: "Atur iterasi loop for dengan batas kondisi i < 4.",
      hint3: "Bentuk kode C: for (int i = 0; i < 4; i++) { maju(); ambilBaterai(); }",
    },
    reflectionQuestions: [
      {
        id: "ref-2-1",
        question: "Mengapa menggunakan perulangan for lebih efektif daripada menulis perintah satu per satu?",
        placeholder: "Jelaskan alasanmu dengan kalimat yang santai dan jelas...",
      },
      {
        id: "ref-2-2",
        question: "Apa yang terjadi pada panjang kode ketika jumlah pengulangan diubah dari 4 menjadi 10?",
        placeholder: "Apakah kodenya menjadi panjang atau tetap ringkas?",
      },
    ],
  },
  {
    id: 3,
    name: "Tangga Berundak",
    focus: "Pola Tangga for (int i = 0; i < 3; i++)",
    stageEL: "3. Konsep Perulangan",
    description: "Tentukan jumlah pengulangan yang tepat untuk menjelajahi rute bertingkat yang membentuk pola anak tangga.",
    instruction: "Loopi harus mengambil 3 baterai di lintasan tangga menggunakan loop for (int i = 0; i < 3; i++).",
    gridSize: { rows: 6, cols: 7 },
    startPos: { x: 1, y: 4, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 3 },
      { id: "b2", x: 3, y: 2 },
      { id: "b3", x: 4, y: 1 },
    ],
    allowedBlocks: ["move_forward", "turn_left", "turn_right", "take_battery", "repeat"],
    maxBlocksForEfficiency: 6,
    maxBlocksLimit: 7,
    hints: {
      hint1: "Perhatikan satu siklus tangga: Maju, Belok Kiri, Maju, Ambil, Belok Kanan. Ada berapa anak tangga?",
      hint2: "Terdapat 3 anak tangga baterai. Atur loop for dengan iterasi 3 kali (i < 3).",
      hint3: "Bentuk kode C: for (int i = 0; i < 3; i++) { maju(); putarKiri(); maju(); ambilBaterai(); putarKanan(); }",
    },
    reflectionQuestions: [
      {
        id: "ref-3-1",
        question: "Bagaimana cara kamu mengenali satu rangkaian pola utuh sebelum membungkusnya ke dalam loop?",
        placeholder: "Perhatikan langkah-langkah yang mengembalikan arah hadap robot...",
      },
    ],
  },
  {
    id: 4,
    name: "Maju Selama Aman",
    focus: "Perulangan Kondisi while (jalurAman())",
    stageEL: "4. Uji Coba Mandiri",
    description: "Pahami perulangan dinamis selama kondisi bernilai true ala bahasa C: while (jalurAman()).",
    instruction: "Gunakan loop while (jalurAman()) agar Loopi terus melangkah maju dan mengambil baterai hingga ujung koridor.",
    gridSize: { rows: 5, cols: 8 },
    startPos: { x: 1, y: 2, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 2 },
      { id: "b2", x: 3, y: 2 },
      { id: "b3", x: 4, y: 2 },
      { id: "b4", x: 5, y: 2 },
      { id: "b5", x: 6, y: 2 },
    ],
    obstacles: [{ x: 7, y: 2 }],
    allowedBlocks: ["move_forward", "take_battery", "while", "repeat"],
    maxBlocksForEfficiency: 3,
    maxBlocksLimit: 5,
    hints: {
      hint1: "Kapan robot harus berhenti bergerak di koridor ini?",
      hint2: "Gunakan loop while dengan kondisi jalur di depan aman: while (jalurAman()).",
      hint3: "Bentuk kode C: while (jalurAman()) { maju(); ambilBaterai(); }",
    },
    reflectionQuestions: [
      {
        id: "ref-4-1",
        question: "Pada situasi seperti apa kamu memilih loop for (jumlah iterasi pasti) dan kapan memilih while (kondisi dinamis)?",
        placeholder: "Bandingkan jika jumlah baterai tidak diketahui sejak awal...",
      },
    ],
  },
  {
    id: 5,
    name: "Detektif Bug",
    focus: "Memperbaiki Error Off-by-One di Loop for",
    stageEL: "Refleksi & Perbaikan",
    description: "Kode perulangan for di bawah ini kelebihan iterasi (i < 6) sehingga Loopi menabrak pembatas. Ayo perbaiki!",
    instruction: "Perbaiki batas iterasi pada for (int i = 0; i < 6; i++) agar Loopi tidak menabrak rintangan di ujung jalur!",
    gridSize: { rows: 5, cols: 8 },
    startPos: { x: 1, y: 2, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 2 },
      { id: "b2", x: 3, y: 2 },
      { id: "b3", x: 4, y: 2 },
      { id: "b4", x: 5, y: 2 },
    ],
    obstacles: [{ x: 6, y: 2 }],
    allowedBlocks: ["move_forward", "take_battery", "repeat"],
    maxBlocksForEfficiency: 3,
    maxBlocksLimit: 5,
    defaultBuggyCode: [
      {
        id: "buggy-rep-5",
        type: "repeat",
        count: 6, // Bug: harusnya 4, 6 akan menabrak rintangan
        commands: [
          { id: "buggy-cmd-5-1", type: "command", action: "move_forward" },
          { id: "buggy-cmd-5-2", type: "command", action: "take_battery" },
        ],
      },
    ],
    hints: {
      hint1: "Robot menabrak di langkah ke berapa? Hitung berapa jumlah baterai yang sebenarnya ada di jalur.",
      hint2: "Target baterai hanya ada 4 buah, namun iterasi loop tertulis i < 6.",
      hint3: "Ubah iterasi pada loop for dari 6 menjadi 4.",
    },
    reflectionQuestions: [
      {
        id: "ref-5-1",
        question: "Apa penyebab kesalahan pada kode awal, dan bagaimana caramu menemukannya?",
        placeholder: "Ceritakan proses analisismu ketika melihat robot melangkah terlalu jauh...",
      },
    ],
  },
  {
    id: 6,
    name: "Master Perulangan",
    focus: "Optimasi Algoritma FOR & WHILE",
    stageEL: "Siklus Lengkap",
    description: "Tantangan pamungkas: Selesaikan rute navigasi kompleks dengan solusi kode yang paling rapi, ringkas, dan efisien!",
    instruction: "Loopi harus mengumpulkan 6 baterai di sekeliling arena persegi. Manfaatkan perulangan 4 sisi secara cerdas!",
    gridSize: { rows: 6, cols: 6 },
    startPos: { x: 1, y: 1, dir: "right" },
    targetBatteries: [
      { id: "b1", x: 2, y: 1 },
      { id: "b2", x: 4, y: 1 },
      { id: "b3", x: 4, y: 3 },
      { id: "b4", x: 4, y: 4 },
      { id: "b5", x: 2, y: 4 },
      { id: "b6", x: 1, y: 3 },
    ],
    allowedBlocks: ["move_forward", "turn_right", "turn_left", "take_battery", "repeat", "while"],
    maxBlocksForEfficiency: 5,
    maxBlocksLimit: 8,
    hints: {
      hint1: "Arena memiliki 4 sisi. Setiap sisi memiliki pola gerak dan belokan yang mirip.",
      hint2: "Bungkus pergerakan satu sisi ke dalam loop for (int sisi = 0; sisi < 4; sisi++).",
      hint3: "Contoh: for (int i = 0; i < 4; i++) { maju(); ambilBaterai(); putarKanan(); } atau kombinasikan dengan while.",
    },
    reflectionQuestions: [
      {
        id: "ref-6-1",
        question: "Berapa banyak balok perintah yang berhasil kamu hemat dengan menggunakan struktur perulangan?",
        placeholder: "Bandingkan solusi loop dengan solusi berurutan tanpa loop...",
      },
      {
        id: "ref-6-2",
        question: "Bagaimana kamu menyimpulkan manfaat perulangan setelah menyelesaikan seluruh petualangan loopyu?",
        placeholder: "Tuliskan rangkuman pemahamanmu tentang logika perulangan...",
      },
    ],
  },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "usr-1",
    name: "Rendi (Ketua)",
    role: "Ketua Tim & Developer",
    avatar: "👨‍💻",
    points: 280,
    coins: 45,
    badges: ["First Loop", "Pattern Spotter", "Clean Coder"],
    isOnline: true,
  },
  {
    id: "usr-2",
    name: "Alya (Tester)",
    role: "QA & Debugger",
    avatar: "👩‍🔬",
    points: 230,
    coins: 35,
    badges: ["Loop Breaker", "Bug Hunter"],
    isOnline: true,
  },
  {
    id: "usr-3",
    name: "Bimo (Analyst)",
    role: "Logic & Algorithm Analyst",
    avatar: "🧑‍🏫",
    points: 190,
    coins: 30,
    badges: ["Optimizer"],
    isOnline: true,
  },
  {
    id: "usr-4",
    name: "Pak Hendra",
    role: "Guru Pembimbing",
    avatar: "👨‍🏫",
    points: 500,
    coins: 100,
    badges: ["Mentor"],
    isOnline: false,
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Eksperimen Level 1: Kenali Pola Pengambilan Baterai",
    description: "Selesaikan Level 1 (Temukan Pola) menggunakan perintah langkah demi langkah, lalu identifikasi pola berulang yang muncul.",
    levelId: 1,
    assignedTo: "usr-1",
    status: "done",
    priority: "high",
    tags: ["Eksplorasi", "Pola Berulang"],
    solutionCode: [
      { type: "command", action: "move_forward" },
      { type: "command", action: "take_battery" },
      { type: "command", action: "move_forward" },
      { type: "command", action: "take_battery" },
      { type: "command", action: "move_forward" },
      { type: "command", action: "take_battery" },
      { type: "command", action: "move_forward" },
      { type: "command", action: "take_battery" },
    ],
    createdBy: "usr-4",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "task-2",
    title: "Optimasi Level 2: Implementasi Balok For (3 kali)",
    description: "Ubah 6 baris perintah berulang manual menjadi 1 balok perulangan FOR (3 kali) berisi MAJU dan AMBIL BATERAI untuk mengambil 3 baterai.",
    levelId: 2,
    assignedTo: "usr-2",
    status: "in_progress",
    priority: "high",
    tags: ["Balok For", "Perulangan"],
    solutionCode: [
      {
        type: "repeat",
        count: 3,
        commands: [
          { type: "command", action: "move_forward" },
          { type: "command", action: "take_battery" },
        ],
      },
    ],
    createdBy: "usr-1",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "task-3",
    title: "Uji Coba Level 3: Rute Berbelok Anak Tangga",
    description: "Rancang instruksi perulangan dengan pola belokan tangga untuk mengambil 3 baterai di grid berundak.",
    levelId: 3,
    assignedTo: "usr-1",
    status: "todo",
    priority: "medium",
    tags: ["Algoritma", "Tangga Grid"],
    createdBy: "usr-1",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "task-4",
    title: "Investigasi Level 4: Kondisi Berhenti Loop While",
    description: "Pastikan robot Loopi bergerak selama jalur di depan aman tanpa mengalami tabrakan atau infinite loop.",
    levelId: 4,
    assignedTo: "usr-3",
    status: "todo",
    priority: "high",
    tags: ["While Loop", "Kondisi Aman"],
    createdBy: "usr-4",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "task-5",
    title: "Detektif Bug Level 5: Analisis Error Off-by-One",
    description: "Temukan mengapa Loopi menabrak dinding pada perulangan ke-6 padahal baterai hanya 4. Perbaiki batasan loop.",
    levelId: 5,
    assignedTo: "usr-2",
    status: "review",
    priority: "high",
    tags: ["Debugging", "Off-by-One"],
    createdBy: "usr-3",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "task-6",
    title: "Tantangan Final: Optimasi Master Perulangan",
    description: "Selesaikan tantangan integrasi akhir dengan batasan maksimal 5 balok instruksi untuk efisiensi skor tertinggi.",
    levelId: 6,
    assignedTo: "usr-1",
    status: "todo",
    priority: "medium",
    tags: ["Tantangan Akhir", "Efisiensi"],
    createdBy: "usr-4",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "task_status",
    title: "Tugas Selesai!",
    message: "Rendi menyelesaikan tugas 'Eksperimen Level 1: Kenali Pola Pengambilan Baterai'.",
    taskId: "task-1",
    levelId: 1,
    userName: "Rendi (Ketua)",
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-2",
    type: "badge_earned",
    title: "Lencana Terbuka: Pattern Spotter",
    message: "Selamat! Tim berhasil menemukan pola berulang pertama kali tanpa bantuan sintaks.",
    levelId: 1,
    userName: "Rendi (Ketua)",
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-3",
    type: "review_requested",
    title: "Permintaan Review Kode",
    message: "Alya memindahkan tugas 'Debugging Level 5: Analisis Loop Breaker' ke kolom Review.",
    taskId: "task-5",
    levelId: 5,
    userName: "Alya (Tester)",
    read: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "notif-4",
    type: "task_created",
    title: "Tugas Baru Ditambahkan",
    message: "Pak Hendra menambahkan tugas 'Final Mission: Tantangan Loop Master & Efisiensi'.",
    taskId: "task-6",
    levelId: 6,
    userName: "Pak Hendra",
    read: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

class DatabaseService {
  private data: DatabaseData;

  constructor() {
    this.ensureDir();
    this.data = this.loadData();
  }

  private ensureDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        let changed = false;

        // Ensure strictly exactly 8 levels synced with INITIAL_8_LEVELS
        parsed.levels = INITIAL_8_LEVELS;
        changed = true;

        // Schema migration for classroom and team mode
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
          changed = true;
        }
        if (!parsed.classes || parsed.classes.length === 0) {
          parsed.classes = INITIAL_CLASSES;
          changed = true;
        }
        if (!parsed.teams || parsed.teams.length === 0) {
          parsed.teams = INITIAL_TEAMS;
          changed = true;
        }
        if (!parsed.teamMembers || parsed.teamMembers.length === 0) {
          parsed.teamMembers = INITIAL_TEAM_MEMBERS;
          changed = true;
        }
        if (!parsed.assignments || parsed.assignments.length === 0) {
          parsed.assignments = INITIAL_ASSIGNMENTS;
          changed = true;
        }
        if (!parsed.assignmentProgress || parsed.assignmentProgress.length === 0) {
          parsed.assignmentProgress = INITIAL_ASSIGNMENT_PROGRESS;
          changed = true;
        }
        if (!parsed.teamActivities || parsed.teamActivities.length === 0) {
          parsed.teamActivities = INITIAL_TEAM_ACTIVITIES;
          changed = true;
        }
        if (!parsed.quizzes || parsed.quizzes.length === 0) {
          parsed.quizzes = INITIAL_QUIZZES;
          changed = true;
        }
        if (!parsed.quizQuestions || parsed.quizQuestions.length === 0) {
          parsed.quizQuestions = INITIAL_QUIZ_QUESTIONS;
          changed = true;
        }
        if (!parsed.quizAttempts) {
          parsed.quizAttempts = [];
          changed = true;
        }
        if (!parsed.reflectionTemplates || parsed.reflectionTemplates.length === 0) {
          parsed.reflectionTemplates = INITIAL_REFLECTIONS;
          changed = true;
        }
        if (!parsed.reflectionSubmissions) {
          parsed.reflectionSubmissions = [];
          changed = true;
        }
        if (!parsed.tests || parsed.tests.length === 0) {
          parsed.tests = INITIAL_TESTS;
          changed = true;
        }
        if (!parsed.testQuestions || parsed.testQuestions.length === 0) {
          parsed.testQuestions = INITIAL_TEST_QUESTIONS;
          changed = true;
        }
        if (!parsed.testAttempts) {
          parsed.testAttempts = [];
          changed = true;
        }
        if (!parsed.settings) {
          parsed.settings = INITIAL_SETTINGS;
          changed = true;
        }
        if (!parsed.auditLogs || parsed.auditLogs.length === 0) {
          parsed.auditLogs = INITIAL_AUDIT_LOGS;
          changed = true;
        }
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users.forEach((u: any) => {
            if (!u.password) {
              u.password = u.role === "ADMIN" ? "admin123" : u.role === "TEACHER" ? "guru123" : "siswa123";
              changed = true;
            }
          });
        }

        if (changed) {
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading database file, resetting to initial:", e);
    }

    const defaultData: DatabaseData = {
      team: INITIAL_TEAM,
      tasks: INITIAL_TASKS,
      levels: INITIAL_8_LEVELS,
      attempts: [],
      reflections: [],
      assessments: [],
      notifications: INITIAL_NOTIFICATIONS,
      users: INITIAL_USERS,
      classes: INITIAL_CLASSES,
      teams: INITIAL_TEAMS,
      teamMembers: INITIAL_TEAM_MEMBERS,
      assignments: INITIAL_ASSIGNMENTS,
      assignmentProgress: INITIAL_ASSIGNMENT_PROGRESS,
      teamActivities: INITIAL_TEAM_ACTIVITIES,
      quizzes: INITIAL_QUIZZES,
      quizQuestions: INITIAL_QUIZ_QUESTIONS,
      quizAttempts: [],
      reflectionTemplates: INITIAL_REFLECTIONS,
      reflectionSubmissions: [],
      tests: INITIAL_TESTS,
      testQuestions: INITIAL_TEST_QUESTIONS,
      testAttempts: [],
      settings: INITIAL_SETTINGS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseData) {
    try {
      this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving database file:", e);
    }
  }

  public getData(): DatabaseData {
    return this.data;
  }

  // --- Task Methods ---
  public getTasks(): TaskItem[] {
    return this.data.tasks;
  }

  public getTaskById(id: string): TaskItem | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  public createTask(task: Omit<TaskItem, "id" | "createdAt" | "updatedAt">): TaskItem {
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.unshift(newTask);
    this.saveData(this.data);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<TaskItem>): TaskItem | null {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveData(this.data);
    return this.data.tasks[index];
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    if (this.data.tasks.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Levels ---
  public getLevels(): LevelConfig[] {
    return this.data.levels.filter((l) => l.id <= 8).sort((a, b) => a.id - b.id);
  }

  public getLevelById(id: number): LevelConfig | undefined {
    return this.data.levels.find((l) => l.id === id && id <= 8);
  }

  // --- Team ---
  public getTeam(): TeamMember[] {
    return this.data.team;
  }

  public updateMemberPoints(userId: string, addedPoints: number, addedCoins: number, newBadge?: string): TeamMember | null {
    const member = this.data.team.find((m) => m.id === userId);
    if (!member) return null;

    member.points += addedPoints;
    member.coins += addedCoins;
    if (newBadge && !member.badges.includes(newBadge)) {
      member.badges.push(newBadge);
    }

    this.saveData(this.data);
    return member;
  }

  // --- Attempts ---
  public logAttempt(attempt: Omit<AttemptLog, "id" | "timestamp">): AttemptLog {
    const newAttempt: AttemptLog = {
      ...attempt,
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.attempts.unshift(newAttempt);
    this.saveData(this.data);
    return newAttempt;
  }

  public getAttempts(levelId?: number): AttemptLog[] {
    if (levelId) {
      return this.data.attempts.filter((a) => a.levelId === levelId);
    }
    return this.data.attempts;
  }

  // --- Reflections ---
  public saveReflection(ref: Omit<ReflectionResponse, "id" | "submittedAt">): ReflectionResponse {
    const newRef: ReflectionResponse = {
      ...ref,
      id: `ref-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    this.data.reflections.unshift(newRef);
    this.saveData(this.data);
    return newRef;
  }

  public getReflections(levelId?: number): ReflectionResponse[] {
    if (levelId) {
      return this.data.reflections.filter((r) => r.levelId === levelId);
    }
    return this.data.reflections;
  }

  // --- Assessments ---
  public saveAssessment(ass: Omit<AssessmentRecord, "id" | "submittedAt">): AssessmentRecord {
    const newAss: AssessmentRecord = {
      ...ass,
      id: `ass-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    this.data.assessments.unshift(newAss);
    this.saveData(this.data);
    return newAss;
  }

  public getAssessments(userId?: string): AssessmentRecord[] {
    if (userId) {
      return this.data.assessments.filter((a) => a.userId === userId);
    }
    return this.data.assessments;
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    return this.data.notifications;
  }

  public addNotification(notif: Omit<AppNotification, "id" | "createdAt" | "read">): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    // Keep max 50 recent notifications
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.saveData(this.data);
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public clearAllNotifications(): void {
    this.data.notifications = [];
    this.saveData(this.data);
  }

  public resetDatabase(): void {
    this.data = {
      team: INITIAL_TEAM,
      tasks: INITIAL_TASKS,
      levels: INITIAL_LEVELS,
      attempts: [],
      reflections: [],
      assessments: [],
      notifications: INITIAL_NOTIFICATIONS,
      users: INITIAL_USERS,
      classes: INITIAL_CLASSES,
      teams: INITIAL_TEAMS,
      teamMembers: INITIAL_TEAM_MEMBERS,
      assignments: INITIAL_ASSIGNMENTS,
      assignmentProgress: INITIAL_ASSIGNMENT_PROGRESS,
      teamActivities: INITIAL_TEAM_ACTIVITIES,
      quizzes: INITIAL_QUIZZES,
      quizQuestions: INITIAL_QUIZ_QUESTIONS,
      quizAttempts: [],
      reflectionTemplates: INITIAL_REFLECTIONS,
      reflectionSubmissions: [],
      tests: INITIAL_TESTS,
      testQuestions: INITIAL_TEST_QUESTIONS,
      testAttempts: [],
      settings: INITIAL_SETTINGS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    this.saveData(this.data);
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
  public getUsers(): User[] {
    return this.data.users || [];
  }

  public getUserById(id: string): User | undefined {
    return (this.data.users || []).find((u) => u.id === id);
  }

  public authenticateUser(username: string, password: string): User | null {
    const cleanUsername = (username || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    const user = (this.data.users || []).find(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (!user) return null;
    const userPass = user.password || (user.role === "ADMIN" ? "admin123" : user.role === "TEACHER" ? "guru123" : "siswa123");
    if (userPass === cleanPassword) {
      return user;
    }
    return null;
  }

  public createUser(user: Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }): User {
    let cleanUsername = (user.username || "").trim().toLowerCase();
    if (!cleanUsername) {
      cleanUsername = "user_" + Math.random().toString(36).substring(2, 7);
    }
    const existing = (this.data.users || []).find(
      (u) => u.username.toLowerCase() === cleanUsername && u.id !== (user as any).id
    );
    if (existing) {
      cleanUsername = `${cleanUsername}_${Math.floor(Math.random() * 1000)}`;
    }

    const newUser: User = {
      ...user,
      id: (user as any).id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      password: (user.password || "").trim(),
      status: user.status || "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.saveData(this.data);
    this.logAudit({
      userId: newUser.id,
      userName: newUser.name,
      action: "CREATE_USER",
      details: `Pengguna sesi baru bergabung: ${newUser.name} (@${newUser.username}, peran: ${newUser.role})`,
    });
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    const beforeLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== beforeLen) {
      // Also remove from teams
      this.data.teamMembers = this.data.teamMembers.filter((tm) => tm.userId !== id);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // ==========================================
  // CLASSES MANAGEMENT
  // ==========================================
  public getClasses(): ClassRoom[] {
    return this.data.classes || [];
  }

  public createClass(c: Omit<ClassRoom, "id" | "createdAt">): ClassRoom {
    const newClass: ClassRoom = {
      ...c,
      id: `class-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.classes.push(newClass);
    this.saveData(this.data);
    return newClass;
  }

  public updateClass(id: string, updates: Partial<ClassRoom>): ClassRoom | null {
    const index = this.data.classes.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.classes[index] = { ...this.data.classes[index], ...updates };
    this.saveData(this.data);
    return this.data.classes[index];
  }

  // ==========================================
  // TEAMS & MEMBERS MANAGEMENT
  // ==========================================
  public getTeams(): Team[] {
    return this.data.teams || [];
  }

  public getTeamById(id: string): Team | undefined {
    return (this.data.teams || []).find((t) => t.id === id);
  }

  public getTeamByCode(code: string): Team | undefined {
    const clean = code.trim().toUpperCase();
    return (this.data.teams || []).find((t) => t.teamCode.toUpperCase() === clean);
  }

  public generateTeamCode(): string {
    const prefix = "LP";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
  }

  public createTeam(params: {
    teamName: string;
    classId: string;
    leaderId: string;
    createdBy: string;
  }): { team: Team; leaderMember: TeamMemberRecord } {
    let code = this.generateTeamCode();
    // Guarantee uniqueness
    while (this.data.teams.some((t) => t.teamCode === code)) {
      code = this.generateTeamCode();
    }

    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamName: params.teamName,
      teamCode: code,
      classId: params.classId || "class-8a",
      leaderId: params.leaderId,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    this.data.teams.push(newTeam);

    // Add leader as first member
    const leaderMember: TeamMemberRecord = {
      id: `tm-${Date.now()}`,
      teamId: newTeam.id,
      userId: params.leaderId,
      role: "LEADER",
      joinedAt: new Date().toISOString(),
    };
    this.data.teamMembers.push(leaderMember);

    // Update user role to TEAM_LEADER and teamId
    const user = this.getUserById(params.leaderId);
    if (user) {
      this.updateUser(params.leaderId, { role: "TEAM_LEADER", teamId: newTeam.id });
    }

    // Log Activity
    this.logTeamActivity({
      teamId: newTeam.id,
      userId: params.leaderId,
      userName: user?.name || "Ketua Tim",
      activityType: "CREATE_TEAM",
      metadata: { teamName: newTeam.teamName, teamCode: newTeam.teamCode },
    });

    this.logAudit({
      userId: params.leaderId,
      userName: user?.name || "Ketua Tim",
      action: "CREATE_TEAM",
      details: `Membentuk tim '${newTeam.teamName}' dengan kode ${newTeam.teamCode}`,
    });

    this.saveData(this.data);
    return { team: newTeam, leaderMember };
  }

  public updateTeam(id: string, updates: Partial<Team>): Team | null {
    const index = this.data.teams.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.data.teams[index] = {
      ...this.data.teams[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.teams[index];
  }

  public deleteTeam(id: string): boolean {
    const beforeLen = this.data.teams.length;
    this.data.teams = this.data.teams.filter((t) => t.id !== id);
    if (this.data.teams.length !== beforeLen) {
      // Clear teamId from users
      this.data.users.forEach((u) => {
        if (u.teamId === id) u.teamId = undefined;
      });
      // Remove members
      this.data.teamMembers = this.data.teamMembers.filter((tm) => tm.teamId !== id);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public regenerateTeamCode(teamId: string): string | null {
    const team = this.getTeamById(teamId);
    if (!team) return null;
    let newCode = this.generateTeamCode();
    while (this.data.teams.some((t) => t.teamCode === newCode)) {
      newCode = this.generateTeamCode();
    }
    team.teamCode = newCode;
    team.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return newCode;
  }

  public getTeamMembers(teamId: string): (TeamMemberRecord & { user?: User })[] {
    const members = (this.data.teamMembers || []).filter((tm) => tm.teamId === teamId);
    return members.map((m) => ({
      ...m,
      user: this.getUserById(m.userId),
    }));
  }

  public getUserTeam(userId: string): { team: Team; membership: TeamMemberRecord } | null {
    const membership = (this.data.teamMembers || []).find((tm) => tm.userId === userId);
    if (!membership) return null;
    const team = this.getTeamById(membership.teamId);
    if (!team) return null;
    return { team, membership };
  }

  public addTeamMember(teamId: string, userId: string, role: "LEADER" | "MEMBER" = "MEMBER"): { success: boolean; message: string; member?: TeamMemberRecord } {
    const team = this.getTeamById(teamId);
    if (!team) return { success: false, message: "Tim tidak ditemukan" };

    // Check if already in this team (Requirement #30: user cannot belong to same team twice)
    const existingInTeam = this.data.teamMembers.some((tm) => tm.teamId === teamId && tm.userId === userId);
    if (existingInTeam) {
      return { success: false, message: "Pengguna sudah terdaftar sebagai anggota di tim ini" };
    }

    // Check max team size
    const currentMemberCount = this.data.teamMembers.filter((tm) => tm.teamId === teamId).length;
    const maxLimit = this.data.settings?.maxTeamSize || 5;
    if (currentMemberCount >= maxLimit) {
      return { success: false, message: `Kapasitas tim penuh (maksimal ${maxLimit} anggota)` };
    }

    const newMember: TeamMemberRecord = {
      id: `tm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      teamId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    };

    this.data.teamMembers.push(newMember);

    // Update user teamId
    this.updateUser(userId, { teamId });

    const user = this.getUserById(userId);
    this.logTeamActivity({
      teamId,
      userId,
      userName: user?.name || "Anggota",
      activityType: "JOIN_TEAM",
      metadata: { role },
    });

    this.saveData(this.data);
    return { success: true, message: "Berhasil bergabung ke dalam tim!", member: newMember };
  }

  public removeTeamMember(teamId: string, userId: string): boolean {
    const beforeLen = this.data.teamMembers.length;
    const member = this.data.teamMembers.find((tm) => tm.teamId === teamId && tm.userId === userId);
    if (!member) return false;

    // Remove
    this.data.teamMembers = this.data.teamMembers.filter((tm) => !(tm.teamId === teamId && tm.userId === userId));

    // Clear user teamId
    const user = this.getUserById(userId);
    if (user && user.teamId === teamId) {
      this.updateUser(userId, {
        teamId: undefined,
        role: user.role === "TEAM_LEADER" ? "STUDENT" : user.role,
      });
    }

    this.logTeamActivity({
      teamId,
      userId,
      userName: user?.name || "Anggota",
      activityType: "LEAVE_TEAM",
      metadata: {},
    });

    this.saveData(this.data);
    return true;
  }

  // ==========================================
  // ASSIGNMENTS MANAGEMENT
  // ==========================================
  private normalizeAssignment(a: Assignment): Assignment {
    const levels = a.targetLevels || a.levelIds || [1, 2, 3];
    return {
      ...a,
      targetLevels: levels,
      levelIds: levels,
      dueDate: a.dueDate || a.deadline || "2026-10-30",
      deadline: a.deadline || a.dueDate || "2026-10-30",
      reflectionTemplateId: a.reflectionTemplateId || a.reflectionId || "refl-01",
      reflectionId: a.reflectionId || a.reflectionTemplateId || "refl-01",
      quizId: a.quizId || "quiz-1",
      testId: a.testId || "test-1",
    };
  }

  private normalizeProgress(p: AssignmentProgress): AssignmentProgress {
    const levels = p.completedLevels || p.completedLevelIds || [];
    return {
      ...p,
      completedLevels: levels,
      completedLevelIds: levels,
      reflectionCompleted: p.reflectionCompleted ?? p.reflectionSubmitted ?? false,
      reflectionSubmitted: p.reflectionSubmitted ?? p.reflectionCompleted ?? false,
      quizCompleted: p.quizCompleted ?? false,
      testCompleted: p.testCompleted ?? false,
      quizScore: p.quizScore ?? 0,
      testScore: p.testScore ?? 0,
      score: p.score ?? 0,
    };
  }

  public getAssignments(): Assignment[] {
    return (this.data.assignments || []).map((a) => this.normalizeAssignment(a));
  }

  public getAssignmentById(id: string): Assignment | undefined {
    const asg = (this.data.assignments || []).find((a) => a.id === id);
    return asg ? this.normalizeAssignment(asg) : undefined;
  }

  public createAssignment(asg: Omit<Assignment, "id" | "createdAt">): Assignment {
    const newAsg: Assignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      status: asg.status || "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.data.assignments.unshift(newAsg);
    this.saveData(this.data);
    this.logAudit({
      userId: asg.createdBy || "teacher01",
      userName: "Guru Pembimbing",
      action: "CREATE_ASSIGNMENT",
      details: `Menerbitkan tugas baru: ${newAsg.title} (${newAsg.mode} mode)`,
    });
    return newAsg;
  }

  public updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const index = this.data.assignments.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.data.assignments[index] = { ...this.data.assignments[index], ...updates };
    this.saveData(this.data);
    return this.data.assignments[index];
  }

  public deleteAssignment(id: string): boolean {
    const beforeLen = this.data.assignments.length;
    this.data.assignments = this.data.assignments.filter((a) => a.id !== id);
    if (this.data.assignments.length !== beforeLen) {
      this.data.assignmentProgress = this.data.assignmentProgress.filter((p) => p.assignmentId !== id);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // ==========================================
  // ASSIGNMENT PROGRESS & COLLABORATION LOGIC (#35 & #36)
  // ==========================================
  public getAssignmentProgress(assignmentId: string, teamId?: string, userId?: string): AssignmentProgress | undefined {
    let p: AssignmentProgress | undefined;
    if (teamId) {
      p = (this.data.assignmentProgress || []).find((x) => x.assignmentId === assignmentId && x.teamId === teamId);
    } else if (userId) {
      p = (this.data.assignmentProgress || []).find((x) => x.assignmentId === assignmentId && x.userId === userId);
    }
    return p ? this.normalizeProgress(p) : undefined;
  }

  public getAllAssignmentProgress(): AssignmentProgress[] {
    return (this.data.assignmentProgress || []).map((p) => this.normalizeProgress(p));
  }

  public getOrCreateProgress(assignmentId: string, teamId?: string, userId?: string): AssignmentProgress {
    let prog = this.getAssignmentProgress(assignmentId, teamId, userId);
    if (prog) return prog;

    prog = {
      id: `prog-${teamId || userId || "gen"}-${assignmentId}`,
      assignmentId,
      teamId,
      userId,
      status: "IN_PROGRESS",
      completedLevelIds: [],
      gameProgress: 0,
      quizScore: 0,
      quizCompleted: false,
      reflectionSubmitted: false,
      testScore: 0,
      testCompleted: false,
      score: 0,
      startedAt: new Date().toISOString(),
    };

    this.data.assignmentProgress.push(prog);
    this.saveData(this.data);
    return prog;
  }

  public recordGameLevelCompletion(params: {
    assignmentId: string;
    levelId: number;
    teamId?: string;
    userId?: string;
    userName?: string;
  }): AssignmentProgress {
    const asg = this.getAssignmentById(params.assignmentId);
    const prog = this.getOrCreateProgress(params.assignmentId, params.teamId, params.userId);

    if (!prog.completedLevelIds.includes(params.levelId)) {
      prog.completedLevelIds.push(params.levelId);
    }

    const requiredLevels = asg?.levelIds || [1, 2, 3, 4, 5];
    const completedCount = requiredLevels.filter((id) => prog.completedLevelIds.includes(id)).length;
    prog.gameProgress = Math.min(100, Math.round((completedCount / requiredLevels.length) * 100));

    // Check completion condition (Requirement #36)
    this.evaluateCompletionStatus(prog, asg);

    if (params.teamId) {
      this.logTeamActivity({
        teamId: params.teamId,
        userId: params.userId || "usr",
        userName: params.userName || "Anggota Tim",
        activityType: "COMPLETE_LEVEL",
        metadata: { levelId: params.levelId, gameProgress: prog.gameProgress },
      });
    }

    this.saveData(this.data);
    return prog;
  }

  public evaluateCompletionStatus(prog: AssignmentProgress, asg?: Assignment): void {
    if (!asg) asg = this.getAssignmentById(prog.assignmentId);
    const reqGame = asg?.levelIds && asg.levelIds.length > 0;
    const reqQuiz = Boolean(asg?.quizId);
    const reqRef = Boolean(asg?.reflectionId);
    const reqTest = Boolean(asg?.testId);

    const gameDone = !reqGame || prog.gameProgress >= 100;
    const quizDone = !reqQuiz || prog.quizCompleted;
    const refDone = !reqRef || prog.reflectionSubmitted;
    const testDone = !reqTest || prog.testCompleted;

    if (gameDone && quizDone && refDone && testDone) {
      prog.status = "COMPLETED";
      if (!prog.completedAt) {
        prog.completedAt = new Date().toISOString();
      }
    } else {
      prog.status = "IN_PROGRESS";
    }

    // Recalculate blended score
    let totalScore = 0;
    let components = 0;
    if (reqGame) {
      totalScore += prog.gameProgress;
      components++;
    }
    if (reqQuiz && prog.quizCompleted) {
      totalScore += prog.quizScore || 0;
      components++;
    }
    if (reqRef && prog.reflectionSubmitted) {
      totalScore += 100; // 100% submission score
      components++;
    }
    if (reqTest && prog.testCompleted) {
      totalScore += prog.testScore || 0;
      components++;
    }

    prog.score = components > 0 ? Math.round(totalScore / components) : 0;
  }

  // ==========================================
  // TEAM ACTIVITY LOG (#38)
  // ==========================================
  public logTeamActivity(act: Omit<TeamActivity, "id" | "createdAt">): TeamActivity {
    const newAct: TeamActivity = {
      ...act,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.teamActivities) this.data.teamActivities = [];
    this.data.teamActivities.unshift(newAct);
    if (this.data.teamActivities.length > 100) {
      this.data.teamActivities = this.data.teamActivities.slice(0, 100);
    }
    this.saveData(this.data);
    return newAct;
  }

  public getTeamActivities(teamId: string): TeamActivity[] {
    return (this.data.teamActivities || []).filter((a) => a.teamId === teamId);
  }

  // ==========================================
  // QUIZZES (#45 - #48)
  // ==========================================
  public getQuizzes(): Quiz[] {
    return this.data.quizzes || [];
  }

  public getQuizById(id: string): Quiz | undefined {
    return (this.data.quizzes || []).find((q) => q.id === id);
  }

  public getQuizQuestions(quizId: string, sanitizeAnswers = true): QuizQuestion[] {
    const questions = (this.data.quizQuestions || []).filter((q) => q.quizId === quizId);
    if (!sanitizeAnswers) return questions;
    // Hide correctAnswer from frontend before submission (Requirement #47)
    return questions.map(({ correctAnswer, ...rest }) => rest as QuizQuestion);
  }

  public submitQuizAttempt(params: {
    quizId: string;
    userId: string;
    userName?: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }): { attempt: QuizAttempt; progress?: AssignmentProgress } {
    const questions = (this.data.quizQuestions || []).filter((q) => q.quizId === params.quizId);
    let totalPoints = 0;
    let earnedPoints = 0;
    const evaluatedAnswers: { questionId: string; answer: string; isCorrect: boolean }[] = [];
    const conceptCounts: Record<string, { total: number; correct: number }> = {};

    for (const q of questions) {
      totalPoints += q.points || 20;
      const userAns = params.answers.find((a) => a.questionId === q.id);
      const isCorrect = userAns ? userAns.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() : false;
      if (isCorrect) {
        earnedPoints += q.points || 20;
      }
      evaluatedAnswers.push({
        questionId: q.id,
        answer: userAns?.answer || "",
        isCorrect,
      });

      const tag = q.conceptTag || "FOR_LOOP";
      if (!conceptCounts[tag]) conceptCounts[tag] = { total: 0, correct: 0 };
      conceptCounts[tag].total++;
      if (isCorrect) conceptCounts[tag].correct++;
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const conceptFeedback: Record<string, "Good" | "Review"> = {};
    for (const [tag, stat] of Object.entries(conceptCounts)) {
      conceptFeedback[tag] = stat.correct / stat.total >= 0.7 ? "Good" : "Review";
    }

    const attempt: QuizAttempt = {
      id: `qatt-${Date.now()}`,
      quizId: params.quizId,
      userId: params.userId,
      teamId: params.teamId,
      score,
      maxScore: 100,
      answers: evaluatedAnswers,
      conceptFeedback,
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date().toISOString(),
    };

    if (!this.data.quizAttempts) this.data.quizAttempts = [];
    this.data.quizAttempts.unshift(attempt);

    // Update assignment progress if assignmentId given
    let prog: AssignmentProgress | undefined = undefined;
    if (params.assignmentId) {
      prog = this.getOrCreateProgress(params.assignmentId, params.teamId, params.userId);
      prog.quizScore = score;
      prog.quizCompleted = true;
      this.evaluateCompletionStatus(prog);
    }

    if (params.teamId) {
      this.logTeamActivity({
        teamId: params.teamId,
        userId: params.userId,
        userName: params.userName || "Anggota Tim",
        activityType: "SUBMIT_QUIZ",
        metadata: { score, quizId: params.quizId },
      });
    }

    this.saveData(this.data);
    return { attempt, progress: prog };
  }

  public getQuizAttempts(quizId?: string, userId?: string, teamId?: string): QuizAttempt[] {
    let list = this.data.quizAttempts || [];
    if (quizId) list = list.filter((a) => a.quizId === quizId);
    if (userId) list = list.filter((a) => a.userId === userId);
    if (teamId) list = list.filter((a) => a.teamId === teamId);
    return list;
  }

  // ==========================================
  // REFLECTIONS (#49 - #50)
  // ==========================================
  public getReflectionTemplates(): ReflectionTemplate[] {
    return this.data.reflectionTemplates || [];
  }

  public getReflectionTemplateById(id: string): ReflectionTemplate | undefined {
    return (this.data.reflectionTemplates || []).find((r) => r.id === id);
  }

  public submitReflectionResponse(params: {
    reflectionId: string;
    userId: string;
    userName: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }): { submission: ReflectionSubmission; progress?: AssignmentProgress } {
    const sub: ReflectionSubmission = {
      id: `rsub-${Date.now()}`,
      reflectionId: params.reflectionId,
      userId: params.userId,
      userName: params.userName,
      teamId: params.teamId,
      answers: params.answers,
      submittedAt: new Date().toISOString(),
    };

    if (!this.data.reflectionSubmissions) this.data.reflectionSubmissions = [];
    this.data.reflectionSubmissions.unshift(sub);

    let prog: AssignmentProgress | undefined = undefined;
    if (params.assignmentId) {
      prog = this.getOrCreateProgress(params.assignmentId, params.teamId, params.userId);
      prog.reflectionSubmitted = true;
      this.evaluateCompletionStatus(prog);
    }

    if (params.teamId) {
      this.logTeamActivity({
        teamId: params.teamId,
        userId: params.userId,
        userName: params.userName,
        activityType: "SUBMIT_REFLECTION",
        metadata: { reflectionId: params.reflectionId },
      });
    }

    this.saveData(this.data);
    return { submission: sub, progress: prog };
  }

  public getReflectionSubmissions(reflectionId?: string): ReflectionSubmission[] {
    if (reflectionId) {
      return (this.data.reflectionSubmissions || []).filter((s) => s.reflectionId === reflectionId);
    }
    return this.data.reflectionSubmissions || [];
  }

  // ==========================================
  // FORMAL TESTS (#51 - #54)
  // ==========================================
  public getTests(): FormalTest[] {
    return this.data.tests || [];
  }

  public getTestById(id: string): FormalTest | undefined {
    return (this.data.tests || []).find((t) => t.id === id);
  }

  public getTestQuestions(testId: string, sanitizeAnswers = true): TestQuestion[] {
    const questions = (this.data.testQuestions || []).filter((q) => q.testId === testId);
    if (!sanitizeAnswers) return questions;
    // Security / Integrity: Do not expose answer to frontend beforehand (Requirement #53)
    return questions.map(({ answer, ...rest }) => rest as TestQuestion);
  }

  public submitTestAttempt(params: {
    testId: string;
    userId: string;
    userName?: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }): { attempt: TestAttempt; progress?: AssignmentProgress; message?: string } {
    const test = this.getTestById(params.testId);
    const existingAttempts = (this.data.testAttempts || []).filter(
      (a) => a.testId === params.testId && a.userId === params.userId
    );

    const maxAllowed = test?.maxAttempts || 2;
    if (existingAttempts.length >= maxAllowed) {
      throw new Error(`Batas maksimal percobaan tes telah tercapai (${maxAllowed} kali).`);
    }

    const questions = (this.data.testQuestions || []).filter((q) => q.testId === params.testId);
    let totalPoints = 0;
    let earnedPoints = 0;
    const evaluatedAnswers: { questionId: string; answer: string; isCorrect: boolean }[] = [];

    for (const q of questions) {
      totalPoints += q.points || 20;
      const userAns = params.answers.find((a) => a.questionId === q.id);
      const isCorrect = userAns ? userAns.answer.trim().toLowerCase() === (q.answer || "").trim().toLowerCase() : false;
      if (isCorrect) {
        earnedPoints += q.points || 20;
      }
      evaluatedAnswers.push({
        questionId: q.id,
        answer: userAns?.answer || "",
        isCorrect,
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const attempt: TestAttempt = {
      id: `tatt-${Date.now()}`,
      testId: params.testId,
      userId: params.userId,
      teamId: params.teamId,
      score,
      totalPoints,
      attemptNumber: existingAttempts.length + 1,
      status: "SUBMITTED",
      startedAt: new Date(Date.now() - 600000).toISOString(),
      submittedAt: new Date().toISOString(),
    };

    if (!this.data.testAttempts) this.data.testAttempts = [];
    this.data.testAttempts.unshift(attempt);

    let prog: AssignmentProgress | undefined = undefined;
    if (params.assignmentId) {
      prog = this.getOrCreateProgress(params.assignmentId, params.teamId, params.userId);
      prog.testScore = score;
      prog.testCompleted = true;
      this.evaluateCompletionStatus(prog);
    }

    if (params.teamId) {
      this.logTeamActivity({
        teamId: params.teamId,
        userId: params.userId,
        userName: params.userName || "Siswa",
        activityType: "SUBMIT_TEST",
        metadata: { score, testId: params.testId },
      });
    }

    this.saveData(this.data);
    return { attempt, progress: prog };
  }

  public getTestAttempts(testId?: string, userId?: string): TestAttempt[] {
    let list = this.data.testAttempts || [];
    if (testId) list = list.filter((a) => a.testId === testId);
    if (userId) list = list.filter((a) => a.userId === userId);
    return list;
  }

  // ==========================================
  // SETTINGS (#62)
  // ==========================================
  public getSettings(): AppSettings {
    return this.data.settings || INITIAL_SETTINGS;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData(this.data);
    this.logAudit({
      userId: "admin",
      userName: "Administrator",
      action: "UPDATE_SETTINGS",
      details: "Memperbarui konfigurasi sistem classroom & batasan tim",
    });
    return this.data.settings;
  }

  // ==========================================
  // AUDIT LOGS (#64)
  // ==========================================
  public logAudit(log: Omit<AuditLog, "id" | "timestamp">): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    if (!this.data.auditLogs) this.data.auditLogs = [];
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData(this.data);
    return newLog;
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs || [];
  }
}

export const db = new DatabaseService();
