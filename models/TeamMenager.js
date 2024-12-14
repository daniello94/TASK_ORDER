const mongoose = require('mongoose');
const User = require('./Users');

const teamManagerSchema = new mongoose.Schema({
  idCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },
  myProjects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  }],
});

const TeamManager = User.discriminator('TeamManager', teamManagerSchema);

module.exports = TeamManager;
