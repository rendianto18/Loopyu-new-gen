export type Direction = "right" | "down" | "left" | "up";

export type CommandAction = "move_forward" | "move_backward" | "turn_left" | "turn_right" | "take_battery" | "wait" | "jump";

export interface CommandBlock {
  id: string;
  type: "command";
  action: CommandAction;
}

export interface RepeatBlock {
  id: string;
  type: "repeat";
  count: number;
  variable?: string;
  startVal?: number;
  conditionOp?: "<" | "<=";
  commands: CodeBlock[];
}

export interface WhileBlock {
  id: string;
  type: "while";
  condition: "path_clear" | "has_battery" | "not_at_target" | "energy_gt_zero";
  commands: CodeBlock[];
}

export interface DoWhileBlock {
  id: string;
  type: "do_while";
  condition: "path_clear" | "has_battery" | "not_at_target";
  commands: CodeBlock[];
}

export interface BreakBlock {
  id: string;
  type: "break";
}

export interface ContinueBlock {
  id: string;
  type: "continue";
}

export interface IfBlock {
  id: string;
  type: "if";
  condition: "at_target" | "path_clear" | "has_battery";
  commands: CodeBlock[];
}

export type CodeBlock = CommandBlock | RepeatBlock | WhileBlock | DoWhileBlock | BreakBlock | ContinueBlock | IfBlock;

export type BlockType = "move_forward" | "move_backward" | "turn_left" | "turn_right" | "take_battery" | "wait" | "repeat" | "while" | "do_while" | "break" | "continue" | "if";

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
  solutionCode?: CodeBlock[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  focus: string;
  concept?: "for" | "while" | "do_while" | "nested" | "break" | "continue" | "mixed";
  requiredLoopType?: "for" | "while" | "do_while" | "any_loop" | "for_and_while" | "none";
  expectedIterations?: number;
  stageEL: string;
  challengeExample?: string;
  difficulty?: string;
  difficultyStars?: number;
  description: string;
  instruction: string;
  gridSize: { rows: number; cols: number };
  startPos: { x: number; y: number; dir: Direction };
  targetBatteries: { id: string; x: number; y: number }[];
  obstacles?: { x: number; y: number }[];
  allowedBlocks: ("move_forward" | "move_backward" | "turn_left" | "turn_right" | "take_battery" | "wait" | "jump" | "repeat" | "while" | "do_while" | "break" | "continue" | "if")[];
  maxBlocksForEfficiency: number;
  maxBlocksLimit?: number;
  defaultBuggyCode?: CodeBlock[];
  hints: {
    hint1: string;
    hint2: string;
    hint3: string;
  };
  reflectionQuestions: {
    id: string;
    question: string;
    placeholder: string;
  }[];
}

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
  type: "task_status" | "task_created" | "mission_completed" | "hint_requested" | "badge_earned" | "review_requested" | "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  taskId?: string;
  levelId?: number;
  userName?: string;
  read: boolean;
  createdAt: string;
  timestamp?: string;
  avatar?: string;
}

// ==========================================
// TEAM, USER, ASSIGNMENT & CLASSROOM SCHEMAS
// ==========================================

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "TEAM_LEADER";

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  classId: string;
  teamId?: string;
  status?: "ACTIVE" | "INACTIVE";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  description?: string;
  code?: string;
  academicYear?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  teamCode: string; // e.g. "LP-4821"
  classId: string;
  leaderId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  userId: string;
  role: "LEADER" | "MEMBER";
  joinedAt: string;
}

export type AssignmentType = "GAME" | "QUIZ" | "REFLECTION" | "TEST" | "MIXED";
export type AssignmentMode = "INDIVIDUAL" | "TEAM";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type?: AssignmentType;
  mode: AssignmentMode;
  classId?: string;
  levelIds?: number[];
  targetLevels?: number[];
  quizId?: string;
  reflectionId?: string;
  reflectionTemplateId?: string;
  testId?: string;
  targetType?: "CLASS" | "TEAM" | "INDIVIDUAL";
  targetId?: string;
  deadline?: string;
  dueDate?: string;
  createdBy: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
}

