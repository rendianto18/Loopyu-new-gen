import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { db, TeamMember, TaskItem } from "./server/db.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// --- WebSocket Setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  userName?: string;
  avatar?: string;
  activeLevelId?: number;
}

const clients = new Map<WebSocket, ConnectedClient>();

function broadcast(type: string, payload: any, senderWs?: WebSocket) {
  const message = JSON.stringify({ type, payload });
  for (const [clientWs] of clients) {
    if (clientWs.readyState === WebSocket.OPEN) {
      // We can send to all or skip sender if specified
      clientWs.send(message);
    }
  }
}

function broadcastPresence() {
  const activeUsers: { userId: string; userName: string; avatar?: string; activeLevelId?: number }[] = [];
  for (const [, client] of clients) {
    if (client.userId && client.userName) {
      activeUsers.push({
        userId: client.userId,
        userName: client.userName,
        avatar: client.avatar,
        activeLevelId: client.activeLevelId,
      });
    }
  }
  broadcast("presence:update", activeUsers);
}

wss.on("connection", (ws) => {
  clients.set(ws, { ws });

  // Send initial data to connecting client
  ws.send(
    JSON.stringify({
      type: "init",
      payload: {
        tasks: db.getTasks(),
        team: db.getTeam(),
        notifications: db.getNotifications(),
      },
    })
  );

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const client = clients.get(ws);

      switch (data.type) {
        case "user:join": {
          if (client) {
            client.userId = data.payload.userId;
            client.userName = data.payload.userName;
            client.avatar = data.payload.avatar;
            client.activeLevelId = data.payload.activeLevelId;
          }
          broadcastPresence();
          break;
        }

        case "user:presence": {
          if (client) {
            client.activeLevelId = data.payload.activeLevelId;
          }
          broadcastPresence();
          break;
        }

        case "pair:code_change": {
          // Broadcast live code edits to other team members in Pair Mode
          for (const [otherWs] of clients) {
            if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(
                JSON.stringify({
                  type: "pair:code_synced",
                  payload: data.payload,
                })
              );
            }
          }
          break;
        }

        case "pair:run_simulation": {
          // Broadcast live run to team members
          for (const [otherWs] of clients) {
            if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) {
              otherWs.send(
                JSON.stringify({
                  type: "pair:simulation_triggered",
                  payload: data.payload,
                })
              );
            }
          }
          break;
        }

        case "ping": {
          ws.send(JSON.stringify({ type: "pong" }));
          break;
        }
      }
    } catch (e) {
      console.error("WebSocket message parsing error:", e);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcastPresence();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// --- REST API ENDPOINTS ---

// Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "LOOPYU", version: "1.0.0" });
});

// Team
app.get("/api/team", (_req, res) => {
  res.json(db.getTeam());
});

// Tasks
app.get("/api/tasks", (_req, res) => {
  res.json(db.getTasks());
});

app.post("/api/tasks", (req, res) => {
  const { title, description, levelId, assignedTo, status, priority, tags, solutionCode, createdBy } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const newTask = db.createTask({
    title,
    description: description || "",
    levelId: levelId ? Number(levelId) : undefined,
    assignedTo: assignedTo || "usr-1",
    status: status || "todo",
    priority: priority || "medium",
    tags: Array.isArray(tags) ? tags : ["Algoritma"],
    solutionCode: solutionCode || [],
    createdBy: createdBy || "usr-1",
  });

  // Automated notification for new task
  const teamMember = db.getTeam().find((m) => m.id === newTask.assignedTo);
  const notif = db.addNotification({
    type: "task_created",
    title: "Tugas Baru Ditambahkan",
    message: `Tugas "${newTask.title}" telah ditugaskan kepada ${teamMember?.name || "anggota tim"}.`,
    taskId: newTask.id,
    levelId: newTask.levelId,
    userName: teamMember?.name,
  });

  // Broadcast real-time updates
  broadcast("task:created", newTask);
  broadcast("notification:new", notif);

  res.status(201).json(newTask);
});

