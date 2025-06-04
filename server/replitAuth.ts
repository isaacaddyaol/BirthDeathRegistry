import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword } from "./utils";
import { config } from "./config";

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

export function getSession() {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conObject: {
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false }
    },
    createTableIfMissing: false,
    ttl: config.session.cookieMaxAge,
    tableName: "sessions",
  });
  return session({
    secret: config.session.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: config.session.cookieMaxAge,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialize the entire user object
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize by fetching user from database
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate('local'), async (req, res) => {
    const user = req.user;
    // Remove sensitive information
    const safeUser = { ...user, password: undefined };
    res.json({ message: "Logged in successfully", user: safeUser });
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const userId = `user_${Date.now()}`;
      const user = await storage.upsertUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'public', // Default role
      });

      // Log in the user automatically
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login error:', err);
          return res.status(500).json({ message: "Error during auto-login" });
        }
        // Remove sensitive information
        const safeUser = { ...user, password: undefined };
        res.json({ message: "User registered successfully", user: safeUser });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Error registering user" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
