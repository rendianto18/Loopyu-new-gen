import {
  TaskItem,
  LevelConfig,
  TeamMember,
  AttemptLog,
  ReflectionResponse,
  AssessmentRecord,
  AppNotification,
  CodeBlock,
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
} from "../types";

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch("/api/health");
  return res.json();
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const res = await fetch("/api/team");
  return res.json();
}

export async function fetchTasks(): Promise<TaskItem[]> {
  const res = await fetch("/api/tasks");
  return res.json();
}

export async function createTask(data: {
  title: string;
  description: string;
  levelId?: number;
  assignedTo: string;
  status: TaskItem["status"];
  priority: TaskItem["priority"];
  tags: string[];
  solutionCode?: CodeBlock[];
  createdBy: string;
}): Promise<TaskItem> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchLevels(): Promise<LevelConfig[]> {
  const res = await fetch("/api/levels");
  return res.json();
}

export async function fetchLevelById(id: number): Promise<LevelConfig> {
  const res = await fetch(`/api/levels/${id}`);
  return res.json();
}

export async function logAttempt(data: {
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
  feedbackGiven: string;
}): Promise<{ attempt: AttemptLog; scoreAwarded: number; coinsAwarded: number; earnedBadge?: string }> {
  const res = await fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAttempts(levelId?: number): Promise<AttemptLog[]> {
  const url = levelId ? `/api/attempts?levelId=${levelId}` : "/api/attempts";
  const res = await fetch(url);
  return res.json();
}

export async function saveReflection(data: {
  levelId: number;
  userId: string;
  userName: string;
  answers: { questionId: string; answer: string }[];
}): Promise<ReflectionResponse> {
  const res = await fetch("/api/reflections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchReflections(levelId?: number): Promise<ReflectionResponse[]> {
  const url = levelId ? `/api/reflections?levelId=${levelId}` : "/api/reflections";
  const res = await fetch(url);
  return res.json();
}

export async function saveAssessment(data: {
  type: "pretest" | "posttest";
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: number; selectedOption: number; isCorrect: boolean }[];
}): Promise<AssessmentRecord> {
  const res = await fetch("/api/assessments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAssessments(userId?: string): Promise<AssessmentRecord[]> {
  const url = userId ? `/api/assessments?userId=${userId}` : "/api/assessments";
  const res = await fetch(url);
  return res.json();
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch("/api/notifications");
  return res.json();
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
  return res.json();
}

export async function clearNotifications(): Promise<{ success: boolean }> {
  const res = await fetch("/api/notifications/clear", {
    method: "POST",
  });
  return res.json();
}

export async function submitAssessment(
  userId: string,
  type: "pretest" | "posttest",
  score: number
): Promise<AssessmentRecord> {
  return saveAssessment({
    type,
    userId,
    userName: "Siswa LOOPYU",
    score,
    totalQuestions: 5,
    answers: [],
  });
}

export async function submitLevelSolution(
  levelId: number,
  userId: string,
  blocks: CodeBlock[],
  isEfficient: boolean,
  hintsUsedCount: number
) {
  return logAttempt({
    levelId,
    userId,
    userName: "Siswa LOOPYU",
    success: true,
    stepsTaken: blocks.length,
    batteriesCollected: 5,
    totalBatteries: 5,
    blocksUsed: blocks.length,
    isEfficient,
    hintsUsedCount,
    feedbackGiven: isEfficient ? "Sangat Efisien" : "Berhasil",
  });
}

export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/reset-db", {
    method: "POST",
  });
  return res.json();
}

// ==========================================
// CLASSROOM & TEAM API CLIENT METHODS
// ==========================================

// --- Multi-User Sessions ---
export async function registerSessionUser(data: {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  classId?: string;
  teamId?: string;
}): Promise<{ success: boolean; user: User }> {
  const res = await fetch("/api/session/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Auth (Legacy / Optional) ---
export async function loginUser(username: string, password: string): Promise<{ success: boolean; user: User }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Gagal masuk. Periksa kembali username dan password.");
  }
  return data;
}

// --- Users ---
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

export async function createUser(data: Partial<User>): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Gagal membuat pengguna baru");
  }
  return result;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  return res.json();
}

