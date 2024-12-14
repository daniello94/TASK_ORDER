const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\n/g, '\n'),
    }
});
const bucket = storage.bucket(process.env.MY_DATA);

exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        const category = new Category({ categoryName, description });
        await category.save();
        res.status(201).json({ message: "Kategoria utworzona pomyślnie", category });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas tworzenia kategorii", error: error.message });
    }
};

exports.createSubcategory = async (req, res) => {
    try {
        const { subcategoryName, categoryId, description } = req.body;
        const subcategory = new Subcategory({ subcategoryName, category: categoryId, description });
        await subcategory.save();

        await Category.findByIdAndUpdate(categoryId, {
            $push: { subcategories: subcategory._id }
        });

        res.status(201).json({ message: "Podkategoria utworzona pomyślnie", subcategory });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas tworzenia podkategorii", error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { nameProduct, subcategoryId, description, basePrice, attributes, SKU, quantityInStock } = req.body;

        // Tworzenie nowego produktu
        const product = new Product({ nameProduct, subcategory: subcategoryId, description, basePrice, attributes, SKU, quantityInStock });

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(req.files.map(async (file) => {
                const uniqueSuffix = uuidv4();
                const fileExtension = file.originalname.split('.').pop();
                const uniqueFileName = `${uniqueSuffix}.${fileExtension}`;

                const gcsFileName = `products/${uniqueFileName}`;
                const blob = bucket.file(gcsFileName);

                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;

                return new Promise((resolve, reject) => {
                    blobStream.on('error', error => reject(error));
                    blobStream.on('finish', () => {
                        resolve({
                            namePhoto: uniqueFileName,
                            photoUrl: publicUrl
                        });
                    });
                    blobStream.end(file.buffer);
                });
            }));

            // Dodawanie zdjęć do modelu produktu
            product.photoProduct = uploadedImages;
        }
        await product.save();

        await Subcategory.findByIdAndUpdate(subcategoryId, {
            $push: { products: product._id }
        });

        res.status(201).json({ message: "Produkt utworzony pomyślnie", product });
    } catch (error) {
        console.error("Błąd podczas tworzenia produktu:", error);
        res.status(500).json({ message: "Błąd podczas tworzenia produktu", error: error.message });
    }
};

// Wyświetlanie wszystkich kategorii z podkategoriami i produktami
exports.getAllCategories = async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const categories = await Category.find()
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'products'
                }
            });

        // Mapowanie kategorii i tłumaczenie
        const localizedCategories = categories.map(category => ({
            _id: category._id,
            categoryName: category.categoryName[lang] || category.categoryName['en'],
            description: category.description[lang] || category.description['en'],
            subcategories: category.subcategories.map(subcategory => ({
                _id: subcategory._id,
                subcategoryName: subcategory.subcategoryName[lang] || subcategory.subcategoryName['en'],
                description: subcategory.description[lang] || subcategory.description['en'],
                products: subcategory.products.map(product => ({
                    _id: product._id,
                    nameProduct: product.nameProduct[lang] || product.nameProduct['en'],
                    description: product.description[lang] || product.description['en'],
                    SKU: product.SKU,
                    quantityInStock: product.quantityInStock
                }))
            }))
        }));

        res.status(200).json(localizedCategories);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania kategorii", error: error.message });
    }
};

// Wyświetlanie konkretnej kategorii z podkategoriami i produktami
exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const lang = req.query.lang || 'en';
        const category = await Category.findById(categoryId)
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'products'
                }
            });

        if (!category) {
            return res.status(404).json({ message: "Kategoria nie została znaleziona" });
        }

        const localizedCategory = {
            _id: category._id,
            categoryName: category.categoryName[lang] || category.categoryName['en'],
            description: category.description[lang] || category.description['en'],
            subcategories: category.subcategories.map(subcategory => ({
                _id: subcategory._id,
                subcategoryName: subcategory.subcategoryName[lang] || subcategory.subcategoryName['en'],
                description: subcategory.description[lang] || subcategory.description['en'],
                products: subcategory.products.map(product => ({
                    _id: product._id,
                    nameProduct: product.nameProduct[lang] || product.nameProduct['en'],
                    description: product.description[lang] || product.description['en'],
                    SKU: product.SKU,
                    quantityInStock: product.quantityInStock
                }))
            }))
        };

        res.status(200).json(localizedCategory);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania kategorii", error: error.message });
    }
};

