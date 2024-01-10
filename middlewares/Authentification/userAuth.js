let userErrors = require('../../errors/errors.user')
const User = require('../../models/Users/model.user')

const fs = require('fs');
const jwt = require('jsonwebtoken');
const { decryptData, encryptData } = require('../../utils/encryptionUtil')


exports.verifyAuthHeaderToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!authHeader) {
        return res.status(401).json({ error: userErrors.userError.Unauthorized });
    }

    try {
        const certPathPublic = process.env.PUBLIC_KEY_PATH;
        const cert = fs.readFileSync(certPathPublic);
        const token = authHeader.split(' ')[1];

        let user;

        try {
            user = jwt.verify(token, cert, { algorithms: ['RS512'] });
        } catch (err) {
            if (!refreshTokenCookie) {
                return res.status(401).json({ error: userErrors.userError.Unauthorized });
            }

            const decryptedRefreshToken = decryptData(refreshTokenCookie);

            if (!decryptedRefreshToken) {
                return res.status(401).json({ error: userErrors.userError.Unauthorized });
            }

            const userID = req.params.adminID;
            const certPathPrivate = process.env.PRIVATE_KEY_PATH;
            const certPrivate = fs.readFileSync(certPathPrivate);

            const newAccessToken = jwt.sign(
                {
                    _id: userID,
                    exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
                },
                certPrivate,
                { algorithm: 'RS512' }
            );

            const newRefreshToken = jwt.sign(
                {
                    _id: userID,
                    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                },
                certPrivate,
                { algorithm: 'RS512' }
            );

            let encryptedNewAccessToken = encryptData(newAccessToken);
            let encryptedNewRefreshToken = encryptData(newRefreshToken);

            res.cookie('accessToken', encryptedNewAccessToken, {
                maxAge: 3 * 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            res.cookie('refreshToken', encryptedNewRefreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            user = jwt.verify(newAccessToken, cert, { algorithms: ['RS512'] });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: userErrors.userError.Unauthorized });
    }
}


exports.adminByID = async (req, res, next, id) => {
    try {
        if(!req.params.adminID || req.params.adminID == "null")
            return res.status(401).json({error: userErrors.userError.Unauthorized})

        const admin = await User.findById(id)

        if(!admin)
            res.status(404).json({error: userErrors.userError.checkThisEmailIfNotExist})

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
        message: userErrors.userError.Disconnected
    })
}
