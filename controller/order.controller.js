const multer = require('multer');
const { bucket } = require('../config/googleCloudStorage');
const nodemailer = require("nodemailer");
const Project = require("../models/Project");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Company = require("../models/Company");
const User = require('../models/Users');
const translations = require('../utils/translations');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
    { name: 'additionalPhoto', maxCount: 10 },
    { name: 'orderedProductPhotos', maxCount: 10 }
]);

exports.createOrder = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "Błąd podczas przesyłania plików", error: err.message });
        }

        try {
            const { projectId, orderedProducts: orderedProductsStr, comments, idCompany, orderUser, additionalPhotoComments } = req.body;

            let orderedProducts;
            try {
                orderedProducts = JSON.parse(orderedProductsStr);
            } catch (parseError) {
                return res.status(400).json({ message: "Niepoprawny format danych orderedProducts", error: parseError.message });
            }

            let parsedAdditionalPhotoComments = [];
            try {
                parsedAdditionalPhotoComments = JSON.parse(additionalPhotoComments);
            } catch (parseError) {
                return res.status(400).json({ message: "Błąd parsowania komentarzy do zdjęć", error: parseError.message });
            }

            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: "Projekt nie został znaleziony" });
            }

            const company = await Company.findById(idCompany);
            if (!company) {
                return res.status(400).send({ error: "Nie znaleziono firmy o podanym ID." });
            }

            const bossCompanyUser = await User.findById(company.bossCompany);
            if (!bossCompanyUser) {
                return res.status(404).json({ error: "Nie znaleziono użytkownika BigBosa firmy." });
            }

            const user = await User.findById(orderUser);
            if (!user) {
                return res.status(400).send({ error: "Nie znaleziono użytkownika o podanym ID." });
            }

            let additionalInfoPhoto = [];
            if (req.files['additionalPhoto'] && req.files['additionalPhoto'].length > 0) {
                const files = req.files['additionalPhoto'];

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const gcsFileName = `additionalOrderPhotos/${Date.now()}-${file.originalname}`;
                    const blob = bucket.file(gcsFileName);
                    const blobStream = blob.createWriteStream({
                        metadata: {
                            contentType: file.mimetype
                        }
                    });

                    await new Promise((resolve, reject) => {
                        blobStream.on('error', reject);
                        blobStream.on('finish', resolve);
                        blobStream.end(file.buffer);
                    });

                    additionalInfoPhoto.push({
                        namePhoto: file.originalname,
                        photoUrl: `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`,
                        comments: {
                            en: parsedAdditionalPhotoComments[i]?.en || "",
                            pl: parsedAdditionalPhotoComments[i]?.pl || "",
                            de: parsedAdditionalPhotoComments[i]?.de || ""
                        }
                    });
                }
            }

            const order = new Order({
                project: projectId,
                orderedProducts,
                orderUser: user._id,
                comments: {
                    en: comments?.en || "",
                    pl: comments?.pl || "",
                    de: comments?.de || ""
                },
                additionalInfoPhoto
            });

            await order.save();

            project.orders.push(order._id);
            await project.save();

            const preferredLanguage = bossCompanyUser.preferredLanguage || 'en';

            const orderedProductDetails = await Promise.all(orderedProducts.map(async (item) => {
                const product = await Product.findById(item.nameProduct);
                return {
                    name: product ? product.nameProduct[preferredLanguage] || product.nameProduct['en'] : "Nieznany produkt",
                    material: product ? product.attributes.material[preferredLanguage] || product.attributes.material['en'] : "Nieznany materiał",
                    quantity: item.quantity,
                    photo: product ? product.photoProduct[0]?.photoUrl || "Brak zdjęcia" : "Brak zdjęcia"
                };
            }));

            const orderedProductNames = orderedProductDetails.map(
                product => `
                    <div>
                        <img src="${product.photo}" alt="Zdjęcie produktu" style="width:70px; height:auto;"/><br>
                        <p><b>Nazwa:</b> ${product.name}</p>
                        <p><b>Materiał:</b> ${product.material}</p>
                        <p><b>Ilość:</b> ${product.quantity}</p>
                    </div>
                `
            ).join('<br>');

            const translation = translations[preferredLanguage] || translations.en;

            const emailSubject = translation.subject(project.nameProject);
            let emailBody = translation.body(
                project.nameProject,
                orderedProductNames,
                comments[preferredLanguage] || comments['en'],
                user.userName,
                user.userLastName
            );

            if (additionalInfoPhoto.length > 0) {
                const additionalPhotosHtml = additionalInfoPhoto.map(photo => `
                  <p><br> <a href="${photo.photoUrl}"> <img src="${photo.photoUrl}" alt="_blank" style="width:150px; height:150px;"/></a> <br> Comment: ${photo.comments[preferredLanguage] || photo.comments['en'] || 'None'}</p>
                `).join('');
                emailBody += additionalPhotosHtml;
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.ADDRESS_EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: process.env.ADDRESS_EMAIL,
                to: company.email,
                subject: emailSubject,
                html: emailBody
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Błąd podczas wysyłania e-maila:", err);
                    return res.status(500).json({ message: "Błąd podczas wysyłania e-maila", error: err.message });
                } else {
                    console.log("E-mail został wysłany:", info.response);
                    res.status(201).json({ message: "Zamówienie zostało utworzone i e-mail wysłany", order });
                }
            });

        } catch (error) {
            console.error("Błąd podczas tworzenia zamówienia:", error);
            res.status(500).json({ message: "Błąd podczas tworzenia zamówienia", error: error.message });
        }
    });
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { activeStatus, addressPickUP } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            'statusOrder.activeStatus': activeStatus,
            'statusOrder.addressPickUP': {
                en: addressPickUP?.en || "",
                pl: addressPickUP?.pl || "",
                de: addressPickUP?.de || ""
            }
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Zamówienie nie zostało znalezione" });
        }

        res.status(200).json({ message: "Status zamówienia został zaktualizowany", updatedOrder });
    } catch (error) {
        console.error("Błąd podczas aktualizacji statusu zamówienia:", error);
        res.status(500).json({ message: "Błąd podczas aktualizacji statusu zamówienia", error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const lang = req.query.lang || 'en';

        const order = await Order.findById(orderId)
            .populate('project')
            .populate('orderedProducts.nameProduct')
            .populate('orderUser');

        if (!order) {
            return res.status(404).json({ message: "Zamówienie nie zostało znalezione" });
        }

        const localizedOrder = {
            _id: order._id,
            statusOrder: {
                activeStatus: order.statusOrder.activeStatus,
                addressPickUP: order.statusOrder.addressPickUP.get(lang) || order.statusOrder.addressPickUP.get('en')
            },
            project: order.project,
            orderedProducts: order.orderedProducts.map(product => ({
                _id: product._id,
                nameProduct: product.nameProduct.nameProduct[lang] || product.nameProduct.nameProduct['en'],
                quantity: product.quantity
            })),
            orderUser: order.orderUser,
            comments: order.comments.get(lang) || order.comments.get('en'),
            additionalInfoPhoto: order.additionalInfoPhoto.map(photo => ({
                namePhoto: photo.namePhoto,
                photoUrl: photo.photoUrl,
                comments: photo.comments.get(lang) || photo.comments.get('en')
            }))
        };

        res.status(200).json(localizedOrder);
    } catch (error) {
        console.error("Błąd podczas pobierania zamówienia:", error);
        res.status(500).json({ message: "Błąd podczas pobierania zamówienia", error: error.message });
    }
};

exports.getOrdersForProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { orderUser, lang } = req.query;

        const language = lang || 'en';

        // Budowanie kryterium wyszukiwania
        let filter = { project: projectId };
        if (orderUser) {
            filter.orderUser = orderUser;
        }

        // Znalezienie zamówień spełniających kryteria
        const orders = await Order.find(filter)
            .populate('project')
            .populate('orderedProducts.nameProduct')
            .populate('orderUser');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Nie znaleziono zamówień dla tego projektu" });
        }

        // Lokalizacja zamówień na podstawie podanego języka
        const localizedOrders = orders.map(order => ({
            _id: order._id,
            statusOrder: {
                activeStatus: order.statusOrder.activeStatus,
                addressPickUP: order.statusOrder.addressPickUP?.[language] || order.statusOrder.addressPickUP?.['en'] || ""
            },
            project: {
                _id: order.project._id,
                name: order.project.nameProject[language] || order.project.nameProject['en']
            },
            orderedProducts: order.orderedProducts.map(product => ({
                _id: product._id,
                nameProduct: product.nameProduct.nameProduct[language] || product.nameProduct.nameProduct['en'],
                quantity: product.quantity
            })),
            orderUser: {
                _id: order.orderUser._id,
                userName: order.orderUser.userName,
                userLastName: order.orderUser.userLastName
            },
            comments: order.comments?.[language] || order.comments?.['en'] || "",
            additionalInfoPhoto: order.additionalInfoPhoto.map(photo => ({
                namePhoto: photo.namePhoto,
                photoUrl: photo.photoUrl,
                comments: photo.comments?.[language] || photo.comments?.['en'] || ""
            }))
        }));

        res.status(200).json(localizedOrders);
    } catch (error) {
        console.error("Błąd podczas pobierania zamówień dla projektu:", error);
        res.status(500).json({ message: "Błąd podczas pobierania zamówień dla projektu", error: error.message });
    }
};
