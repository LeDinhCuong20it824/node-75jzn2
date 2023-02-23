require('dotenv').config();

//kiển tra tài khoản là user hay admin
function checkRole(req, res, next) {
    if(res.locals.role == process.env.USER) {
        res.sendStatus(401);
    } else {
        next();
    }
}

module.exports = {checkRole: checkRole}