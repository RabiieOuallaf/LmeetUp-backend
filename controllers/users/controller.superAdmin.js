const SuperadminModel = require('../../models/Users/model.superadmin')
let superAdminErrors = require('../../errors/errors.superAdmin')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { generateSaltedHash } = require('../../utils/generateHash')
const {encryptData} = require('../../utils/encryptionUtil')

exports.signup = async (req, res) => {
    
    try {
        if(req.body.confirmPassword !== req.body.password || !req.body.confirmPassword) {
            return res.status('400').json({error: superAdminErrors.superAdminError.passwordAndConfirmPasswordIsMatch})
        }
        const createdSuperAdminModel = new SuperadminModel(req.body)
        await createdSuperAdminModel.save()

        res.json(createdSuperAdminModel)
        
    }
    catch(error) {
        res.status(400).json({error: error})
    }
}

exports.CheckIfEmailIsExist = async (req, res, next) => {
    try {
        const count = await SuperadminModel.countDocuments({email: req.body.email}).exec()

        if (count !== 0)
            return res.status(400).json({ error: superAdminErrors.superAdminError.checkThisEmailIfAlreadyExist });

        next();
    }
    catch(error) {
        return res.status(400).json({ error: error });
    }
}

exports.signIn = async (req, res) => {
    try {
        const Query = await SuperadminModel.findOne({email: req.body.email})
        if(!Query){
            return res.status(404).json({error: superAdminErrors.superAdminError.checkThisEmailIfNotExist})
        }

        const hashedPassword = await generateSaltedHash(req.body.password, Query.password.salt, Query.password.uuid)

        if(hashedPassword.hash !== Query.password.hash){
            return res.status(401).json({error: superAdminErrors.superAdminError.invalidUserPassword})
        }

        const certPath = process.env.PRIVATE_KEY_PATH;

        try {

            const cert = fs.readFileSync(certPath);
            const accessToken = jwt.sign(
                { _id: Query._id, exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60) },
                cert,   
                { algorithm: 'RS512' }
            )

            const refreshToken = jwt.sign(
                { _id: Query._id, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) },
                cert,
                { algorithm: 'RS512' }
            )
            // generate secret hash to use as encryption key
            let encryptedAccessToken = encryptData(accessToken)
            let encryptedRefreshToken = encryptData(refreshToken)
            Query.password = undefined;
            
            res.
            cookie('accessToken', encryptedAccessToken, 
                { 
                    maxAge: 3 * 60 * 60 * 1000,
                    sameSite: 'strict', // Prevent CSRF attacks 
                    secure: process.env.NODE_ENV === 'production', // Prevent http interception in production 
                }
            )
            res.
            cookie('refreshToken', encryptedRefreshToken,
                {
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                }
            )
            res.
            cookie('user_id', Query._id)

            res.
            json({ userInfo: Query , accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken});


        } catch (readError) {
            res.status(500).json({ error: superAdminErrors.superAdminError.invalidCert });
        }
    }
    catch(error) {
        res.status(400).json({error: error})
    }
}

exports.refreshToken = async (req, res, next) => {
        const jwtRefreshToken = req.refreshToken

        console.log(jwtRefreshToken)

        if(!jwtRefreshToken)
            return res.status(401).json({error: superAdminErrors.superAdminError.Unauthorized})
            next()

        const certPathPublic = process.env.PUBLIC_KEY_PATH;

        try {
            const cert = fs.readFileSync(certPathPublic)

            const newAccessToken = jwt.sign(
                { _id: req.params.adminID, exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60) },
                cert,
                { algorithm: 'RS512' }
            )
            
            const newRefreshToken = jwt.sign(
                { _id: req.params.adminID, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) },
                cert,
                { algorithm: 'RS512' }
            )
            
            let encryptedAccessToken = encryptData(newAccessToken)
            let encryptedRefreshToken = encryptData(newRefreshToken)

            res.
            cookie('accessToken', encryptedAccessToken, 
                { 
                    maxAge: 3 * 60 * 60 * 1000,
                    sameSite: 'strict', // Prevent CSRF attacks 
                    secure: process.env.NODE_ENV === 'production', // Prevent http interception in production 
                }
            )

            res.cookie('refreshToken', encryptedRefreshToken,
                {
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                }
            )

            res.json({ accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken});
        
        } catch(err) {
            return res.status(500).json({error: err})
        }
}
    


exports.getOneAdmin = async (req, res) => {
    try {
        const adminId = req.params.id
        const admin = await SuperadminModel.findById(adminId)
        if(!admin){
            return res.status(404).json({error: superAdminErrors.superAdminError.adminNotFound})
        }
        res.json({admin})
    }
    catch(error) {
        res.status(400).json({error: error})
    }
}




