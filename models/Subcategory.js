const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Połączono z bazą danych MongoDB');
    })
    .catch((error) => {
        console.error('Błąd połączenia z MongoDB:', error);
    });

const subcategorySchema = new mongoose.Schema({
    subcategoryName: {
        en: { type: String, required: true, unique: true },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    description: {
        en: { type: String },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String }
    }
}, {
    timestamps: true
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
module.exports = Subcategory;
