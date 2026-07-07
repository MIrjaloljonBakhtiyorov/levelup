import express from "express";
import cors from "cors";
import helmet from "helmet";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const app = express();
const ADMIN_LOGIN = "mister_italiano";
const ADMIN_PASSWORD = "mister_italiano";
const ADMIN_TOKEN = "mister_italiano_admin_session";
const dataDirectory = path.resolve(process.cwd(), "data");
const usersFilePath = path.join(dataDirectory, "users.json");

type UserStatus = "active" | "temporary_blocked" | "blocked";

type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  status: UserStatus;
  blockedUntil?: string;
};

type PublicUser = Omit<StoredUser, "passwordHash">;

const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  middleName: z.string().trim().optional().default(""),
  phoneNumber: z.string().trim().min(5),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const adminLoginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

const userLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const statusSchema = z.object({
  status: z.enum(["active", "temporary_blocked", "blocked"]),
  blockedUntil: z.string().datetime().optional(),
});

function ensureDataFile() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, "[]", "utf8");
  }
}

function readUsers(): StoredUser[] {
  ensureDataFile();

  const rawUsers = fs.readFileSync(usersFilePath, "utf8");
  return JSON.parse(rawUsers) as StoredUser[];
}

function writeUsers(users: StoredUser[]) {
  ensureDataFile();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const expectedHash = Buffer.from(hash, "hex");
  const actualHash = scryptSync(password, salt, 64);

  return (
    expectedHash.length === actualHash.length &&
    timingSafeEqual(expectedHash, actualHash)
  );
}

function createUserToken(userId: string) {
  return `levelup_user_${userId}`;
}

function toPublicUser(user: StoredUser): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function isTemporaryBlockExpired(user: StoredUser) {
  return (
    user.status === "temporary_blocked" &&
    Boolean(user.blockedUntil) &&
    new Date(user.blockedUntil as string).getTime() <= Date.now()
  );
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token !== ADMIN_TOKEN) {
    res.status(401).json({
      success: false,
      message: "Admin sifatida kirish talab qilinadi",
    });
    return;
  }

  next();
}

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend muvaffaqiyatli ishlayapti",
  });
});

app.post("/api/auth/login", (req, res) => {
  const result = adminLoginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Login va parolni to‘g‘ri kiriting",
    });
    return;
  }

  if (
    result.data.login !== ADMIN_LOGIN ||
    result.data.password !== ADMIN_PASSWORD
  ) {
    res.status(401).json({
      success: false,
      message: "Login yoki parol noto‘g‘ri",
    });
    return;
  }

  res.status(200).json({
    success: true,
    token: ADMIN_TOKEN,
    user: {
      login: ADMIN_LOGIN,
      role: "admin",
    },
  });
});

app.post("/api/auth/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Ro‘yxatdan o‘tish ma’lumotlarini to‘liq kiriting",
    });
    return;
  }

  const users = readUsers();
  const normalizedEmail = result.data.email.toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    res.status(409).json({
      success: false,
      message: "Bu email bilan foydalanuvchi ro‘yxatdan o‘tgan",
    });
    return;
  }

  const newUser: StoredUser = {
    id: randomUUID(),
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    middleName: result.data.middleName,
    phoneNumber: result.data.phoneNumber,
    email: normalizedEmail,
    passwordHash: createPasswordHash(result.data.password),
    createdAt: new Date().toISOString(),
    status: "active",
  };

  users.unshift(newUser);
  writeUsers(users);

  res.status(201).json({
    success: true,
    token: createUserToken(newUser.id),
    user: toPublicUser(newUser),
  });
});

app.post("/api/auth/user-login", (req, res) => {
  const result = userLoginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Email va parolni to‘g‘ri kiriting",
    });
    return;
  }

  const users = readUsers();
  const userIndex = users.findIndex(
    (storedUser) =>
      storedUser.email.toLowerCase() === result.data.email.toLowerCase(),
  );
  const user = users[userIndex];

  if (!user?.passwordHash || !verifyPassword(result.data.password, user.passwordHash)) {
    res.status(401).json({
      success: false,
      message: "Email yoki parol noto‘g‘ri",
    });
    return;
  }

  if (isTemporaryBlockExpired(user)) {
    users[userIndex] = {
      ...user,
      blockedUntil: undefined,
      status: "active",
    };
    writeUsers(users);
  } else if (user.status === "temporary_blocked") {
    res.status(403).json({
      success: false,
      message: `Profilingiz ${new Date(user.blockedUntil as string).toLocaleString("uz-UZ")} gacha vaqtincha bloklangan`,
    });
    return;
  } else if (user.status === "blocked") {
    res.status(403).json({
      success: false,
      message: "Profilingiz butunlay bloklangan",
    });
    return;
  }

  res.status(200).json({
    success: true,
    token: createUserToken(users[userIndex].id),
    user: toPublicUser(users[userIndex]),
  });
});

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  res.status(200).json({
    success: true,
    users: readUsers().map(toPublicUser),
  });
});

app.patch("/api/admin/users/:id/status", requireAdmin, (req, res) => {
  const result = statusSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Status active, temporary_blocked yoki blocked bo‘lishi kerak",
    });
    return;
  }

  const users = readUsers();
  const userIndex = users.findIndex((user) => user.id === req.params.id);

  if (userIndex === -1) {
    res.status(404).json({
      success: false,
      message: "Foydalanuvchi topilmadi",
    });
    return;
  }

  users[userIndex] = {
    ...users[userIndex],
    blockedUntil:
      result.data.status === "temporary_blocked"
        ? result.data.blockedUntil
        : undefined,
    status: result.data.status,
  };
  writeUsers(users);

  res.status(200).json({
    success: true,
    user: toPublicUser(users[userIndex]),
  });
});

export default app;
