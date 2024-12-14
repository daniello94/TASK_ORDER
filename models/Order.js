const mongoose = require("mongoose");
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Połączono z bazą danych MongoDB');
    })
    .catch((error) => {
        console.error('Błąd połączenia z MongoDB:', error);
    });

const orderSchema = new mongoose.Schema({
    statusOrder: {
        activeStatus: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending"
        },
        addressPickUP: {
            type: Map,
            of: String,
            default: { en: '', pl: '', de: '' }
        }
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    orderedProducts: [{
        nameProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            required: true
        }
    }],
    orderUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: {
        type: Map,
        of: String,
        default: { en: '', pl: '', de: '' }
    },
    additionalInfoPhoto: [{
        namePhoto: {
            type: String,
            default: ""
        },
        photoUrl: {
            type: String,
            default: "",
            required: true
        },
        comments: {
            type: Map,
            of: String,
            default: { en: '', pl: '', de: '' }
        }
    }]
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;