// --- Classes ---
export async function fetchClasses(): Promise<ClassRoom[]> {
  const res = await fetch("/api/classes");
  return res.json();
}

export async function createClass(data: Partial<ClassRoom>): Promise<ClassRoom> {
  const res = await fetch("/api/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// --- Teams ---
export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch("/api/teams");
  return res.json();
}

export async function fetchTeamById(id: string): Promise<Team & { members: (TeamMemberRecord & { user?: User })[] }> {
  const res = await fetch(`/api/teams/${id}`);
  return res.json();
}

export async function createTeam(data: {
  teamName: string;
  classId: string;
  leaderId: string;
  createdBy?: string;
}): Promise<{ team: Team; leaderMember: TeamMemberRecord }> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal membuat tim");
  }
  return res.json();
}

export async function joinTeamByCode(
  code: string,
  userId: string
): Promise<{ success: boolean; team: Team & { members: any[] }; member: TeamMemberRecord }> {
  const res = await fetch("/api/teams/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, userId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Gagal bergabung dengan kode tim tersebut");
  }
  return data;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const res = await fetch(`/api/teams/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteTeam(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
  return res.json();
}

export async function regenerateTeamCode(id: string): Promise<{ success: boolean; newCode: string }> {
  const res = await fetch(`/api/teams/${id}/regenerate-code`, { method: "POST" });
  return res.json();
}

export async function fetchTeamMembers(teamId: string): Promise<(TeamMemberRecord & { user?: User })[]> {
  const res = await fetch(`/api/teams/${teamId}/members`);
  return res.json();
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: "LEADER" | "MEMBER" = "MEMBER"
): Promise<{ success: boolean; member: TeamMemberRecord }> {
  const res = await fetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Gagal menambahkan anggota");
  return data;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
  return res.json();
}

export async function fetchTeamActivities(teamId: string): Promise<TeamActivity[]> {
  const res = await fetch(`/api/teams/${teamId}/activities`);
  return res.json();
}

// --- Assignments ---
export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch("/api/assignments");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((a: any) => {
    const levels = a.targetLevels || a.levelIds || [1, 2, 3];
    return {
      ...a,
      targetLevels: levels,
      levelIds: levels,
      dueDate: a.dueDate || a.deadline || "",
      deadline: a.deadline || a.dueDate || "",
      reflectionTemplateId: a.reflectionTemplateId || a.reflectionId || "",
      reflectionId: a.reflectionId || a.reflectionTemplateId || "",
    };
  });
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`/api/assignments/${id}`);
  const a = await res.json();
  const levels = a.targetLevels || a.levelIds || [1, 2, 3];
  return {
    ...a,
    targetLevels: levels,
    levelIds: levels,
    dueDate: a.dueDate || a.deadline || "",
    deadline: a.deadline || a.dueDate || "",
    reflectionTemplateId: a.reflectionTemplateId || a.reflectionId || "",
    reflectionId: a.reflectionId || a.reflectionTemplateId || "",
  };
}

export async function createAssignment(data: Partial<Assignment>): Promise<Assignment> {
  const res = await fetch("/api/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
  const res = await fetch(`/api/assignments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteAssignment(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
  return res.json();
}

export async function fetchAssignmentProgress(
  assignmentId: string,
  teamId?: string,
  userId?: string
): Promise<AssignmentProgress | null> {
  const query = new URLSearchParams();
  if (teamId) query.set("teamId", teamId);
  if (userId) query.set("userId", userId);
  const res = await fetch(`/api/assignments/${assignmentId}/progress?${query.toString()}`);
  if (!res.ok) return null;
  const p = await res.json();
  if (!p || p.error) return null;
  const levels = p.completedLevels || p.completedLevelIds || [];
  return {
    ...p,
    completedLevels: levels,
    completedLevelIds: levels,
    reflectionCompleted: p.reflectionCompleted ?? p.reflectionSubmitted ?? false,
    quizCompleted: p.quizCompleted ?? false,
    testCompleted: p.testCompleted ?? false,
  };
}

export async function recordLevelCompletion(
  assignmentId: string,
  levelId: number,
  teamId?: string,
  userId?: string,
  userName?: string
): Promise<AssignmentProgress> {
  const res = await fetch(`/api/assignments/${assignmentId}/progress/level`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ levelId, teamId, userId, userName }),
  });
  const p = await res.json();
  const levels = p.completedLevels || p.completedLevelIds || [];
  return {
    ...p,
    completedLevels: levels,
    completedLevelIds: levels,
    reflectionCompleted: p.reflectionCompleted ?? p.reflectionSubmitted ?? false,
    quizCompleted: p.quizCompleted ?? false,
    testCompleted: p.testCompleted ?? false,
  };
}

