const express = require('express');
const router = express.Router();
const productController = require("../controller/product.controller");
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit plików do 5MB
}).array('photos', 3); // Pozwól na maksymalnie 3 pliki

// Dodawanie nowej kategorii
router.post("/add-category", productController.createCategory);

// Dodawanie podkategorii
router.post("/add-subcategory", productController.createSubcategory);

// Dodawanie produktu
router.post("/add-product", upload, productController.createProduct);

// Wyświetlanie wszystkich kategorii z podkategoriami i produktami
router.get("/categories", productController.getAllCategories);

// Wyświetlanie konkretnej kategorii z podkategoriami i produktami
router.get("/categories/:categoryId", productController.getCategoryById);

// Wyświetlanie konkretnej podkategorii z produktami
router.get("/subcategory/:subcategoryId", productController.getSubcategoryById);

// Wyświetlanie konkretnego produktu
router.get("/products/:productId", productController.getProductById);

// Usuwanie kategorii (razem z podkategoriami i produktami)
router.delete("/categories/:categoryId", productController.deleteCategory);

// Usuwanie podkategorii (razem z produktami)
router.delete("/subcategories/:subcategoryId", productController.deleteSubcategory);

// Usuwanie produktu
router.delete("/products/:productId", productController.deleteProduct);

// Aktualizacja kategorii
router.put("/categories/:categoryId", productController.updateCategory);

// Aktualizacja podkategorii
router.put("/subcategories/:subcategoryId", productController.updateSubcategory);

// Aktualizacja produktu
router.put("/products/:productId", productController.updateProduct);

module.exports = router;
