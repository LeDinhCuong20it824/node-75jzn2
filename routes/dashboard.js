const express = require('express');
const connection = require('../connection');
const router = express.Router();
var auth = require('../services/authentication');

router.get('/details',auth.authenticateToken,(req,res,next)=>{
    var categoryCount;
    var productCount;
    var billCount;
    var query = "select count(id) as categoryCount from category";
    connection.query(query,(err,results)=>{
        if(!err) {
            categoryCount = results[0].categoryCount;  //gán cho biến
        } else {
            return res.status(500).json(err);
        }
    });
    //đếm số sản phẩm theo id
    var query = "select count(id) as productCount from product";
    connection.query(query,(err,results)=>{
        if(!err) {
            productCount = results[0].productCount;  //gán cho biến
        } else {
            return res.status(500).json(err);
        }
    });

    var query = "select count(id) as billCount from bill";
    connection.query(query,(err,results)=>{
        if(!err) {
            billCount = results[0].billCount;  //gán cho biến
            var data = {
                category:categoryCount,    //đặt tên cho nó là category khi hiển thị trong postman
                product:productCount,
                bill:billCount
            };
            return res.status(200).json(data);    //trả về kết quả
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;