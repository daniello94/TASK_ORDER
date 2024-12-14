const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Połączono z bazą danych MongoDB');
    })
    .catch((error) => {
        console.error('Błąd połączenia z MongoDB:', error);
    });

const productsSchema = new mongoose.Schema({
    photoProduct: [{
        namePhoto: {
            type: String,
            default: ""
        },
        photoUrl: {
            type: String,
            default: ""
        }
    }],
    nameProduct: {
        en: {
            type: String,
            require: true
        },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String },
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
        required: true
    },
    description: {
        en: { type: String },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String },
    },
    attributes: {
        material: {
            en: { type: String },
            pl: { type: String },
            de: { type: String },
            fr: { type: String },
            nl: { type: String }
        },
        length: {
            value: { type: Number },
            unit: { type: String, enum: ['m', 'cm'] },
        },
        diameter: {
            value: { type: Number },
            unit: { type: String, enum: ['mm', 'cm', 'inches'] },
        },
        voltage: {
            type: Number,
        },
        power: {
            value: { type: Number },
            unit: { type: String, enum: ['W', 'kW'] },
        },
        capacity: {
            value: { type: Number },
            unit: { type: String, enum: ['L', 'm3'] },
        }
    },
    SKU: {
        type: String,
        unique: true
    },
    quantityInStock: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productsSchema);
module.exports = Product;