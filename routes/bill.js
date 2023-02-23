const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs');    //thư viện ejs
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/authentication');

//tạo file pdf
router.post('/generateReport',auth.authenticateToken,(req,res)=>{
    const generatedUUID = uuid.v1();
    const bill = req.body;
    const productDetailsReport = JSON.parse(bill.productDetails);
    var query = "insert into bill(uuid,name,email,contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)";
    //kết nối database và truyền tham số cho truy vấn
    connection.query(query,[generatedUUID,bill.name,bill.email,bill.contactNumber,bill.paymentMethod,bill.totalAmount,bill.productDetails,res.locals.email],(err,results)=>{
        if(!err) {
            //đặt tên cho các biến ở file report.ejs và đặt tên cho tham sô truyền vào tại postman
            //in thông tin ở file report.ejs
            ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails:productDetailsReport,name:bill.name,email:bill.email,contactNumber:bill.contactNumber,paymentMethod:bill.paymentMethod,totalAmount:bill.totalAmount},(err,results)=>{
                if(err) {
                    return res.status(500).json(err);
                } else {
                    pdf.create(results).toFile('./generated_pdf/' + generatedUUID + ".pdf", function(err, data) {
                        if(err) {
                            console.log(err);   //hiển thị lỗi
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({uuid: generatedUUID});
                        }
                    });
                }
            });
        } else {
            return res.status(500).json(err)
        }
    });
});

//lấy lại file pdf theo uuid
router.post('/getPdf',auth.authenticateToken,function(req, res) {  
    const bill = req.body;
    const pdfPath = './generated_pdf/' + bill.uuid + '.pdf';
    if(fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(bill.productDetails);
        ejs.renderFile(path.join(__dirname,'',"report.ejs"),{productDetails:productDetailsReport,name:bill.name,email:bill.email,contactNumber:bill.contactNumber,paymentMethod:bill.paymentMethod,totalAmount:bill.totalAmount},(err,results)=>{
            if(err) {
                return res.status(500).json(err);
            } else {
                pdf.create(results).toFile('./generated_pdf/' + bill.uuid +".pdf", function(err, data) {
                    if(err) {
                        console.log(err);   //hiển thị lỗi
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                });
            }
        });
    }
});

//lấy bill theo id giảm dần
router.get('/getBills',auth.authenticateToken,(req,res,next)=>{   
    var query = "select * from bill order by id DESC";
    connection.query(query,(err,results)=>{
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id',auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "delete from bill where id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err) {
            if(results.affectedRows == 0) {   //không có bản ghi nào đc xóa
                return res.status(404).json({message:"Bill id does not found!!!"});
            }
            return res.status(200).json({message:"Bill deleted successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;