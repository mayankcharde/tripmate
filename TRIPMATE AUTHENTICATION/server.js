import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGODB_URI and JWT_SECRET must be set in the environment.");
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function setAuthCookie(response, user) {
  response.cookie("tripmate_token", signToken(user), {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

async function requireAuth(request, response, next) {
  const token = request.cookies.tripmate_token;
  if (!token)
    return response
      .status(401)
      .json({ success: false, error: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user)
      return response
        .status(401)
        .json({ success: false, error: "Session is no longer valid." });
    request.user = user;
    return next();
  } catch {
    return response
      .status(401)
      .json({ success: false, error: "Authentication required." });
  }
}

app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.post("/api/auth/register", async (request, response) => {
  try {
    const name = String(request.body.name || "").trim();
    const email = String(request.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(request.body.password || "");

    if (name.length < 2)
      return response
        .status(400)
        .json({ success: false, error: "Enter your name." });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return response
        .status(400)
        .json({ success: false, error: "Enter a valid email address." });
    if (password.length < 8)
      return response
        .status(400)
        .json({
          success: false,
          error: "Password must be at least 8 characters.",
        });
    if (await User.exists({ email }))
      return response
        .status(409)
        .json({
          success: false,
          error: "An account with that email already exists.",
        });

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });
    setAuthCookie(response, user);
    return response.status(201).json({ success: true, user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000)
      return response
        .status(409)
        .json({
          success: false,
          error: "An account with that email already exists.",
        });
    console.error(error);
    return response
      .status(500)
      .json({ success: false, error: "Could not create your account." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    const email = String(request.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(request.body.password || "");
    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordMatches =
      user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordMatches)
      return response
        .status(401)
        .json({ success: false, error: "Email or password is incorrect." });
    setAuthCookie(response, user);
    return response.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ success: false, error: "Could not sign you in." });
  }
});

app.get("/api/auth/me", requireAuth, (request, response) => {
  response.json({ success: true, user: publicUser(request.user) });
});

app.post("/api/auth/logout", (request, response) => {
  response.clearCookie("tripmate_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  response.json({ success: true });
});

app.get("/health", (request, response) =>
  response.json({ status: "ok", service: "tripmate-authentication" }),
);

await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () =>
  console.log(`TripMate authentication API listening on port ${port}`),
);
