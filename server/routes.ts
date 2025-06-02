import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBirthRegistrationSchema, insertDeathRegistrationSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Birth registration routes
  app.post('/api/birth-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['registrar', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to view statistics" });
      }

      const stats = await storage.getRegistrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // User role update route (admin only)
  app.put('/api/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
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
