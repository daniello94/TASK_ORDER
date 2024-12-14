const mongoose = require("mongoose");
const User = require("./Users"); 

const adminSchema = new mongoose.Schema({

  globalPermissions: [{ type: String }]
});

const AdminSchema = User.discriminator("admin", adminSchema);
 
module.exports = AdminSchema;