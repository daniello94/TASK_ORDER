const mongoose = require("mongoose");
const User = require("./Users");

const bigBossSchema = new mongoose.Schema({
  idCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  }
});

const BigBoss = User.discriminator("BigBoss", bigBossSchema);
module.exports = BigBoss;
