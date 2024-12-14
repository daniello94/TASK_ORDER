const Project = require("../models/Project");
const User = require("../models/Users");

function calculateEmployeeProjectTime(project) {
    const monthlyHours = {};

    project.timeWorks.forEach(record => {
        const key = `${record.year}-${record.month}`;
        if (!monthlyHours[key]) {
            monthlyHours[key] = 0;
        }

        record.employeeTimeRecords.forEach(empRecord => {
            if (empRecord.time) {
                monthlyHours[key] += empRecord.time;
            }
        });
    });

    project.sumTame = [];
    for (const [key, hours] of Object.entries(monthlyHours)) {
        const [year, month] = key.split('-');
        project.sumTame.push({
            year: parseInt(year),
            month: parseInt(month),
            hours: hours
        });
    }
}


async function checkBigBossRole(req, res, next) {
    try {
        const userId = req.body.mainBigBoss || req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: "Brak ID użytkownika. Nie można autoryzować." });
        }
        const user = await User.findById(userId);
        if (!user || user.__t !== 'BigBoss') {
            return res.status(403).json({ message: "Tylko Big Boss może wykonać tę operację." });
        }

        next(); 
    } catch (error) {
        res.status(500).json({ message: "Błąd autoryzacji użytkownika.", error: error.message });
    }
}
module.exports = { calculateEmployeeProjectTime, checkBigBossRole };