// Wyświetlanie konkretnej podkategorii z produktami
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const lang = req.query.lang || 'en';
        const subcategory = await Subcategory.findById(subcategoryId)
            .populate('products');

        if (!subcategory) {
            return res.status(404).json({ message: "Podkategoria nie została znaleziona" });
        }

        const localizedSubcategory = {
            _id: subcategory._id,
            subcategoryName: subcategory.subcategoryName[lang] || subcategory.subcategoryName['en'],
            description: subcategory.description[lang] || subcategory.description['en'],
            products: subcategory.products.map(product => ({
                _id: product._id,
                nameProduct: product.nameProduct[lang] || product.nameProduct['en'],
                description: product.description[lang] || product.description['en'],
                SKU: product.SKU,
                quantityInStock: product.quantityInStock
            }))
        };

        res.status(200).json(localizedSubcategory);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania podkategorii", error: error.message });
    }
};

// Wyświetlanie konkretnego produktu
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const lang = req.query.lang || 'en';
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Produkt nie został znaleziony" });
        }

        const localizedProduct = {
            _id: product._id,
            nameProduct: product.nameProduct[lang] || product.nameProduct['en'],
            description: product.description[lang] || product.description['en'],
            attributes: {
                material: product.attributes.material[lang] || product.attributes.material['en'],
                length: product.attributes.length,
                diameter: product.attributes.diameter,
                voltage: product.attributes.voltage,
                power: product.attributes.power,
                capacity: product.attributes.capacity
            },
            SKU: product.SKU,
            quantityInStock: product.quantityInStock,
            photoProduct: product.photoProduct
        };

        res.status(200).json(localizedProduct);
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas pobierania produktu", error: error.message });
    }
};

// Usuwanie kategorii oraz powiązanych podkategorii, produktów i zdjęć
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Kategoria nie została znaleziona" });
        }

        const subcategories = await Subcategory.find({ category: categoryId });
        const subcategoryIds = subcategories.map(subcategory => subcategory._id);

        const products = await Product.find({ subcategory: { $in: subcategoryIds } });

        await Promise.all(products.map(async (product) => {
            if (product.photoProduct && product.photoProduct.length > 0) {
                await Promise.all(product.photoProduct.map(async (photo) => {
                    try {
                        if (photo.photoUrl) {
                            const filename = photo.photoUrl.split('/').pop();
                            const file = bucket.file(`products/${filename}`);

                            await file.delete();
                            console.log(`Usunięto zdjęcie: ${filename}`);
                        }
                    } catch (error) {
                        console.error(`Błąd podczas usuwania zdjęcia: ${photo.photoUrl}`, error.message);
                    }
                }));
            }
        }));

        await Product.deleteMany({ subcategory: { $in: subcategoryIds } });
        await Subcategory.deleteMany({ category: categoryId });
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ message: "Kategoria oraz powiązane podkategorie, produkty i zdjęcia zostały usunięte" });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas usuwania kategorii", error: error.message });
    }
};

