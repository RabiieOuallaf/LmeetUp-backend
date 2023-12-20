const Superadmin = require('./../models/model.superadmin')
let superAdminErrors = require('./../errors/errors.superAdmin')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { generateSaltedHash } = require('./../utils/generateHash')

exports.signup = async (req, res) => {
    try {
        if(req.body.confirmPass !== req.body.password || !req.body.confirmPass) {
            return res.status('400').json({error: superAdminErrors.superAdminError.passwordAndConfirmPasswordIsMatch})
        }

        const superadmin = new Superadmin(req.body)
        await superadmin.save()

        res.json(superadmin)
    }
    catch(error) {
        console.log(error)
        res.status(400).json({error: error})
    }
}

exports.CheckIfEmailIsExist = async (req, res, next) => {
    try {
        const count = await Superadmin.countDocuments({email: req.body.email}).exec()

        if (count !== 0)
            return res.status(400).json({ error: superAdminErrors.superAdminError.checkThisEmailIfAlreadyExist });

        next();
    }
    catch(error) {
        return res.status(400).json({ error: error });
    }
}

exports.signin = async (req, res) => {
    try {
        const Query = await Superadmin.findOne({email: req.body.email})
        if(!Query)
            return res.status(404).json({error: superAdminErrors.superAdminError.checkThisEmailIfNotExist})

            const hashedPassword = await generateSaltedHash(req.body.password, Query.password.salt, Query.password.uuid)

            if(hashedPassword.hash !== Query.password.hash)
                return res.status(401).json({error: superAdminErrors.superAdminError.invalidUserPassword})

            // expire after 1 hours exp: Math.floor(Date.now() / 1000) + (60 * 60)
            const certPath = process.env.PRIVATE_KEY_PATH;
            try {
                const cert = fs.readFileSync(certPath);
                const token = jwt.sign(
                    { _id: Query._id, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) },
                    cert,
                    { algorithm: 'RS512' }
                );
    
                Query.password = undefined;

                res.cookie('token', token, { expire: Math.floor(Date.now() / 1000) + (24 * 60 * 60) })
                res.cookie('user_id', Query._id)

                res.json({ userInfo: Query, token: token });
            } catch (readError) {
                res.status(500).json({ error: superAdminErrors.superAdminError.invalidCert });
            }
    }
    catch(error) {

    }
}

exports.getOneAdmin = async (req, res) => {
    res.json(req.userInfo)
}
