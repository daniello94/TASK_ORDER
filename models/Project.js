const mongoose = require("mongoose");
const { calculateEmployeeProjectTime } = require('../middleware/projectMiddleware');

const projectSchema = new mongoose.Schema({
    idCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    nameProject: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        numberBox: {
            type: String
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    mainBigBoss: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    teamManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    sumTame: [{
        year: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        hours: {
            type: Number,
            default: 0
        }
    }],
    total: {
        type: Number,
        default: 0
    },
    timeWorks: [
        {
            year: {
                type: Number,
                required: true
            },
            month: {
                type: Number,
                required: true,
                min: 1,
                max: 12
            },
            day: {
                type: Number,
                required: true,
                min: 1,
                max: 31
            },
            employeeTimeRecords: [{
                employee: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                time: {
                    type: Number,
                    required: true
                }
            }],
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    employeesProject: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    blog: [{
        sendUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

projectSchema.pre("save", function (next) {
    calculateEmployeeProjectTime(this);

    this.total = this.sumTame.reduce((sum, entry) => sum + entry.hours, 0);

    next();
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
