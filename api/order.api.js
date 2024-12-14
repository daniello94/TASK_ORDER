const express = require('express');
const router = express.Router();
const order = require("../controller/order.controller");

//dodawanie nowego zamowienia
router.post("/add_order", order.createOrder);
//edycja uwag zamowienia
router.patch("/status_order/:orderId", order.updateOrderStatus);
//wyswietlanie danego zmaoienia
router.get("/order/:orderId", order.getOrderById);
//wyswyetlanie wszytkich zamowien danego prokeltu (opcjonalnie segregacja po przez zamiweinai konkretnego zamawiajacego )
router.get("/orders_all/:projectId", order.getOrdersForProject);
module.exports = router;
