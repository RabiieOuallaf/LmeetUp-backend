const SuperadminModel = require('../models/Users/model.superadmin')
let superAdminErrors = require('./../errors/errors.superAdmin')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { generateSaltedHash } = require('./../utils/generateHash')
const {encryptData} = require('../helpers/encryptionHelper')

exports.signup = async (req, res) => {
    
    try {
        console.log(req.body.confirmPassword, req.body.password);
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
            cookie('accessToken', accessToken, 
                { 
                    maxAge: 3 * 60 * 60 * 1000,
                    sameSite: 'strict', // Prevent CSRF attacks 
                    secure: process.env.NODE_ENV === 'production', // Prevent http interception in production 
                }
            )
            res.
            cookie('refreshToken', refreshToken,
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

exports.getOneAdmin = async (req, res) => {
    res.json(req.userInfo)
}




