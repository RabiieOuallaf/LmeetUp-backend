const fs = require('fs')
const jwt = require('jsonwebtoken')
const { decryptData, encryptData } = require('../../utils/encryptionUtil')
const benevolentErrors = require('../../errors/error.benevolent')

exports.verifyBenevolentHeaderToken = async (req, res, next) => {
    const encryptedAccessToken = req.headers['authorization'];
    const encryptedRefreshToken = req.cookies.refreshToken;
    
    if (!encryptedAccessToken) {
      return res.status(401).json({ error: benevolentErrors.benevolentError.Unauthorized });
    }

    try {
        const encryptedAccessTokenWithoutBearer = encryptedAccessToken.split(' ')[1];
        let decryptedAccessToken = decryptData(encryptedAccessTokenWithoutBearer);
        const cert = fs.readFileSync(process.env.PUBLIC_KEY_PATH);

        let benevolent;

        try {
            benevolent = jwt.verify(decryptedAccessToken, cert, { algorithms: ['RS512'] });

        } catch (err) {
            if(!encryptedRefreshToken) {
                return res.status(401).json({ error: benevolentErrors.benevolentError.Unauthorized });
            }
        

        const decryptedRefreshToken = decryptData(encryptedRefreshToken);

        if(!decryptedRefreshToken) {
            return res.status(401).json({ error: benevolentErrors.benevolentError.Unauthorized });
        }

        const benevolentID = req.params.id;
        const certPathPrivate = process.env.PRIVATE_KEY_PATH;
        const certPrivate = fs.readFileSync(certPathPrivate);

        const newAccessToken = jwt.sign(
            {
                _id: benevolentID,
                exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
            },
            certPrivate,
            { algorithm: 'RS512' }
        );

        const newRefreshToken = jwt.sign(
            {
                _id: benevolentID,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            },
            certPrivate,
            { algorithm: 'RS512' }
        );

        let encryptedNewAccessToken = encryptData(newAccessToken);
        let encryptedNewRefreshToken = encryptData(newRefreshToken);

        res.cookie('accessToken', encryptedNewAccessToken, {
            maxAge: 3 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.cookie('refreshToken', encryptedNewRefreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        benevolent = jwt.verify(newAccessToken, cert, { algorithms: ['RS512'] });

    }

    req.benevolent = benevolent;
    next()
    } catch (err) {
        return res.status(401).json({ error: benevolentErrors.benevolentError.Unauthorized });
    }
}