app.patch("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const prevTask = db.getTaskById(id);
  if (!prevTask) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const updatedTask = db.updateTask(id, req.body);
  if (!updatedTask) {
    res.status(500).json({ error: "Failed to update task" });
    return;
  }

  // Check if status changed for automated notifications
  if (req.body.status && req.body.status !== prevTask.status) {
    const statusLabels: Record<string, string> = {
      todo: "To Do (Rencana)",
      in_progress: "Sedang Dikerjakan",
      review: "Review / Pair Testing",
      done: "Selesai (Done)",
    };

    let notifType: any = "task_status";
    let notifTitle = "Status Tugas Berubah";
    if (req.body.status === "review") {
      notifType = "review_requested";
      notifTitle = "Permintaan Review Kode";
    } else if (req.body.status === "done") {
      notifTitle = "Tugas Berhasil Diselesaikan! 🎉";
    }

    const notif = db.addNotification({
      type: notifType,
      title: notifTitle,
      message: `Tugas "${updatedTask.title}" dipindahkan ke "${statusLabels[req.body.status] || req.body.status}".`,
      taskId: updatedTask.id,
      levelId: updatedTask.levelId,
    });
    broadcast("notification:new", notif);
  }

  broadcast("task:updated", updatedTask);
  res.json(updatedTask);
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const success = db.deleteTask(id);
  if (!success) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  broadcast("task:deleted", { id });
  res.json({ success: true, id });
});

// Levels (Blueprint SRS)
app.get("/api/levels", (_req, res) => {
  res.json(db.getLevels());
});

app.get("/api/levels/:id", (req, res) => {
  const id = Number(req.params.id);
  const level = db.getLevelById(id);
  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }
  res.json(level);
});

// Simulation Attempts & Feedback (Blueprint SRS Section 11 & 12)
app.get("/api/attempts", (req, res) => {
  const levelId = req.query.levelId ? Number(req.query.levelId) : undefined;
  res.json(db.getAttempts(levelId));
});

app.post("/api/attempts", (req, res) => {
  const {
    levelId,
    userId,
    userName,
    success,
    stepsTaken,
    batteriesCollected,
    totalBatteries,
    blocksUsed,
    isEfficient,
    hintsUsedCount,
    feedbackGiven,
  } = req.body;

  // Calculate points strictly following Blueprint Section 12:
  // - Misi berhasil: +50
  // - Solusi efisien: +20
  // - Berhasil tanpa hint: +20
  // - Memperbaiki kesalahan: +10
  let scoreAwarded = 0;
  let coinsAwarded = 0;
  let earnedBadge: string | undefined = undefined;

  if (success) {
    scoreAwarded += 50;
    coinsAwarded += 10;

    if (isEfficient) {
      scoreAwarded += 20;
      coinsAwarded += 5;
    }

    if (hintsUsedCount === 0) {
      scoreAwarded += 20;
      coinsAwarded += 5;
    }

    if (levelId === 1) earnedBadge = "Pattern Spotter";
    else if (levelId === 2) earnedBadge = "Loop Explorer";
    else if (levelId === 3) earnedBadge = "Stair Builder";
    else if (levelId === 4) earnedBadge = "While Sentinel";
    else if (levelId === 5) earnedBadge = "Loop Breaker";
    else if (levelId === 6) earnedBadge = "Loop Master";
  }

  const attempt = db.logAttempt({
    levelId: Number(levelId),
    userId: userId || "usr-1",
    userName: userName || "Rendi (Ketua)",
    success: Boolean(success),
    stepsTaken: Number(stepsTaken) || 0,
    batteriesCollected: Number(batteriesCollected) || 0,
    totalBatteries: Number(totalBatteries) || 0,
    blocksUsed: Number(blocksUsed) || 0,
    isEfficient: Boolean(isEfficient),
    hintsUsedCount: Number(hintsUsedCount) || 0,
    scoreAwarded,
    feedbackGiven: feedbackGiven || "",
  });

  // Update team member score
  if (scoreAwarded > 0 && userId) {
    db.updateMemberPoints(userId, scoreAwarded, coinsAwarded, earnedBadge);
    broadcast("team:updated", db.getTeam());
  }

  // Automatic Notification
  if (success) {
    const notif = db.addNotification({
      type: "mission_completed",
      title: `Misi ${levelId} Berhasil Diselesaikan!`,
      message: `${userName || "Tim"} berhasil menyelesaikan Misi Level ${levelId} (+${scoreAwarded} Poin, +${coinsAwarded} Loop Coins).`,
      levelId: Number(levelId),
      userName,
    });
    broadcast("notification:new", notif);

    if (earnedBadge) {
      const badgeNotif = db.addNotification({
        type: "badge_earned",
        title: `Lencana Baru Dibuka: ${earnedBadge}! 🏆`,
        message: `${userName || "Tim"} membuka lencana "${earnedBadge}" atas pencapaian di Level ${levelId}.`,
        levelId: Number(levelId),
        userName,
      });
      broadcast("notification:new", badgeNotif);
    }
  }

  res.status(201).json({ attempt, scoreAwarded, coinsAwarded, earnedBadge });
});

