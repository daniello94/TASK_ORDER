const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const Company = require('../models/Company'); // upewnij się, że Company jest zaimportowane

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Pobrany token:', token); // dodane do debugowania

        if (!token) {
            return res.status(401).json({ message: 'Brak tokenu. Musisz być zalogowany.' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET jest nieokreślony.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Rozkodowany token:', decoded); // dodane do debugowania

        const user = await User.findById(decoded._id);
        if (!user) {
            console.error('Użytkownik nie został znaleziony.');
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        // Sprawdzenie, czy konto użytkownika lub firmy nie jest zablokowane
        if (user.statusUser) {
            return res.status(403).json({ message: 'Konto użytkownika zostało zablokowane, nie można się zalogować' });
        }

        if (user.idCompany) {
            const company = await Company.findById(user.idCompany);
            console.log('Firma użytkownika:', company); // dodane do debugowania
            if (company && company.statusCompany) {
                return res.status(403).json({ message: 'Konto firmy zostało zablokowane, nie można się zalogować' });
            }
        }
        req.user = user;
        console.log("Zalogowany użytkownik (middleware):", req.user);
        next();
    } catch (error) {
        console.error('Błąd uwierzytelniania:', error.message);
        res.status(401).json({ message: 'Błąd uwierzytelniania', error: error.message });
    }

};

module.exports = authenticate;
