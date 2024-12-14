const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const isRole = (allowedRoles) => async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Brak tokenu. Musisz być zalogowany.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Nieprawidłowy token.' });
        }

        req.user = user;

        if (!allowedRoles.includes(user.__t)) {
            return res.status(403).json({ message: 'Brak uprawnień do tej treści.' });
        }

        next(); 
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas sprawdzania uprawnień', error: error.message });
    }
};

module.exports = isRole;
