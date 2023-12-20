let superAdminErrors = require('./../errors/errors.superAdmin')
const Superadmin = require('./../models/model.superadmin')

const fs = require('fs');
const jwt = require('jsonwebtoken');

exports.verifyAuhtHeaderToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader)
        return res.json({error: superAdminErrors.superAdminError.Unauthorized})

    const certPathPublic = process.env.PUBLIC_KEY_PATH;

    try {
        const cert = fs.readFileSync(certPathPublic)
        const token = authHeader.split(' ')[1]

        jwt.verify(token, cert, { algorithms: ['RS512'] }, (err, user) => {
            if (err) {
                return res.status(403).json({ error: superAdminErrors.superAdminError.Unauthorized });
            }

            if(user._id !== req.params.adminID)
                return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

            console.log("pass 1 => OK")
            next()
        });
    }
    catch(err) {
        return res.status(500).json({error: err})
    }
}

exports.verifyCookieToken = (req, res, next) => {
    const authJwtCookie = req.cookies.token
    const authIdCookie = req.cookies.user_id

    if(!authJwtCookie)
        return res.json({error: superAdminErrors.superAdminError.Unauthorized})

    const certPathPublic = process.env.PUBLIC_KEY_PATH;

    try {
        const cert = fs.readFileSync(certPathPublic)
        const token = authJwtCookie

        jwt.verify(token, cert, { algorithms: ['RS512'] }, (err, user) => {
            if (err) {
                return res.status(403).json({ error: superAdminErrors.superAdminError.Unauthorized });
            }

            if(user._id !== authIdCookie)
                return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

            console.log("pass 2 => OK")
            next()
        });
    }
    catch(err) {
        return res.status(500).json({error: err})
    }
}

exports.adminByID = async (req, res, next, id) => {
    try {
        if(!req.params.adminID || req.params.adminID == "null")
            return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

        const admin = await Superadmin.findById(id)

        if(!admin)
            res.status(404).json({error: superAdminErrors.superAdminError.checkThisEmailIfNotExist})

        admin.password = undefined;
        req.userInfo = admin

        next()
    }
    catch(err) {

    }
}

exports.signOut = (req, res) => {
    const cookies = req.cookies;

    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }

    res.json({
        message: superAdminErrors.superAdminError.Disconnected
    })
}