// Reflections (Experiential Learning)
app.get("/api/reflections", (req, res) => {
  const levelId = req.query.levelId ? Number(req.query.levelId) : undefined;
  res.json(db.getReflections(levelId));
});

app.post("/api/reflections", (req, res) => {
  const { levelId, userId, userName, answers } = req.body;
  if (!levelId || !answers) {
    res.status(400).json({ error: "Missing levelId or answers" });
    return;
  }

  const reflection = db.saveReflection({
    levelId: Number(levelId),
    userId: userId || "usr-1",
    userName: userName || "Siswa",
    answers: Array.isArray(answers) ? answers : [],
  });

  // +10 points for completing reflection (Blueprint Section 12)
  if (userId) {
    db.updateMemberPoints(userId, 10, 2);
    broadcast("team:updated", db.getTeam());
  }

  const notif = db.addNotification({
    type: "task_status",
    title: "Refleksi Terisi",
    message: `${userName || "Siswa"} telah melengkapi Refleksi Pembelajaran Level ${levelId} (+10 Poin).`,
    levelId: Number(levelId),
  });
  broadcast("notification:new", notif);

  res.status(201).json(reflection);
});

// Assessments (Pretest / Posttest - Section 17)
app.get("/api/assessments", (req, res) => {
  const userId = req.query.userId as string | undefined;
  res.json(db.getAssessments(userId));
});

app.post("/api/assessments", (req, res) => {
  const { type, userId, userName, score, totalQuestions, answers } = req.body;
  const assessment = db.saveAssessment({
    type: type === "posttest" ? "posttest" : "pretest",
    userId: userId || "usr-1",
    userName: userName || "Siswa",
    score: Number(score) || 0,
    totalQuestions: Number(totalQuestions) || 5,
    answers: Array.isArray(answers) ? answers : [],
  });

  const notif = db.addNotification({
    type: "task_status",
    title: `${type === "posttest" ? "Post-Test" : "Pre-Test"} Selesai`,
    message: `${userName || "Siswa"} menyelesaikan ${type} dengan skor ${score}/${totalQuestions}.`,
  });
  broadcast("notification:new", notif);

  res.status(201).json(assessment);
});

// Notifications
app.get("/api/notifications", (_req, res) => {
  res.json(db.getNotifications());
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const success = db.markNotificationAsRead(id);
  res.json({ success });
});

app.post("/api/notifications/clear", (_req, res) => {
  db.clearAllNotifications();
  broadcast("notification:cleared", {});
  res.json({ success: true });
});

// ==========================================
// CLASSROOM & TEAM MODE REST APIS
// ==========================================

// --- Multi-User Session Registration ---
app.post("/api/session/register", (req, res) => {
  try {
    const { id, name, avatar, role, classId, teamId } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "ID dan nama sesi wajib diisi!" });
    }

    let user = db.getUserById(id);
    if (!user) {
      const cleanUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
      user = db.createUser({
        id,
        name: name.trim(),
        username: `${cleanUsername}_${id.slice(-4)}`,
        role: role || "STUDENT",
        classId: classId || "class-8a",
        teamId: teamId || undefined,
        avatar: avatar || "🧑‍🎓",
        status: "ACTIVE",
      });
      broadcast("user:created", user);
    } else {
      user = db.updateUser(id, {
        name: name.trim(),
        avatar: avatar || user.avatar,
        ...(role ? { role } : {}),
      }) || user;
      broadcast("user:updated", user);
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Gagal mendaftarkan sesi pengguna." });
  }
});