export interface AssignmentProgress {
  id: string;
  assignmentId: string;
  teamId?: string;
  userId?: string;
  userName?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedLevels?: number[];
  completedLevelIds?: number[];
  gameProgress?: number; // 0 - 100%
  quizScore: number;
  quizCompleted: boolean;
  reflectionSubmitted?: boolean;
  reflectionCompleted?: boolean;
  testScore: number;
  testCompleted: boolean;
  score: number;
  startedAt?: string;
  completedAt?: string;
}

export type ActivityType =
  | "JOIN_TEAM"
  | "LEAVE_TEAM"
  | "CREATE_TEAM"
  | "START_LEVEL"
  | "COMPLETE_LEVEL"
  | "SUBMIT_QUIZ"
  | "SUBMIT_REFLECTION"
  | "SUBMIT_TEST"
  | "COMPLETE_ASSIGNMENT";

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ==========================================
// QUIZ SCHEMAS
// ==========================================

export type QuizQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "CODE_OUTPUT"
  | "IDENTIFY_ERROR"
  | "CHOOSE_LOOP"
  | "ARRANGE_CODE";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  createdBy: string;
  status: "ACTIVE" | "DRAFT";
  questionCount?: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question?: string;
  prompt?: string;
  codeSnippet?: string;
  type?: QuizQuestionType;
  options: (string | { id: string; text: string })[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order?: number;
  concept?: string;
  conceptTag?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  userName?: string;
  teamId?: string;
  score: number;
  maxScore?: number;
  answers: { questionId: string; answer: string; isCorrect?: boolean }[];
  conceptFeedback?: Record<string, "Good" | "Review" | "GOOD" | "REVIEW">;
  startedAt?: string;
  completedAt?: string;
}

// ==========================================
// REFLECTION SCHEMAS
// ==========================================

export interface ReflectionQuestionItem {
  id: string;
  question: string;
  placeholder?: string;
  isTeamQuestion?: boolean;
}

export interface ReflectionTemplate {
  id: string;
  title: string;
  description?: string;
  assignmentId?: string;
  questions: ReflectionQuestionItem[];
  createdBy: string;
  createdAt?: string;
}

export interface ReflectionSubmission {
  id: string;
  reflectionId: string;
  userId: string;
  userName: string;
  teamId?: string;
  assignmentId?: string;
  answers: { questionId: string; answer: string }[];
  submittedAt: string;
}

// ==========================================
// FORMAL TEST SCHEMAS
// ==========================================

export type TestQuestionType =
  | "MULTIPLE_CHOICE"
  | "CODE_OUTPUT"
  | "PREDICT_ITERATIONS"
  | "FIND_ERROR";

export interface FormalTest {
  id: string;
  title: string;
  description: string;
  duration?: number; // in minutes
  timeLimitMinutes?: number;
  passingScore: number;
  maxAttempts: number;
  questionCount?: number;
  createdBy: string;
  status: "ACTIVE" | "DRAFT";
}

export interface TestQuestion {
  id: string;
  testId: string;
  question?: string;
  prompt?: string;
  codeSnippet?: string;
  type?: TestQuestionType;
  options: (string | { id: string; text: string })[];
  answer?: string;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  order?: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  userName?: string;
  teamId?: string;
  assignmentId?: string;
  score: number;
  totalPoints?: number;
  attemptNumber?: number;
  passed?: boolean;
  status?: "IN_PROGRESS" | "SUBMITTED";
  startedAt?: string;
  submittedAt?: string;
}

// ==========================================
// SETTINGS & AUDIT LOG SCHEMAS
// ==========================================

export interface AppSettings {
  websiteName?: string;
  schoolName?: string;
  academicYear?: string;
  whoCanCreateTeams?: "ADMIN" | "TEACHER" | "STUDENTS";
  maxTeamSize?: number;
  maxTeamMembers?: number;
  allowStudentTeamCreation?: boolean;
  requireReflectionBeforeTest?: boolean;
  showPublicLeaderboard?: boolean;
  requireTeacherApproval?: boolean;
  defaultPassingScore?: number;
  maxTestAttempts?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

