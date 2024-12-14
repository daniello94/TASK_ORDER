const express = require('express');
const router = express.Router();
const companyController = require("../controller/company.controller");
const isRole = require("../middleware/authMiddleware");
const authenticate = require("../middleware/authenticate");

//dodanie nowej firmy do serwisu
router.post("/newCompany", authenticate, isRole(["Admin", "BigBoss"]), companyController.createCompany);

//Aktualizacja firmy
router.put("/update/:companyId", authenticate, isRole(["BigBoss"]), companyController.updateCompany);

// usuniecie firmy wraz z wszytkimi projektami pracownikami itd 
router.delete("/deleteCompany/:companyId", authenticate, isRole(["BigBoss"]), companyController.deleteCompany);

//wyswietlanie listy pracowników danej firmy
router.get("/employeeList/:companyId", authenticate, isRole(["BigBoss"]), companyController.getCompanyEmployees);

//wyswietlanie projektów danej firmy 
router.get("/project-list/:companyId", authenticate, isRole(["BigBoss"]), companyController.getCompanyWithProjects);

//wyswietlanie wszytkich firm
router.get("/all-company-list", authenticate, isRole(["Admin"]), companyController.getAllCompanies);

//Zmana statusa na banowanie odbanowywanie firmy 
router.patch("/company-toggle-status/:companyId", authenticate, isRole(["Admin"]), companyController.toggleCompanyStatus);

module.exports = router
