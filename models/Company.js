const mongoose = require("mongoose");

mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Połączono z bazą danych MongoDB');
    })
    .catch((error) => {
        console.error('Błąd połączenia z MongoDB:', error);
    });

const companySchema = new mongoose.Schema({
    nameCompany: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    identificationNumber: {
        type: String,
        required: true
    },
    bossCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address: {
        city: {
            type: String
        },
        street: {
            type: String
        },
        number: {
            type: Number
        },
        numberBox: {
            type: String
        },
        zipCode: {
            type: String
        }
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],
    statusCompany: {
        type: Boolean,
        default: false
    }
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;