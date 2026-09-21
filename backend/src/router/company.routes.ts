import { Router } from "express";
import {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
  createCompanyMember,
  listCompanyMembers,
  updateCompanyMember,
  deleteCompanyMember,
} from "../controller/company.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Apply Authentication Guard to all endpoints
router.use(protect);
// Restrict to superadmin only
router.use(authorize("superadmin"));

// -- Companies --
router.post("/companies", createCompany);
router.get("/companies", listCompanies);
router.patch("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

// -- Company Members (Admins) --
router.post("/company-members", createCompanyMember);
router.get("/company-members", listCompanyMembers);
router.patch("/company-members/:id", updateCompanyMember);
router.delete("/company-members/:id", deleteCompanyMember);

export default router;
