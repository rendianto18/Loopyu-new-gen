import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  TeamMember,
  TaskItem,
  LevelConfig,
  AppNotification,
  CodeBlock,
  User,
  Team,
  TeamMemberRecord,
  Assignment,
  AssignmentProgress,
  TeamActivity,
  Quiz,
  ReflectionTemplate,
  FormalTest,
  AppSettings,
} from "../types";
import * as api from "../services/api";
import { socketClient } from "../services/socket";
import { soundManager } from "../utils/audio";
import { INITIAL_8_LEVELS } from "../data/levelsData";

export type ActiveNavTab =
  | "start"
  | "arena"
  | "assignments"
  | "team"
  | "quiz"
  | "reflection"
  | "test"
  | "admin"
  | "tasks"
  | "pair"
  | "database";

interface AppContextType {
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  appUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  learningMode: "INDIVIDUAL" | "TEAM";
  setLearningMode: (mode: "INDIVIDUAL" | "TEAM") => void;

  // Teams
  teams: Team[];
  currentTeam: Team | null;
  currentTeamMembers: (TeamMemberRecord & { user?: User })[];
  teamActivities: TeamActivity[];
  joinTeamByCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  createNewTeam: (name: string) => Promise<Team>;
  leaveCurrentTeam: () => Promise<void>;
  refreshTeamData: () => Promise<void>;

  // Assignments
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  setCurrentAssignment: (asg: Assignment | null) => void;
  assignmentProgress: AssignmentProgress | null;
  recordLevelCompleted: (levelId: number) => Promise<void>;

  // Quizzes, Reflections, Tests
  quizzes: Quiz[];
  reflections: ReflectionTemplate[];
  tests: FormalTest[];
  activeQuizId: string | null;
  setActiveQuizId: (id: string | null) => void;
  activeTestId: string | null;
  setActiveTestId: (id: string | null) => void;
  activeReflectionId: string | null;
  setActiveReflectionId: (id: string | null) => void;

  // Legacy & Arena
  team: TeamMember[];
  tasks: TaskItem[];
  levels: LevelConfig[];
  currentLevel: LevelConfig | null;
  setCurrentLevelId: (id: number) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  notifications: AppNotification[];
  toasts: AppNotification[];
  addToast: (notif: Partial<AppNotification> & { title: string; message: string }) => void;
  removeToast: (id: string) => void;
  unreadCount: number;
  onlineUsers: { userId: string; userName: string; avatar?: string; activeLevelId?: number }[];
  isSocketConnected: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  createTask: (task: {
    title: string;
    description: string;
    levelId?: number;
    assignedTo: string;
    status: TaskItem["status"];
    priority: TaskItem["priority"];
    tags: string[];
    solutionCode?: CodeBlock[];
  }) => Promise<TaskItem>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<TaskItem>;
  deleteTask: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Admin Settings
  settings: AppSettings | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // Multi-User Session Management
  sessionId: string;
  updateSessionProfile: (name: string, avatar: string) => Promise<void>;
  createNewSession: () => void;

  // Open Access (No gating)
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isTeacherOrAdmin: boolean;
}

const FUN_SESSION_NAMES = [
  "Pemain Bintang",
  "Ksatria Loop",
  "Penjelajah Kode",
  "Pakar Algoritma",
  "Coder Cilik",
  "Robotika Hero",
  "Kapten Byte",
  "Master Logika",
  "Ninja Coding",
  "Juara Loopyu",
  "Arsitek Program",
  "Detektif Bug",
];

const FUN_AVATARS = [
  "🤖", "🚀", "🐱", "🦊", "🦁", "🐼", "🦉", "👩‍💻", "👨‍💻", "⚡", "🌟", "🎮", "🦄", "🎯", "🎨"
];

