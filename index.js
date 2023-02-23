const express = require('express');
var cors = require('cors');
const connection = require('./connection');  //add file connection.js
const userRoute = require('./routes/user');
const categoryRoute = require('./routes/category');    //add file category.js
const productRoute = require('./routes/product');
const billRoute = require('./routes/bill');
const dashboardRoute = require('./routes/dashboard');
const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/user', userRoute);   //tạo đường dẫn localhost:8181/user
app.use('/category',categoryRoute);
app.use('/product',productRoute);
app.use('/bill',billRoute);
app.use('/dashboard',dashboardRoute);

module.exports = app;