// --- Auth & Login (Legacy / Optional) ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi!" });
  }

  const user = db.authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Username atau password salah! Silakan coba lagi." });
  }

  // Record audit log for login
  db.logAudit({
    userId: user.id,
    userName: user.name,
    action: "USER_LOGIN",
    details: `${user.name} (@${user.username}) berhasil login ke sistem sebagai ${user.role}.`,
  });

  res.json({ success: true, user });
});

// --- Users ---
app.get("/api/users", (_req, res) => {
  res.json(db.getUsers());
});

app.get("/api/users/:id", (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.post("/api/users", (req, res) => {
  try {
    const { name, username, password, role, classId, avatar, status } = req.body;
    if (!name || !username) {
      return res.status(400).json({ error: "Nama dan username wajib diisi!" });
    }
    const user = db.createUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: (password || "siswa123").trim(),
      role: role || "STUDENT",
      classId: classId || "class-8a",
      avatar: avatar || "🧑‍🎓",
      status: status || "ACTIVE",
    });
    broadcast("user:created", user);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Gagal membuat pengguna baru" });
  }
});

app.patch("/api/users/:id", (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "User not found" });
  broadcast("user:updated", updated);
  res.json(updated);
});

app.delete("/api/users/:id", (req, res) => {
  const ok = db.deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: "User not found" });
  broadcast("user:deleted", { id: req.params.id });
  res.json({ success: true });
});

// --- Classes ---
app.get("/api/classes", (_req, res) => {
  res.json(db.getClasses());
});

app.post("/api/classes", (req, res) => {
  const { name, code, academicYear, description } = req.body;
  const newClass = db.createClass({ name, code, academicYear, description: description || "" });
  res.status(201).json(newClass);
});

// --- Teams ---
app.get("/api/teams", (_req, res) => {
  res.json(db.getTeams());
});

app.get("/api/teams/:id", (req, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });
  const members = db.getTeamMembers(req.params.id);
  res.json({ ...team, members });
});

app.post("/api/teams", (req, res) => {
  const { teamName, classId, leaderId, createdBy } = req.body;
  if (!teamName || !leaderId) {
    return res.status(400).json({ error: "teamName and leaderId are required" });
  }
  const result = db.createTeam({
    teamName,
    classId: classId || "class-8a",
    leaderId,
    createdBy: createdBy || leaderId,
  });
  broadcast("team:created", result.team);
  res.status(201).json(result);
});

