const express = require('express');
const connection = require('../connection');
const router = express.Router();   //bộ định tuyến
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=>{
    let product = req.body;
    var query = "insert into product(name,categoryID,description,price,status) values(?,?,?,?,'true')";
    connection.query(query,[product.productName,product.categoryID,product.description,product.price],(err,results)=>{
        if(!err) {
            return res.status(200).json({message:"Product added successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});
 
//lấy thông tin sp cùng với thông tin danh mục chứa sp đó
router.get('/get',auth.authenticateToken,(req,res,next)=>{
    //đặt tên cho id category và tên category để khi hiển thị không bị trùng với id và tên của bảng product
    var query = "select p.id,p.name,c.id as categoryID,p.description,p.price,p.status,c.name as categoryName from product as p INNER JOIN category as c where p.categoryID=c.id";
    connection.query(query,(err,results)=>{
        if(!err) {
            return res.status(200).json({results});   ///trả về tập bản ghi
        } else {
            return res.status(500).json(err);
        }
    });
});

//lấy tất cả sản phẩm trong cùng 1 id danh mục
router.get('/getByCategoryID/:id',auth.authenticateToken,(req,res,next)=>{   //cần phải truyền id sang trang khác nên phải khai báo id trên đường dẫn
    const categoryID = req.params.id;    //(id) là code được cung cấp bởi thư viện  
    var query = "select id,name from product where categoryID=? and status='true'";
    connection.query(query,[categoryID],(err,results)=>{
        if(!err) {
            return res.status(200).json(results);   //trả về 1 tập các bản ghi
        } else {
            return res.status(500).json(err);
        }
    });
});

//lấy thông tin sản phẩm theo id truyền vào
router.get('/getByID/:id',auth.authenticateToken,(req,res,next)=>{
    const productID = req.params.id;
    var query = "select id,name,description,price from product where id=?";
    connection.query(query,[productID],(err,results)=>{
        if(!err) {
            return res.status(200).json(results[0]);   //trả về 1 bản ghi
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let product = req.body;
    query = "update product set name=?,categoryID=?,description=?,price=? where id=?";  
    connection.query(query,[product.productName,product.categoryID,product.description,product.price,product.productID],(err,results)=>{
        if(!err) {
            if(results.affectedRows == 0) {    //nếu không có bản ghi nào đc chèn
                return res.status(404).json({message:"Product id does not found!!!"});
            }
            return res.status(200).json({message:"Product updated successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    const productID = req.params.id;
    var query = "delete from product where id=?";
    connection.query(query,[productID],(err,results)=>{
        if(!err) {
            if(results.affectedRows == 0) {   //nếu không có bản ghi nào bị xóa
                return res.status(404).json({message:"Product id does not found!!!"});
            }
            return res.status(200).json({message:"Product deleted successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/updateStatus',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let user = req.body;
    var query = "update product set status=? where id=?";
    connection.query(query,[user.status,user.productID],(err,results)=>{
        if(!err) {
            if(results.affectedRows == 0) {
                return res.status(404).json({message:"Product id does not found"});
            }
            return res.status(200).json({message:"Product status updated successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;