export async function fetchAllProgress(): Promise<AssignmentProgress[]> {
  const res = await fetch("/api/progress");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((p: any) => {
    const levels = p.completedLevels || p.completedLevelIds || [];
    return {
      ...p,
      completedLevels: levels,
      completedLevelIds: levels,
      reflectionCompleted: p.reflectionCompleted ?? p.reflectionSubmitted ?? false,
      quizCompleted: p.quizCompleted ?? false,
      testCompleted: p.testCompleted ?? false,
    };
  });
}

// --- Quizzes ---
export async function fetchQuizzes(): Promise<Quiz[]> {
  const res = await fetch("/api/quizzes");
  return res.json();
}

export async function fetchQuizById(id: string): Promise<Quiz> {
  const res = await fetch(`/api/quizzes/${id}`);
  return res.json();
}

export async function fetchQuizQuestions(quizId: string, sanitize = true): Promise<QuizQuestion[]> {
  const res = await fetch(`/api/quizzes/${quizId}/questions?sanitize=${sanitize}`);
  return res.json();
}

export async function submitQuizAttempt(
  quizId: string,
  data: {
    userId: string;
    userName?: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }
): Promise<{ attempt: QuizAttempt; progress?: AssignmentProgress }> {
  const res = await fetch(`/api/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchQuizAttempts(quizId: string, userId?: string, teamId?: string): Promise<QuizAttempt[]> {
  const query = new URLSearchParams();
  if (userId) query.set("userId", userId);
  if (teamId) query.set("teamId", teamId);
  const res = await fetch(`/api/quizzes/${quizId}/attempts?${query.toString()}`);
  return res.json();
}

// --- Reflections ---
export async function fetchReflectionTemplates(): Promise<ReflectionTemplate[]> {
  const res = await fetch("/api/reflections");
  return res.json();
}

export async function fetchReflectionTemplateById(id: string): Promise<ReflectionTemplate> {
  const res = await fetch(`/api/reflections/${id}`);
  return res.json();
}

export async function submitReflection(
  reflectionId: string,
  data: {
    userId: string;
    userName: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }
): Promise<{ submission: ReflectionSubmission; progress?: AssignmentProgress }> {
  const res = await fetch(`/api/reflections/${reflectionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchReflectionSubmissions(reflectionId?: string): Promise<ReflectionSubmission[]> {
  const url = reflectionId ? `/api/reflections/${reflectionId}/submissions` : "/api/reflections/sub";
  const res = await fetch(url);
  return res.json();
}

// --- Formal Tests ---
export async function fetchTests(): Promise<FormalTest[]> {
  const res = await fetch("/api/tests");
  return res.json();
}

export async function fetchTestById(id: string): Promise<FormalTest> {
  const res = await fetch(`/api/tests/${id}`);
  return res.json();
}

export async function fetchTestQuestions(testId: string, sanitize = true): Promise<TestQuestion[]> {
  const res = await fetch(`/api/tests/${testId}/questions?sanitize=${sanitize}`);
  return res.json();
}

export async function submitTestAttempt(
  testId: string,
  data: {
    userId: string;
    userName?: string;
    teamId?: string;
    assignmentId?: string;
    answers: { questionId: string; answer: string }[];
  }
): Promise<{ attempt: TestAttempt; progress?: AssignmentProgress }> {
  const res = await fetch(`/api/tests/${testId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Gagal mengumpulkan tes");
  return json;
}

export async function fetchTestAttempts(testId: string, userId?: string): Promise<TestAttempt[]> {
  const query = new URLSearchParams();
  if (userId) query.set("userId", userId);
  const res = await fetch(`/api/tests/${testId}/attempts?${query.toString()}`);
  return res.json();
}

// --- Settings & Audit Logs ---
export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  return res.json();
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch("/api/audit-logs");
  return res.json();
}

