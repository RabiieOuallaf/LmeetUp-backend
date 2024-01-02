let superAdminErrors = require('../../errors/errors.superAdmin')
const Superadmin = require('../../models/Users/model.superadmin')

const fs = require('fs');
const jwt = require('jsonwebtoken');

const {decryptData} = require('../../utils/encryptionUtil')


exports.verifyAuthHeaderToken = (req, res, next) => {


    const encryptedAccessToken =  req.headers['authorization']
    const encryptedRefreshToken = req.headers['refreshToken']

    if(!encryptedAccessToken)
        return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

    

    const certPathPublic = process.env.PUBLIC_KEY_PATH;

    try {
        const encryptedAccessTokenWithoutBearer = encryptedAccessToken.split(' ')[1]
        let decodedAccessToken = decryptData(encryptedAccessTokenWithoutBearer)
        const cert = fs.readFileSync(certPathPublic)

        jwt.verify(decodedAccessToken, cert, { algorithms: ['RS512'] }, (err, user) => {
            
            if (err) {
                return res.status(403).json({ error: superAdminErrors.superAdminError.Unauthorized });
            }

            if(user._id !== req.params.adminID)
                return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

            next()
        });

    } catch(err) {
        if(!encryptedRefreshToken)
            return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})
    }

   
}

exports.verifyCookieToken = (req, res, next) => {
    const jwtAccessToken = req.cookies.accessToken
    const authId = req.cookies.user_id

    if(!jwtAccessToken)
        return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

    const certPathPublic = process.env.PUBLIC_KEY_PATH;

    try {
        const cert = fs.readFileSync(certPathPublic)
        const token = jwtAccessToken

        jwt.verify(token, cert, { algorithms: ['RS512'] }, (err, user) => {
            if (err) {
                return res.status(403).json({ error: superAdminErrors.superAdminError.Unauthorized });
            }

            if(user._id !== authId)
                return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})

            next()
        });
    }
    catch(err) {
        return res.status(500).json({error: err})
    }
}

// exports.refreshToken = async (req, res, next) => {
//     try {
//         const jwtRefreshToken = req.cookies.refreshToken
//         const authIdCookie = req.cookies.user_id

//         if(!jwtRefreshToken)
//             return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized}
//         )



//     }
// }

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
