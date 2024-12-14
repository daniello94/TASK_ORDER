const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
    .then(() => {
        console.log('Połączono z bazą danych MongoDB');
    })
    .catch((error) => {
        console.error('Błąd połączenia z MongoDB:', error);
    });

const categorySchema = new mongoose.Schema({
    categoryName: {
        en: { type: String, required: true, unique: true },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String }
    },
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory"
    }],
    description: {
        en: { type: String },
        pl: { type: String },
        de: { type: String },
        fr: { type: String },
        nl: { type: String }
    },
}, {
    timestamps: true
});
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
