const mongoose = require("mongoose");
const Company = require("../models/Company");
const User = require("../models/Users");
const Project = require('../models/Project');

exports.createCompany = async (req, res) => {
    try {
        const { nameCompany, identificationNumber, bigBossEmail, ...rest } = req.body;
        const existingCompany = await Company.findOne({ identificationNumber });
        if (existingCompany) {
            return res.status(400).json({ message: 'Firma z podanym numerem identyfikacyjnym już istnieje' });
        }

        const bigBoss = await User.findOne({ email: bigBossEmail });
        if (!bigBoss) {
            return res.status(404).json({ message: 'Big Boss nie został znaleziony, nie można przypisać firmy' });
        }

        if (bigBoss.idCompany) {
            return res.status(400).json({ message: 'Big Boss już posiada przypisaną firmę, nie można przypisać kolejnej' });
        }

        const company = new Company({
            nameCompany,
            identificationNumber,
            bossCompany: bigBoss._id, 
            ...rest
        });

        await company.save();

        bigBoss.idCompany = company._id;
        await bigBoss.save();

        res.status(201).json({ message: 'Firma utworzona pomyślnie i przypisana do Big Bossa', company });

    } catch (error) {
        
        res.status(500).json({ message: 'Błąd podczas tworzenia firmy', error: error.message });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const updates = req.body;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Firma nie została znaleziona' });
        }

        Object.keys(updates).forEach(key => {
            company[key] = updates[key];
        });

        const updatedCompany = await company.save();

        res.status(200).json({ message: 'Firma zaktualizowana pomyślnie', updatedCompany });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas aktualizacji firmy', error: error.message });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'Nieprawidłowe ID firmy' });
        }

        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return res.status(404).json({ message: 'Firma nie została znaleziona' });
        }

        const deletedUsers = await User.deleteMany({ idCompany: new mongoose.Types.ObjectId(companyId) });

        const deletedProjects = await Project.deleteMany({ idCompany: new mongoose.Types.ObjectId(companyId) });

        if (deletedUsers.deletedCount === 0 && deletedProjects.deletedCount === 0) {
            return res.status(200).json({ message: 'Firma została pomyślnie usunięta, brak użytkowników i projektów powiązanych z tą firmą' });
        }

        res.status(200).json({
            message: 'Firma została pomyślnie usunięta oraz użytkownicy i projekty powiązane z tą firmą',
            deletedUsersCount: deletedUsers.deletedCount,
            deletedProjectsCount: deletedProjects.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas usuwania firmy', error: error.message });
    }
};

exports.getCompanyEmployees = async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await Company.findById(companyId).populate('employees');

        if (!company) {
            return res.status(404).json({ message: 'Firma nie została znaleziona' });
        }
        res.status(200).json({ message: 'Lista pracowników firmy', employees: company.employees });

    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania pracowników firmy', error: error.message });
    }
};

exports.getCompanyWithProjects = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId).populate('projects');

        if (!company) {
            return res.status(404).json({ message: 'Firma nie została znaleziona' });
        }

        res.status(200).json({ message: 'Firma i jej projekty zostały znalezione', company });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania firmy i jej projektów', error: error.message });
    }
};

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();

        if (!companies.length) {
            return res.status(404).json({ message: 'Brak zarejestrowanych firm w serwisie' });
        }

        res.status(200).json({ message: 'Lista zarejestrowanych firm', companies });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania firm', error: error.message });
    }
};

exports.toggleCompanyStatus = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'Nieprawidłowe ID firmy' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Firma nie została znaleziona' });
        }

        company.statusCompany = !company.statusCompany;

        await company.save();

        res.status(200).json({ message: 'Status firmy został pomyślnie przełączony', company });
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas przełączania statusu firmy', error: error.message });
    }
};