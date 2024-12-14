const mongoose = require('mongoose');
const User = require('./Users');

const employeeSchema = new mongoose.Schema({
  idCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },
});

const Employee = User.discriminator('Employee', employeeSchema);
module.exports = Employee;