// Usuwanie podkategorii oraz powiązanych produktów i zdjęć
exports.deleteSubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;

        const subcategory = await Subcategory.findById(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ message: "Podkategoria nie została znaleziona" });
        }

        const products = await Product.find({ subcategory: subcategoryId });

        await Promise.all(products.map(async (product) => {
            if (product.photoProduct && product.photoProduct.length > 0) {
                await Promise.all(product.photoProduct.map(async (photo) => {
                    try {
                        if (photo.photoUrl) {
                            const filename = photo.photoUrl.split('/').pop();
                            const file = bucket.file(`products/${filename}`);

                            await file.delete();
                            console.log(`Usunięto zdjęcie: ${filename}`);
                        }
                    } catch (error) {
                        console.error(`Błąd podczas usuwania zdjęcia: ${photo.photoUrl}`, error.message);
                    }
                }));
            }
        }));

        await Product.deleteMany({ subcategory: subcategoryId });
        await Subcategory.findByIdAndDelete(subcategoryId);

        res.status(200).json({ message: "Podkategoria oraz powiązane produkty i zdjęcia zostały usunięte" });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas usuwania podkategorii", error: error.message });
    }
};

// Usuwanie produktu i jego zdjęć
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produkt nie został znaleziony" });
        }

        if (product.photoProduct && product.photoProduct.length > 0) {
            await Promise.all(product.photoProduct.map(async (photo) => {
                try {
                    if (photo.photoUrl) {
                        const filename = photo.photoUrl.split('/').pop();
                        const file = bucket.file(`products/${filename}`);

                        await file.delete();
                        console.log(`Usunięto zdjęcie: ${filename}`);
                    }
                } catch (error) {
                    console.error(`Błąd podczas usuwania zdjęcia: ${photo.photoUrl}`, error.message);
                }
            }));
        }

        // Usunięcie produktu
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: "Produkt oraz powiązane zdjęcia zostały usunięte" });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas usuwania produktu", error: error.message });
    }
};

// Edytowanie kategorii
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const updates = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Kategoria nie została znaleziona" });
        }

        res.status(200).json({ message: "Kategoria została zaktualizowana", updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas aktualizacji kategorii", error: error.message });
    }
};

// Edytowanie podkategorii
exports.updateSubcategory = async (req, res) => {
    try {
        const subcategoryId = req.params.subcategoryId;
        const updates = req.body;

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, updates, { new: true });

        if (!updatedSubcategory) {
            return res.status(404).json({ message: "Podkategoria nie została znaleziona" });
        }

        res.status(200).json({ message: "Podkategoria została zaktualizowana", updatedSubcategory });
    } catch (error) {
        res.status(500).json({ message: "Błąd podczas aktualizacji podkategorii", error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        let product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produkt nie został znaleziony" });
        }
        if (req.body.photosToDelete && Array.isArray(req.body.photosToDelete)) {
            for (const photoUrl of req.body.photosToDelete) {
                const filename = photoUrl.split('/').pop();
                const file = bucket.file(`products/${filename}`);
                try {
                    await file.delete();
                    product.photoProduct = product.photoProduct.filter(photo => photo.photoUrl !== photoUrl);
                } catch (error) {
                    console.error("Błąd podczas usuwania zdjęcia:", error);
                }
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(req.files.map(async (file) => {
                const uniqueSuffix = uuidv4();
                const fileExtension = file.originalname.split('.').pop();
                const uniqueFileName = `${uniqueSuffix}.${fileExtension}`;

                const gcsFileName = `products/${uniqueFileName}`;
                const blob = bucket.file(gcsFileName);

                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;

                return new Promise((resolve, reject) => {
                    blobStream.on('error', error => reject(error));
                    blobStream.on('finish', () => {
                        resolve({
                            namePhoto: uniqueFileName,
                            photoUrl: publicUrl
                        });
                    });
                    blobStream.end(file.buffer);
                });
            }));

            product.photoProduct = product.photoProduct.concat(uploadedImages);
        }

        Object.keys(req.body).forEach((key) => {
            if (key !== "photosToDelete") {
                product[key] = req.body[key];
            }
        });
        await product.save();

        res.status(200).json({ message: "Produkt został zaktualizowany", product });
    } catch (error) {
        console.error("Błąd podczas aktualizacji produktu:", error);
        res.status(500).json({ message: "Błąd podczas aktualizacji produktu", error: error.message });
    }
};
