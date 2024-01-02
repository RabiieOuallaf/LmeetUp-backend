const Revendeur = require('../../models/Users/model.revendeur')
const revendeurErrors = require('../../errors/errors.revendeur')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const {decryptData} = require('../../utils/encryptionUtil')

exports.verifyRevendeurHeaderToken = (req, res, next) => {

    const encryptedAccessToken =  req.headers['authorization']
    const encryptedRefreshToken = req.headers['refreshToken']


    if(!encryptedAccessToken)
        return res.status(401).json({error: revendeurErrors.revendeurError.Unauthorized})

    
    const certPathPublic = process.env.PUBLIC_KEY_PATH;

    try {
        const encryptedAccessTokenWithoutBearer = encryptedAccessToken.split(' ')[1]

        let decodedAccessToken = decryptData(encryptedAccessTokenWithoutBearer)

        const cert = fs.readFileSync(certPathPublic)
        jwt.verify(decodedAccessToken, cert, { algorithms: ['RS512'] }, (err, user) => {

            if (err) {
                return res.status(403).json({ error: revendeurErrors.revendeurError.Unauthorized });
            }

            if(user._id !== req.params.id)
                return res.status(401).json({error: revendeurErrors.revendeurError.Unauthorized})

            next()
        });

    } catch(err) {
        if(!encryptedRefreshToken)
            return res.status(401).json({error: revendeurErrors.revendeurError.Unauthorized})
    }

   
}