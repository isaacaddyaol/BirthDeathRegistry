import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBirthRegistrationSchema, insertDeathRegistrationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { birthRegistrations, deathRegistrations } from "@shared/schema";
import type { DashboardStats } from "@shared/schema";
import { getUserFromSession } from "./utils";
import { OAuth2Client } from "google-auth-library";
import { format } from "date-fns";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.warn("Warning: GOOGLE_CLIENT_ID environment variable is not set");
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Google Auth route
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { access_token } = req.body;

      // Get user info from Google
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get user info from Google');
      }

      const data = await response.json();
      
      // Check if user exists
      let user = await storage.getUserByEmail(data.email);
      
      if (!user) {
        // Create new user
        user = await storage.upsertUser({
          id: data.sub, // Google's user ID
          email: data.email,
          password: "", // No password for Google users
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
          role: "public", // Default role for new users
        });
      }

      // Set session
      if (req.session) {
        (req.session as any).userId = user.id;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // With Passport.js, the user object is directly available on req.user
      const user = req.user;
      
      // Remove sensitive information
      const safeUser = { ...user, password: undefined };
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Birth registration routes
  app.post('/api/birth-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['health_worker', 'public', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to submit birth registrations" });
      }

      const validatedData = insertBirthRegistrationSchema.parse(req.body);
      const registration = await storage.createBirthRegistration(validatedData, userId);
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error creating birth registration:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create birth registration" });
    }
  });

  app.get('/api/birth-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let registrations;
      if (user.role === 'admin' || user.role === 'registrar') {
        registrations = await storage.getPendingBirthRegistrations();
      } else {
        registrations = await storage.getBirthRegistrationsByUser(userId);
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching birth registrations:", error);
      res.status(500).json({ message: "Failed to fetch birth registrations" });
    }
  });

  app.put('/api/birth-registrations/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['registrar', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to update registration status" });
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateBirthRegistrationStatus(
        parseInt(id), 
        status, 
        userId, 
        rejectionReason
      );
      
      res.json({ message: "Registration status updated successfully" });
    } catch (error) {
      console.error("Error updating birth registration status:", error);
      res.status(500).json({ message: "Failed to update registration status" });
    }
  });

  // Death registration routes
  app.post('/api/death-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['health_worker', 'public', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to submit death registrations" });
      }

      const validatedData = insertDeathRegistrationSchema.parse(req.body);
      const registration = await storage.createDeathRegistration(validatedData, userId);
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Error creating death registration:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create death registration" });
    }
  });

  app.get('/api/death-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let registrations;
      if (user.role === 'admin' || user.role === 'registrar') {
        registrations = await storage.getPendingDeathRegistrations();
      } else {
        registrations = await storage.getDeathRegistrationsByUser(userId);
      }
      
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching death registrations:", error);
      res.status(500).json({ message: "Failed to fetch death registrations" });
    }
  });

  app.put('/api/death-registrations/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['registrar', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to update registration status" });
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateDeathRegistrationStatus(
        parseInt(id), 
        status, 
        userId, 
        rejectionReason
      );
      
      res.json({ message: "Registration status updated successfully" });
    } catch (error) {
      console.error("Error updating death registration status:", error);
      res.status(500).json({ message: "Failed to update registration status" });
    }
  });

  // Certificate verification routes
  app.get('/api/verify/:certificateId', async (req, res) => {
    try {
      const { certificateId } = req.params;
      
      // Check birth certificates
      const birthCert = await storage.getBirthRegistrationByCertificateId(certificateId);
      if (birthCert && birthCert.status === 'approved') {
        return res.json({
          valid: true,
          type: 'birth',
          certificateId: birthCert.certificateId,
          fullName: `${birthCert.childFirstName} ${birthCert.childLastName}`,
          issueDate: birthCert.approvedAt,
          registrationOffice: 'Ghana Births and Deaths Registry',
        });
      }
      
      // Check death certificates
      const deathCert = await storage.getDeathRegistrationByCertificateId(certificateId);
      if (deathCert && deathCert.status === 'approved') {
        return res.json({
          valid: true,
          type: 'death',
          certificateId: deathCert.certificateId,
          fullName: deathCert.deceasedName,
          issueDate: deathCert.approvedAt,
          registrationOffice: 'Ghana Births and Deaths Registry',
        });
      }
      
      res.json({ valid: false, message: 'Certificate not found or not approved' });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ message: "Failed to verify certificate" });
    }
  });

  // Statistics route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is authenticated and has appropriate role
      const user = await getUserFromSession(req);
      if (!user || !['registrar', 'admin'].includes(user.role)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get current date and various time points
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      // Get pending applications
      const pendingBirthCount = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(eq(birthRegistrations.status, 'pending'));

      const pendingDeathCount = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations)
        .where(eq(deathRegistrations.status, 'pending'));

      // Get registrations by status
      const birthsByStatus = await db.select({
        status: birthRegistrations.status,
        count: sql<number>`count(*)`
      })
      .from(birthRegistrations)
      .groupBy(birthRegistrations.status);

      const deathsByStatus = await db.select({
        status: deathRegistrations.status,
        count: sql<number>`count(*)`
      })
      .from(deathRegistrations)
      .groupBy(deathRegistrations.status);

      // Calculate total by status
      const statusCounts = {
        approved: 0,
        pending: 0,
        rejected: 0
      };
      
      birthsByStatus.forEach(({ status, count }) => {
        statusCounts[status as keyof typeof statusCounts] += Number(count);
      });
      
      deathsByStatus.forEach(({ status, count }) => {
        statusCounts[status as keyof typeof statusCounts] += Number(count);
      });

      // Get timeline stats
      const todayBirths = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(sql`${birthRegistrations.createdAt} >= ${today}`);

      const todayDeaths = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations)
        .where(sql`${deathRegistrations.createdAt} >= ${today}`);

      const weekBirths = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(sql`${birthRegistrations.createdAt} >= ${startOfWeek}`);

      const weekDeaths = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations)
        .where(sql`${deathRegistrations.createdAt} >= ${startOfWeek}`);

      const monthBirths = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(sql`${birthRegistrations.createdAt} >= ${firstDayOfMonth}`);

      const monthDeaths = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations)
        .where(sql`${deathRegistrations.createdAt} >= ${firstDayOfMonth}`);

      // Calculate processing times
      const approvalTimes = await db.select({
        approvalTime: sql<number>`
          EXTRACT(EPOCH FROM (${birthRegistrations.approvedAt} - ${birthRegistrations.createdAt})) / 3600
        `
      })
      .from(birthRegistrations)
      .where(
        and(
          eq(birthRegistrations.status, 'approved'),
          sql`${birthRegistrations.approvedAt} IS NOT NULL`
        )
      );

      const deathApprovalTimes = await db.select({
        approvalTime: sql<number>`
          EXTRACT(EPOCH FROM (${deathRegistrations.approvedAt} - ${deathRegistrations.createdAt})) / 3600
        `
      })
      .from(deathRegistrations)
      .where(
        and(
          eq(deathRegistrations.status, 'approved'),
          sql`${deathRegistrations.approvedAt} IS NOT NULL`
        )
      );

      // Combine all approval times
      const allApprovalTimes = [
        ...approvalTimes.map(t => t.approvalTime),
        ...deathApprovalTimes.map(t => t.approvalTime)
      ].filter(time => time !== null && !isNaN(time));

      const averageApprovalTime = allApprovalTimes.length > 0
        ? Math.round(allApprovalTimes.reduce((a, b) => a + b, 0) / allApprovalTimes.length)
        : 0;

      const fastestApproval = allApprovalTimes.length > 0
        ? Math.round(Math.min(...allApprovalTimes))
        : 0;

      // Get approved applications this month and calculate growth
      const approvedThisMonth = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(
          and(
            eq(birthRegistrations.status, 'approved'),
            sql`${birthRegistrations.updatedAt} >= ${firstDayOfMonth}`
          )
        );

      const approvedLastMonth = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(
          and(
            eq(birthRegistrations.status, 'approved'),
            sql`${birthRegistrations.updatedAt} >= ${firstDayOfLastMonth}`,
            sql`${birthRegistrations.updatedAt} < ${firstDayOfMonth}`
          )
        );

      // Calculate monthly growth
      const currentMonthCount = approvedThisMonth[0]?.count || 0;
      const lastMonthCount = approvedLastMonth[0]?.count || 1; // Avoid division by zero
      const growthRate = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;

      // Get total registrations
      const totalBirthCount = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations);

      const totalDeathCount = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations);

      // Get recent activity (last 30 days)
      const recentBirths = await db.select({ count: sql<number>`count(*)` })
        .from(birthRegistrations)
        .where(sql`${birthRegistrations.createdAt} >= ${thirtyDaysAgo}`);

      const recentDeaths = await db.select({ count: sql<number>`count(*)` })
        .from(deathRegistrations)
        .where(sql`${deathRegistrations.createdAt} >= ${thirtyDaysAgo}`);

      // Get registration trends (last 7 days)
      const trendDays = 7;
      const trendLabels: string[] = [];
      const trendBirths: number[] = [];
      const trendDeaths: number[] = [];

      for (let i = 0; i < trendDays; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (trendDays - 1 - i));
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        trendLabels.push(format(date, 'MMM d'));

        const dayBirths = await db.select({ count: sql<number>`count(*)` })
          .from(birthRegistrations)
          .where(sql`${birthRegistrations.createdAt} >= ${startOfDay} AND ${birthRegistrations.createdAt} < ${endOfDay}`);

        const dayDeaths = await db.select({ count: sql<number>`count(*)` })
          .from(deathRegistrations)
          .where(sql`${deathRegistrations.createdAt} >= ${startOfDay} AND ${deathRegistrations.createdAt} < ${endOfDay}`);

        trendBirths.push(Number(dayBirths[0]?.count || 0));
        trendDeaths.push(Number(dayDeaths[0]?.count || 0));
      }

      // Get recent registrations
      const recentBirthRegistrations = await db.select({
        id: birthRegistrations.applicationId,
        type: sql<'birth'>`'birth'`,
        name: sql<string>`CAST(${birthRegistrations.childFirstName} || ' ' || ${birthRegistrations.childLastName} AS TEXT)`,
        date: birthRegistrations.createdAt,
        status: birthRegistrations.status,
        location: birthRegistrations.birthPlace,
      })
      .from(birthRegistrations)
      .orderBy(desc(birthRegistrations.createdAt))
      .limit(5);

      const recentDeathRegistrations = await db.select({
        id: deathRegistrations.applicationId,
        type: sql<'death'>`'death'`,
        name: deathRegistrations.deceasedName,
        date: deathRegistrations.createdAt,
        status: deathRegistrations.status,
        location: deathRegistrations.deathPlace,
      })
      .from(deathRegistrations)
      .orderBy(desc(deathRegistrations.createdAt))
      .limit(5);

      const recentRegistrations = [...recentBirthRegistrations, ...recentDeathRegistrations]
        .sort((a, b) => {
          const dateA = a.date?.getTime() || 0;
          const dateB = b.date?.getTime() || 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(reg => ({
          id: reg.id,
          type: reg.type,
          name: String(reg.name),
          date: reg.date?.toISOString() || new Date().toISOString(),
          status: reg.status,
          location: reg.location,
        }));

      // Get regional distribution
      const regions = [
        'Greater Accra',
        'Ashanti',
        'Western',
        'Eastern',
        'Central',
        'Northern',
        'Volta',
        'Bono',
        'Upper East',
        'Upper West'
      ];

      const regionalData = await Promise.all(
        regions.map(async (region) => {
          const births = await db.select({ count: sql<number>`count(*)` })
            .from(birthRegistrations)
            .where(sql`${birthRegistrations.birthPlace} ILIKE ${`%${region}%`}`);

          const deaths = await db.select({ count: sql<number>`count(*)` })
            .from(deathRegistrations)
            .where(sql`${deathRegistrations.deathPlace} ILIKE ${`%${region}%`}`);

          return {
            region,
            births: Number(births[0]?.count || 0),
            deaths: Number(deaths[0]?.count || 0),
          };
        })
      );

      const stats: DashboardStats = {
        pendingBirth: pendingBirthCount[0]?.count || 0,
        pendingDeath: pendingDeathCount[0]?.count || 0,
        approvedThisMonth: currentMonthCount,
        totalRegistrations: (totalBirthCount[0]?.count || 0) + (totalDeathCount[0]?.count || 0),
        recentActivity: {
          births: recentBirths[0]?.count || 0,
          deaths: recentDeaths[0]?.count || 0
        },
        monthlyGrowth: Math.round(growthRate * 10) / 10,
        registrationsByStatus: statusCounts,
        timelineStats: {
          today: {
            births: todayBirths[0]?.count || 0,
            deaths: todayDeaths[0]?.count || 0
          },
          thisWeek: {
            births: weekBirths[0]?.count || 0,
            deaths: weekDeaths[0]?.count || 0
          },
          thisMonth: {
            births: monthBirths[0]?.count || 0,
            deaths: monthDeaths[0]?.count || 0
          }
        },
        processingTimes: {
          averageApprovalTime,
          fastestApproval
        },
        registrationTrends: {
          labels: trendLabels,
          births: trendBirths,
          deaths: trendDeaths,
        },
        recentRegistrations,
        regionalData,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User role update route (admin only)
  app.put('/api/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.id;
      const admin = await storage.getUser(adminUserId);
      
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions to update user roles" });
      }

      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['public', 'health_worker', 'registrar', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.upsertUser({
        ...user,
        role,
        updatedAt: new Date(),
      });
      
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