function getOrCreateBrowserSession(): { id: string; name: string; avatar: string } {
  try {
    const raw = sessionStorage.getItem("loopyu_session_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {}

  const randomSuffix = Math.floor(10 + Math.random() * 90);
  const randomNameBase = FUN_SESSION_NAMES[Math.floor(Math.random() * FUN_SESSION_NAMES.length)];
  const randomAvatar = FUN_AVATARS[Math.floor(Math.random() * FUN_AVATARS.length)];
  const newSession = {
    id: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${randomNameBase} #${randomSuffix}`,
    avatar: randomAvatar,
  };

  try {
    sessionStorage.setItem("loopyu_session_user", JSON.stringify(newSession));
  } catch (e) {}

  return newSession;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSession = getOrCreateBrowserSession();
  const [sessionId, setSessionId] = useState<string>(initialSession.id);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember>({
    id: initialSession.id,
    name: initialSession.name,
    role: "Pemain",
    avatar: initialSession.avatar,
    points: 150,
    coins: 30,
    badges: ["Sesi Aktif", "Penjelajah Loop"],
    isOnline: true,
  });

  // Classroom Users State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [appUser, setAppUser] = useState<User>({
    id: initialSession.id,
    name: initialSession.name,
    username: initialSession.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + initialSession.id.slice(-4),
    role: "STUDENT",
    classId: "class-8a",
    status: "ACTIVE",
    avatar: initialSession.avatar,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Open Access State (Admin & Login removed)
  const [isAuthenticated] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Full open access for all users
  const isAdmin = true;
  const isTeacherOrAdmin = true;

  const [learningMode, setLearningMode] = useState<"INDIVIDUAL" | "TEAM">("TEAM");

  // Teams
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentTeamMembers, setCurrentTeamMembers] = useState<(TeamMemberRecord & { user?: User })[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [assignmentProgress, setAssignmentProgress] = useState<AssignmentProgress | null>(null);

  // Quizzes, Tests, Reflections
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [reflections, setReflections] = useState<ReflectionTemplate[]>([]);
  const [tests, setTests] = useState<FormalTest[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [activeReflectionId, setActiveReflectionId] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [levels, setLevels] = useState<LevelConfig[]>(INITIAL_8_LEVELS);
  const [currentLevelId, setCurrentLevelIdState] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>("start");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; userName: string; activeLevelId?: number }[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.soundEnabled = next;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = useCallback((notif: Partial<AppNotification> & { title: string; message: string }) => {
    const fullNotif: AppNotification = {
      id: notif.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: notif.type || "task_status",
      title: notif.title,
      message: notif.message,
      taskId: notif.taskId,
      levelId: notif.levelId,
      userName: notif.userName,
      read: notif.read ?? false,
      createdAt: notif.createdAt || notif.timestamp || new Date().toISOString(),
      timestamp: notif.timestamp || notif.createdAt || new Date().toISOString(),
      avatar: notif.avatar,
    };
    setToasts((prev) => [fullNotif, ...prev.slice(0, 4)]);
    soundManager.playNotification();

    setTimeout(() => {
      removeToast(fullNotif.id);
    }, 5000);
  }, []);

  // Fetch classroom and team data
  const refreshTeamData = useCallback(async () => {
    try {
      const allTeams = await api.fetchTeams();
      setTeams(allTeams);

      const userTeam = allTeams.find((t) => t.id === appUser.teamId);
      if (userTeam) {
        setCurrentTeam(userTeam);
        const [members, acts] = await Promise.all([
          api.fetchTeamMembers(userTeam.id),
          api.fetchTeamActivities(userTeam.id),
        ]);
        setCurrentTeamMembers(members);
        setTeamActivities(acts);
      } else {
        setCurrentTeam(null);
        setCurrentTeamMembers([]);
        setTeamActivities([]);
      }
    } catch (e) {
      console.error("Failed to load team data:", e);
    }
  }, [appUser.teamId]);

  // Fetch initial data
  const refreshData = useCallback(async () => {
    try {
      const [
        fetchedTeam,
        fetchedTasks,
        fetchedLevels,
        fetchedNotifs,
        fetchedUsers,
        fetchedAssignments,
        fetchedQuizzes,
        fetchedReflections,
        fetchedTests,
        fetchedSettings,
      ] = await Promise.all([
        api.fetchTeam(),
        api.fetchTasks(),
        api.fetchLevels(),
        api.fetchNotifications(),
        api.fetchUsers(),
        api.fetchAssignments(),
        api.fetchQuizzes(),
        api.fetchReflectionTemplates(),
        api.fetchTests(),
        api.fetchSettings(),
      ]);

      setTeam(fetchedTeam);
      setTasks(fetchedTasks);
      setLevels(
        fetchedLevels && fetchedLevels.length > 0
          ? fetchedLevels.filter((l) => l.id <= 8).sort((a, b) => a.id - b.id)
          : INITIAL_8_LEVELS
      );
      setNotifications(fetchedNotifs);
      setAllUsers(fetchedUsers);
      setAssignments(fetchedAssignments);
      setQuizzes(fetchedQuizzes);
      setReflections(fetchedReflections);
      setTests(fetchedTests);
      setSettings(fetchedSettings);

      if (fetchedAssignments.length > 0 && !currentAssignment) {
        setCurrentAssignment(fetchedAssignments[0]);
      }

      // Sync active session user with server database
      try {
        const sessionRes = await api.registerSessionUser({
          id: appUser.id,
          name: appUser.name,
          avatar: appUser.avatar,
          role: appUser.role,
          classId: appUser.classId,
          teamId: appUser.teamId,
        });
        if (sessionRes.success && sessionRes.user) {
          setAppUser((prev) => ({ ...prev, ...sessionRes.user }));
        }
      } catch (err) {
        console.warn("Session register sync warning:", err);
      }

      // Sync legacy current user
      const matchedMember = fetchedTeam.find((m) => m.id === appUser.id);
      if (matchedMember) {
        setCurrentUser(matchedMember);
      }
    } catch (e) {
      console.error("Failed to load initial data:", e);
    }
  }, [currentUser.id, appUser.id, currentAssignment]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshTeamData();
  }, [refreshTeamData]);

  // Update current session profile (Name & Avatar)
  const updateSessionProfile = async (newName: string, newAvatar: string) => {
    const cleanName = newName.trim() || appUser.name;
    const cleanAvatar = newAvatar || appUser.avatar || "🧑‍🎓";

    const updatedAppUser: User = {
      ...appUser,
      name: cleanName,
      avatar: cleanAvatar,
      updatedAt: new Date().toISOString(),
    };

    setAppUser(updatedAppUser);
    setCurrentUser((prev) => ({
      ...prev,
      name: cleanName,
      avatar: cleanAvatar,
    }));

    const sessionObj = {
      id: appUser.id,
      name: cleanName,
      avatar: cleanAvatar,
    };
    try {
      sessionStorage.setItem("loopyu_session_user", JSON.stringify(sessionObj));
    } catch (e) {}

    socketClient.setUserInfo(appUser.id, cleanName, currentLevelId, cleanAvatar);

    try {
      await api.registerSessionUser({
        id: appUser.id,
        name: cleanName,
        avatar: cleanAvatar,
        role: appUser.role,
        classId: appUser.classId,
        teamId: appUser.teamId,
      });
      addToast({
        title: "Profil Sesi Diperbarui! ✨",
        message: `Identitas sesi Anda sekarang: ${cleanName}`,
        type: "success",
      });
    } catch (e) {
      console.warn("Session update warning:", e);
    }
  };

  // Start a fresh, independent session in this tab/browser
  const createNewSession = () => {
    try {
      sessionStorage.removeItem("loopyu_session_user");
    } catch (e) {}

    const freshSession = getOrCreateBrowserSession();
    setSessionId(freshSession.id);

    const freshUser: User = {
      id: freshSession.id,
      name: freshSession.name,
      username: freshSession.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + freshSession.id.slice(-4),
      role: "STUDENT",
      classId: "class-8a",
      status: "ACTIVE",
      avatar: freshSession.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppUser(freshUser);
    setCurrentUser({
      id: freshSession.id,
      name: freshSession.name,
      role: "Pemain",
      avatar: freshSession.avatar,
      points: 150,
      coins: 30,
      badges: ["Sesi Baru", "Pemain Mandiri"],
      isOnline: true,
    });

    socketClient.setUserInfo(freshSession.id, freshSession.name, currentLevelId, freshSession.avatar);

    api.registerSessionUser({
      id: freshSession.id,
      name: freshSession.name,
      avatar: freshSession.avatar,
      role: "STUDENT",
    }).catch(console.warn);

    soundManager.playSuccess();
    addToast({
      title: "Sesi Baru Dimulai! 🚀",
      message: `Selamat datang di sesi baru sebagai ${freshSession.name}.`,
      type: "info",
    });
  };

  // Login (Open access)
  const login = async (): Promise<boolean> => {
    return true;
  };

  // Logout (Restarts session)
  const logout = () => {
    createNewSession();
  };

  // Unrestricted setActiveTab (No gating)
  const handleSetActiveTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    soundManager.playClick();
  };

  // Switch persona or select from registered profiles
  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;
    setAppUser(target);
    setSessionId(target.id);

    const sessionObj = {
      id: target.id,
      name: target.name,
      avatar: target.avatar || "🧑‍🎓",
    };
    try {
      sessionStorage.setItem("loopyu_session_user", JSON.stringify(sessionObj));
    } catch (e) {}

    // Sync legacy currentUser
    const legacy = team.find((m) => m.id === target.id);
    if (legacy) {
      setCurrentUser(legacy);
    } else {
      setCurrentUser({
        id: target.id,
        name: target.name,
        role: target.role === "TEACHER" ? "Guru" : target.role === "ADMIN" ? "Admin" : "Siswa",
        avatar: target.avatar || "🧑‍🎓",
        points: 150,
        coins: 20,
        badges: ["Pilihan Karakter"],
        isOnline: true,
      });
    }

    socketClient.setUserInfo(target.id, target.name, currentLevelId, target.avatar);
    soundManager.playSuccess();
    addToast({
      title: `Beralih ke Profil ${target.name}`,
      message: `Sekarang kamu bermain dengan profil @${target.username}.`,
      type: "info",
    });
  };

  // Join Team by code
  const joinTeamByCode = async (code: string) => {
    try {
      const res = await api.joinTeamByCode(code, appUser.id);
      await refreshData();
      await refreshTeamData();
      soundManager.playSuccess();
      addToast({
        title: "Bergabung ke Tim",
        message: `Berhasil bergabung dengan tim ${res.team.teamName}!`,
      });
      return { success: true };
    } catch (err: any) {
      soundManager.playError();
      addToast({
        title: "Gagal Bergabung",
        message: err.message || "Kode tim tidak valid",
      });
      return { success: false, message: err.message };
    }
  };

  // Create new team
  const createNewTeam = async (name: string) => {
    const res = await api.createTeam({
      teamName: name,
      classId: appUser.classId || "class-8a",
      leaderId: appUser.id,
      createdBy: appUser.id,
    });
    await refreshData();
    await refreshTeamData();
    soundManager.playSuccess();
    addToast({
      title: "Tim Dibuat!",
      message: `Tim ${res.team.teamName} siap digunakan. Kode: ${res.team.teamCode}`,
    });
    return res.team;
  };

  // Leave team
  const leaveCurrentTeam = async () => {
    if (!currentTeam) return;
    await api.removeTeamMember(currentTeam.id, appUser.id);
    await refreshData();
    await refreshTeamData();
    addToast({
      title: "Keluar dari Tim",
      message: `Anda telah keluar dari tim ${currentTeam.teamName}.`,
    });
  };

  // Record Level completed in Assignment
  const recordLevelCompleted = async (levelId: number) => {
    if (!currentAssignment) return;
    const teamId = learningMode === "TEAM" ? currentTeam?.id : undefined;
    const userId = learningMode === "INDIVIDUAL" ? appUser.id : undefined;

    try {
      const updated = await api.recordLevelCompletion(
        currentAssignment.id,
        levelId,
        teamId,
        userId,
        appUser.name
      );
      setAssignmentProgress(updated);
      if (updated.status === "COMPLETED") {
        soundManager.playFanfare();
        addToast({
          title: "Tugas Selesai!",
          message: `Selamat! Seluruh kriteria tugas '${currentAssignment.title}' telah tuntas. Skor: ${updated.score}`,
        });
      }
    } catch (e) {
      console.error("Error recording progress:", e);
    }
  };

  // Update Settings
  const updateSettings = async (updates: Partial<AppSettings>) => {
    const updated = await api.updateSettings(updates);
    setSettings(updated);
    addToast({
      title: "Pengaturan Disimpan",
      message: "Konfigurasi kelas dan pembatasan berhasil diperbarui.",
    });
  };

  // Handle WebSocket events
  useEffect(() => {
    socketClient.setUserInfo(currentUser.id, currentUser.name, currentLevelId);

    const unsubConnection = socketClient.on("connection:change", ({ connected }) => {
      setIsSocketConnected(connected);
    });

    const unsubInit = socketClient.on("init", (payload) => {
      if (payload.tasks) setTasks(payload.tasks);
      if (payload.team) setTeam(payload.team);
      if (payload.notifications) setNotifications(payload.notifications);
    });

    const unsubPresence = socketClient.on("presence:update", (users) => {
      setOnlineUsers(users);
    });

    const unsubTaskCreated = socketClient.on("task:created", (newTask: TaskItem) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
    });

    const unsubTaskUpdated = socketClient.on("task:updated", (updatedTask: TaskItem) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    });

    const unsubTaskDeleted = socketClient.on("task:deleted", ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    const unsubTeamUpdated = socketClient.on("team:updated", () => {
      refreshData();
      refreshTeamData();
    });

    const unsubNotification = socketClient.on("notification:new", (newNotif: AppNotification) => {
      setNotifications((prev) => [newNotif, ...prev]);
      addToast(newNotif);
    });

    const unsubNotifCleared = socketClient.on("notification:cleared", () => {
      setNotifications([]);
    });

    return () => {
      unsubConnection();
      unsubInit();
      unsubPresence();
      unsubTaskCreated();
      unsubTaskUpdated();
      unsubTaskDeleted();
      unsubTeamUpdated();
      unsubNotification();
      unsubNotifCleared();
    };
  }, [currentUser.id, currentUser.name, currentLevelId, addToast, refreshData, refreshTeamData]);

  const setCurrentLevelId = (id: number) => {
    setCurrentLevelIdState(id);
    socketClient.updatePresence(id);
  };

  const createTask = async (taskData: {
    title: string;
    description: string;
    levelId?: number;
    assignedTo: string;
    status: TaskItem["status"];
    priority: TaskItem["priority"];
    tags: string[];
    solutionCode?: CodeBlock[];
  }) => {
    const created = await api.createTask({
      ...taskData,
      createdBy: currentUser.id,
    });
    setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
    soundManager.playClick();
    return created;
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const updated = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    soundManager.playClick();
    return updated;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    soundManager.playClick();
  };

  const markNotificationAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = async () => {
    await api.clearNotifications();
    setNotifications([]);
  };

  const currentLevel = levels.find((l) => l.id === currentLevelId) || levels[0] || null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: (user) => {
          setCurrentUser(user);
          socketClient.setUserInfo(user.id, user.name, currentLevelId);
        },
        appUser,
        allUsers,
        switchUser,
        learningMode,
        setLearningMode,

        // Teams
        teams,
        currentTeam,
        currentTeamMembers,
        teamActivities,
        joinTeamByCode,
        createNewTeam,
        leaveCurrentTeam,
        refreshTeamData,

        // Assignments
        assignments,
        currentAssignment,
        setCurrentAssignment,
        assignmentProgress,
        recordLevelCompleted,

        // Quizzes, Reflections, Tests
        quizzes,
        reflections,
        tests,
        activeQuizId,
        setActiveQuizId,
        activeTestId,
        setActiveTestId,
        activeReflectionId,
        setActiveReflectionId,

        // Legacy & Arena
        team,
        tasks,
        levels,
        currentLevel,
        setCurrentLevelId,
        activeTab,
        setActiveTab: handleSetActiveTab,
        notifications,
        toasts,
        addToast,
        removeToast,
        unreadCount,
        onlineUsers,
        isSocketConnected,
        soundEnabled,
        toggleSound,
        createTask,
        updateTask,
        deleteTask,
        markNotificationAsRead,
        clearAllNotifications,
        refreshData,

        // Settings
        settings,
        updateSettings,

        // Multi-User Session Management
        sessionId,
        updateSessionProfile,
        createNewSession,

        // Auth & Access Control
        isAuthenticated,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        logout,
        isAdmin,
        isTeacherOrAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

