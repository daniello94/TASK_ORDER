require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const user = require("./api/user.api");
const company = require("./api/company.api");
const project = require("./api/project.api");
const product = require("./api/product.api");
const order = require("./api/order.api");
const config = {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};

app.use(express.json());
app.use(cors(config));
app.use('/', user);
app.use("/company", company);
app.use("/project", project);
app.use("/", product);
app.use("/", order);

app.get('/', function (req, res) {
    res.status(200).json("Task Order");
});

app.use((req, res, next) => {
    res.status(404).json({ error: 'Trasa nie została znaleziona' });
});

app.listen(PORT, function () {
    console.log(`Server serwisu TaskOrder na porcie ${PORT} działa poprawnie`);
});
