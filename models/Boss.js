const mongoose = require("mongoose");
const User = require("./Users");

const bossSchema = new mongoose.Schema({
    idCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    myProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
});

const Boss = User.discriminator("Boss", bossSchema);
module.exports = Boss;
