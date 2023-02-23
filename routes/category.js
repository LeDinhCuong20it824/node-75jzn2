const express = require('express');
const connection = require('../connection');
const router = express.Router();   //khai báo bộ định tuyến
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

//thêm danh mục sp
router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let category = req.body;
    query = "insert into category(name) values(?)";
    connection.query(query,[category.categoryName],(err,results)=>{
        if(!err) {
            return res.status(200).json({message:"Category added successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/get',auth.authenticateToken,(req,res,next)=>{
    var query = "select * from category order by name";
    connection.query(query,(err,results)=>{
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let category = req.body;
    var query = "update category set name=? where id=?";
    connection.query(query,[category.categoryName,category.categoryID],(err,results)=>{  //categoryName và categoryID là tên khi chạy trong postman
        if(!err) {
            if(results.affectedRows == 0) {    //nếu danh mục không tồn tại
                return res.status(404).json({message:"Category id does not found!!!"});
            }
            return res.status(200).json({message:"Category updated successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;