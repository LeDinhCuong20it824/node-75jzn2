const express = require('express');  //phương thức require() tương tự như include
const connection = require('../connection');  //add file connection.js
const router = express.Router();   //khai báo bộ định tuyến

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');


router.post('/signup', (req, res) =>{    //khai báo tuyến đường cho trang đăng kí và được xử lí bởi phương thức POST
    let user = req.body;   //nhận dữ liệu từ frontend
    query = "select email,password,role,status from users where email=?";
    connection.query(query, [user.email], (err, results)=>{   //kiểm tra bản ghi đã tồn tại trong database hay chưa
        if(!err) {
            if(results.length <= 0) {
                query = "insert into users(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name,user.contactNumber,user.email,user.password], (err, results) =>{     //đặt tên các tham số phải cùng tên khi sử dụng postman hoặc tên ở form bên phía fronted
                    if(!err) {
                        return res.status(200).json({message: "Successfully Registered !!!"});    //trả về biến 'message'
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({message: "Emailly already exist !!!"});
            }
        } else {
            return res.status(500).json(err);
        }
    });
})

router.post('/login', (req, res) =>{    //đăng nhập
    const user = req.body;    //lấy thông tin mà user nhập vào
    query = "select email,password,role,status from users where email=?";   //lấy thông tin về bản ghi theo email mà người dùng nhập vào
    connection.query(query, [user.email], (err, results) =>{     //kết nối database và truyền truy vấn, truyền vào email người dùng
        if(!err) {    //nếu kết nối với database thành công
            if(results.length <= 0 || results[0].password != user.password) {  //nếu không có bản ghi nào đc trả về(tức là sai email) hoặc mật khẩu ko khớp với tập bản ghi
                return res.status(401).json({message:"Incorrect username or password !!!"});
            } else if(results[0].status === 'false') {   //nếu tài khoản có status trong database là false
                return res.status(401).json({message:"Wait for admin approval !!!"});
            } else if(results[0].password == user.password) {    //nếu nhập đúng mật khẩu
                const response = {email: results[0].email, role: results[0].role};   //lưu email và mật khẩu vào biến cho đối tượng response
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn:'8h'});   //tạo token có thời hạn trong 8 giờ
                res.status(200).json({token:accessToken});   //hiển thị ra mã token
            } else {
                return res.status(400).json({message:"Something went wrong. Please try again later !!!"});
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post('/forgotPassword', (req, res)=>{      //forgot password
    const user = req.body;
    query = "select email,password from users where email=?";
    connection.query(query, [user.email], (err, results)=>{    //tạo tham số err và results
        if(!err) {
            if(results.length <= 0) {   
                return res.status(200).json({message:"Password sent successfully to your email !!!"});
            } else {
                var mailOption = {
                    from: process.env.EMAIL,    //người gửi
                    to: results[0].email,     ///mail nhận là mail cần lấy mật khẩu
                    subject: 'Password by Cafe Management System',
                    html: '<p><b>Your login detail for Cafe Management System</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href="http://localhost:4200/">Click here to login</a></p>'
                };
                //gửi mật khẩu cho tài khoản quên mật khẩu
                transporter.sendMail(mailOption, function(err, info) {   //gửi mail
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('Email sent: '+info.response);
                    }
                });
                return res.status(200).json({message:"Password sent successfully to your email !!!"});
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

//biến checkRole truy cập tới phương thức checkRole
router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res)=>{    
    var query = "select id,name,email,contactNumber,status from users where role='user'";  //lấy về bản ghi của tất cả user
    connection.query(query, (err, results)=>{
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res)=>{
    let user = req.body;
    var query = "update users set status=? where id=?";
    connection.query(query, [user.status,user.id], (err, results)=>{         //truyền vào tham số cho truy vấn
        if(!err) {
            if(results.affectedRows == 0) {   //nếu bản ghi không tồn tại
                return res.status(404).json({message:"User id does not exist!!!"});
            }
            return res.status(200).json({message:"User updated successfully!!!"});
        } else {
            return res.status(500).json(err);
        }
    });
});

router.get('/checkToken', auth.authenticateToken, (req, res)=>{
    return res.status(200).json({message:"True!!!"});
});

router.post('/changePassword',auth.authenticateToken,(req, res)=>{
    const user = req.body;
    const email = res.locals.email;   //lấy session email của tài khoản
    var query = "select * from users where email=? and password=?";
    connection.query(query,[email,user.oldPassword],(err,results)=>{   //truyền vào hằng số email và user
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old password!!!" });
            } else if (results[0].password = user.oldPassword) {    ///nếu nhập lại mật khẩu đúng
                query = "update users set password=? where email=?";
                connection.query(query,[user.newPassword,email],(err,results)=>{   //truyền truy vấn và các tham số
                    if(!err) {
                        return res.status(200).json({message:"Password successfully updated!!!"});
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({ message: "Something went wrong. Please try again later!!!" });
            }
        }
    });
});

module.exports = router;