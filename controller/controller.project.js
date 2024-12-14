const mongoose = require("mongoose");
const Project = require('../models/Project');
const User = require('../models/Users');
const Company = require("../models/Company");

exports.addProject = async (req, res) => {
    try {
        const { nameProject, address, mainBigBoss } = req.body;

        const bigBoss = await User.findById(mainBigBoss);

        if (!bigBoss) {
            return res.status(404).json({ message: 'Big Boss nie został znaleziony' });
        }

        if (!bigBoss.idCompany) {
            return res.status(400).json({ message: 'Big Boss nie ma przypisanego idCompany, nie można utworzyć projektu' });
        }

        const existingProject = await Project.findOne({ nameProject });
        if (existingProject) {
            return res.status(400).json({ message: 'Projekt o podanej nazwie już istnieje' });
        }

        const newProject = new Project({
            idCompany: bigBoss.idCompany,
            nameProject,
            address,
            mainBigBoss,
        });

        await newProject.save();

        const company = await Company.findById(bigBoss.idCompany);
        if (!company) {
            return res.status(404).json({ message: 'Firma nie została znaleziona, nie można dodać projektu do listy projektów' });
        }

        company.projects.push(newProject._id);
        await company.save();

        res.status(201).json({ message: 'Projekt został pomyślnie utworzony i dodany do listy projektów firmy', project: newProject });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas tworzenia projektu', error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Nieprawidłowe ID projektu' });
        }
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nie został znaleziony' });
        }

        await Project.findByIdAndDelete(projectId);
        const company = await Company.findById(project.idCompany);
        if (company) {
            company.projects = company.projects.filter(projId => projId.toString() !== projectId);
            await company.save();
        }

        res.status(200).json({ message: 'Projekt został pomyślnie usunięty oraz usunięty z listy projektów firmy' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas usuwania projektu', error: error.message });
    }
};

exports.addEmployeeToProject = async (req, res) => {
    try {
        const { projectId, employeeId } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nie został znaleziony' });
        }

        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Pracownik nie został znaleziony' });
        }

        if (String(employee.idCompany) !== String(project.idCompany)) {
            return res.status(403).json({ message: 'Pracownik nie jest przypisany do tej samej firmy co projekt' });
        }

        if (!project.employeesProject.includes(employeeId)) {
            project.employeesProject.push(employeeId);
        }

        await project.save();
        res.status(200).json({ message: 'Pracownik został dodany do projektu', project });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania pracownika do projektu', error: error.message });
    }
};

exports.addManagerToProject = async (req, res) => {
    try {
        const { projectId, userId, __t } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projekt nie został znaleziony' });
        }

        if (__t === 'Boss') {
            project.mainBigBoss = userId;
        } else if (__t === 'TeamManager') {
            project.teamManager = userId;
            if (!project.employeesProject.includes(userId)) {
                project.employeesProject.push(userId);
            }
        } else {
            return res.status(400).json({ message: 'Nieprawidłowa rola' });
        }

        await project.save();
        res.status(200).json({ message: 'Rola została przypisana do projektu', project });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania roli do projektu', error: error.message });
    }
};
