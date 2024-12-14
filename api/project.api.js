const express = require('express');
const router = express.Router();
const projectController = require("../controller/controller.project");
router.use(express.json());
const isRole = require("../middleware/authMiddleware");
const authenticate = require("../middleware/authenticate");

//dodanie nowego projektu
router.post("/new-project", authenticate, isRole("BigBoss"), projectController.addProject);

// dodanie pracownika do projektu
router.post("/add-employee", authenticate, isRole(["BigBoss", "Boss"]), projectController.addEmployeeToProject);

//dodanie team meager oraz boss do projektu
router.post("/add-manager", authenticate, isRole("BigBoss", "Boss"), projectController.addManagerToProject);

// Usuniecie projektu
router.delete("/delete/:projectId", authenticate, isRole(["BigBoss"]), projectController.deleteProject);

module.exports = router;
