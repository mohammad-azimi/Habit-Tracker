import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function normalizeUserId(username) {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeAvatarUrl(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function buildSafeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
  };
}

function buildAccessToken(user) {
  return signAccessToken({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
  });
}

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const avatarUrl = normalizeAvatarUrl(req.body.avatarUrl);

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email, and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const userId = normalizeUserId(username);

    if (!userId) {
      return res.status(400).json({ error: "Username is not valid" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username }, { email }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this username or email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        passwordHash,
        avatarUrl,
      },
    });

    const token = buildAccessToken(user);

    return res.status(201).json({
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const identifier = String(req.body.identifier || "").trim();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "identifier and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier.toLowerCase() },
          { id: identifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = buildAccessToken(user);

    return res.json({
      token,
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: buildSafeUser(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: "Failed to load current user" });
  }
});

router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const username =
      req.body.username !== undefined
        ? String(req.body.username || "").trim()
        : currentUser.username;

    const email =
      req.body.email !== undefined
        ? normalizeEmail(req.body.email)
        : currentUser.email;

    const avatarUrl =
      req.body.avatarUrl !== undefined
        ? normalizeAvatarUrl(req.body.avatarUrl)
        : currentUser.avatarUrl;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (username.length < 2) {
      return res
        .status(400)
        .json({ error: "Username must be at least 2 characters" });
    }

    if (username.length > 40) {
      return res
        .status(400)
        .json({ error: "Username must be 40 characters or less" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    const duplicateUser = await prisma.user.findFirst({
      where: {
        id: { not: req.user.id },
        OR: [{ username }, { email }],
      },
    });

    if (duplicateUser) {
      if (duplicateUser.username === username) {
        return res.status(409).json({ error: "Username is already taken" });
      }

      if (duplicateUser.email === email) {
        return res.status(409).json({ error: "Email is already taken" });
      }

      return res
        .status(409)
        .json({ error: "Username or email is already taken" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email,
        avatarUrl,
      },
    });

    const token = buildAccessToken(updatedUser);

    return res.json({
      message: "Profile updated successfully",
      token,
      user: buildSafeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: "New password must be different from current password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      error: "Failed to change password",
    });
  }
});

router.delete("/delete-account", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.$transaction([
      prisma.dashboardMonth.deleteMany({
        where: { userId },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      error: "Failed to delete account",
    });
  }
});

export default router;