app.patch("/api/teams/:id", (req, res) => {
  const updated = db.updateTeam(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Team not found" });
  broadcast("team:updated", updated);
  res.json(updated);
});

app.delete("/api/teams/:id", (req, res) => {
  const ok = db.deleteTeam(req.params.id);
  if (!ok) return res.status(404).json({ error: "Team not found" });
  broadcast("team:deleted", { id: req.params.id });
  res.json({ success: true });
});

app.post("/api/teams/join", (req, res) => {
  const { code, userId } = req.body;
  if (!code || !userId) {
    return res.status(400).json({ error: "Kode tim dan userId wajib diisi" });
  }
  const team = db.getTeamByCode(code);
  if (!team) {
    return res.status(404).json({ error: "Kode tim tidak valid atau tim tidak ditemukan" });
  }

  const result = db.addTeamMember(team.id, userId, "MEMBER");
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const fullTeam = { ...team, members: db.getTeamMembers(team.id) };
  broadcast("team:member_joined", { teamId: team.id, member: result.member });
  res.json({ success: true, team: fullTeam, member: result.member });
});

app.get("/api/teams/:id/members", (req, res) => {
  res.json(db.getTeamMembers(req.params.id));
});

app.post("/api/teams/:id/members", (req, res) => {
  const { userId, role } = req.body;
  const result = db.addTeamMember(req.params.id, userId, role || "MEMBER");
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  broadcast("team:member_joined", { teamId: req.params.id, member: result.member });
  res.status(201).json(result);
});

app.delete("/api/teams/:id/members/:userId", (req, res) => {
  const ok = db.removeTeamMember(req.params.id, req.params.userId);
  if (!ok) return res.status(404).json({ error: "Member or team not found" });
  broadcast("team:member_left", { teamId: req.params.id, userId: req.params.userId });
  res.json({ success: true });
});

app.post("/api/teams/:id/regenerate-code", (req, res) => {
  const newCode = db.regenerateTeamCode(req.params.id);
  if (!newCode) return res.status(404).json({ error: "Team not found" });
  broadcast("team:code_regenerated", { teamId: req.params.id, newCode });
  res.json({ success: true, newCode });
});

app.get("/api/teams/:id/activities", (req, res) => {
  res.json(db.getTeamActivities(req.params.id));
});

// --- Assignments ---
app.get("/api/assignments", (_req, res) => {
  res.json(db.getAssignments());
});

app.get("/api/assignments/:id", (req, res) => {
  const asg = db.getAssignmentById(req.params.id);
  if (!asg) return res.status(404).json({ error: "Assignment not found" });
  res.json(asg);
});

app.post("/api/assignments", (req, res) => {
  const { title, description, classId, mode, levelIds, targetLevels, quizId, reflectionId, reflectionTemplateId, testId, deadline, dueDate, createdBy } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const levels = targetLevels || levelIds || [1, 2, 3];
  const asg = db.createAssignment({
    title,
    description: description || "",
    classId: classId || "class-8a",
    mode: mode || "TEAM",
    targetLevels: levels,
    levelIds: levels,
    quizId: quizId || "quiz-loop-01",
    reflectionId: reflectionId || reflectionTemplateId || "refl-01",
    reflectionTemplateId: reflectionTemplateId || reflectionId || "refl-01",
    testId: testId || "test-mid-loop",
    dueDate: dueDate || deadline || "2026-10-30",
    deadline: deadline || dueDate || "2026-10-30",
    createdBy: createdBy || "teacher01",
    status: "ACTIVE",
  });
  broadcast("assignment:created", asg);
  res.status(201).json(asg);
});

app.patch("/api/assignments/:id", (req, res) => {
  const updated = db.updateAssignment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Assignment not found" });
  broadcast("assignment:updated", updated);
  res.json(updated);
});

app.delete("/api/assignments/:id", (req, res) => {
  const ok = db.deleteAssignment(req.params.id);
  if (!ok) return res.status(404).json({ error: "Assignment not found" });
  broadcast("assignment:deleted", { id: req.params.id });
  res.json({ success: true });
});

app.get("/api/assignments/:id/progress", (req, res) => {
  const teamId = req.query.teamId as string | undefined;
  const userId = req.query.userId as string | undefined;
  const prog = db.getAssignmentProgress(req.params.id, teamId, userId);
  res.json(prog || null);
});

app.post("/api/assignments/:id/progress/level", (req, res) => {
  const { levelId, teamId, userId, userName } = req.body;
  if (levelId === undefined) return res.status(400).json({ error: "levelId is required" });
  const prog = db.recordGameLevelCompletion({
    assignmentId: req.params.id,
    levelId: Number(levelId),
    teamId,
    userId,
    userName,
  });
  broadcast("progress:updated", prog);
  res.json(prog);
});

app.get("/api/progress", (_req, res) => {
  res.json(db.getAllAssignmentProgress());
});

// --- Quizzes ---
app.get("/api/quizzes", (_req, res) => {
  res.json(db.getQuizzes());
});

app.get("/api/quizzes/:id", (req, res) => {
  const quiz = db.getQuizById(req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json(quiz);
});

app.get("/api/quizzes/:id/questions", (req, res) => {
  const sanitize = req.query.sanitize !== "false";
  res.json(db.getQuizQuestions(req.params.id, sanitize));
});

app.post(["/api/quizzes/:id/submit", "/api/quizzes/:id/attempt"], (req, res) => {
  const { userId, userName, teamId, assignmentId, answers } = req.body;
  if (!userId || !answers) {
    return res.status(400).json({ error: "userId and answers are required" });
  }
  const result = db.submitQuizAttempt({
    quizId: req.params.id,
    userId,
    userName,
    teamId,
    assignmentId,
    answers,
  });
  broadcast("quiz:submitted", result.attempt);
  if (result.progress) {
    broadcast("progress:updated", result.progress);
  }
  res.json(result);
});

app.get("/api/quizzes/:id/attempts", (req, res) => {
  const userId = req.query.userId as string | undefined;
  const teamId = req.query.teamId as string | undefined;
  res.json(db.getQuizAttempts(req.params.id, userId, teamId));
});

// --- Reflections ---
app.get("/api/reflections", (_req, res) => {
  res.json(db.getReflectionTemplates());
});

app.get("/api/reflections/:id", (req, res) => {
  const r = db.getReflectionTemplateById(req.params.id);
  if (!r) return res.status(404).json({ error: "Reflection template not found" });
  res.json(r);
});

app.post("/api/reflections/:id/submit", (req, res) => {
  const { userId, userName, teamId, assignmentId, answers } = req.body;
  if (!userId || !answers) {
    return res.status(400).json({ error: "userId and answers are required" });
  }
  const result = db.submitReflectionResponse({
    reflectionId: req.params.id,
    userId,
    userName: userName || "Siswa",
    teamId,
    assignmentId,
    answers,
  });
  broadcast("reflection:submitted", result.submission);
  if (result.progress) {
    broadcast("progress:updated", result.progress);
  }
  res.json(result);
});

app.get("/api/reflections/:id/submissions", (req, res) => {
  res.json(db.getReflectionSubmissions(req.params.id));
});

// --- Tests ---
app.get("/api/tests", (_req, res) => {
  res.json(db.getTests());
});

app.get("/api/tests/:id", (req, res) => {
  const t = db.getTestById(req.params.id);
  if (!t) return res.status(404).json({ error: "Test not found" });
  res.json(t);
});

app.get("/api/tests/:id/questions", (req, res) => {
  const sanitize = req.query.sanitize !== "false";
  res.json(db.getTestQuestions(req.params.id, sanitize));
});

app.post(["/api/tests/:id/submit", "/api/tests/:id/attempt"], (req, res) => {
  try {
    const { userId, userName, teamId, assignmentId, answers } = req.body;
    if (!userId || !answers) {
      return res.status(400).json({ error: "userId and answers are required" });
    }
    const result = db.submitTestAttempt({
      testId: req.params.id,
      userId,
      userName,
      teamId,
      assignmentId,
      answers,
    });
    broadcast("test:submitted", result.attempt);
    if (result.progress) {
      broadcast("progress:updated", result.progress);
    }
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to submit test" });
  }
});

app.get("/api/tests/:id/attempts", (req, res) => {
  const userId = req.query.userId as string | undefined;
  res.json(db.getTestAttempts(req.params.id, userId));
});

// --- Settings & Audit ---
app.get("/api/settings", (_req, res) => {
  res.json(db.getSettings());
});

app.patch("/api/settings", (req, res) => {
  const updated = db.updateSettings(req.body);
  broadcast("settings:updated", updated);
  res.json(updated);
});

app.get("/api/audit-logs", (_req, res) => {
  res.json(db.getAuditLogs());
});

// Reset DB (for quick demo restore)
app.post("/api/reset-db", (_req, res) => {
  db.resetDatabase();
  broadcast("init", {
    tasks: db.getTasks(),
    team: db.getTeam(),
    notifications: db.getNotifications(),
  });
  res.json({ success: true, message: "Database reset to initial blueprint state" });
});

// --- Vite Middleware Integration ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[LOOPIA Server] Running at http://localhost:${PORT}`);
    console.log(`[LOOPIA WebSocket] Active on ws://localhost:${PORT}/ws`);
  });
}

start();
