const Revendeur = require('../../models/Users/model.revendeur')
const revendeurErrors = require('../../errors/errors.revendeur')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const { decryptData, encryptData } = require('../../utils/encryptionUtil')

exports.verifyRevendeurHeaderToken = async (req, res, next) => {
    const encryptedAccessToken = req.headers['authorization'];
    const encryptedRefreshToken = req.cookies.refreshToken
  
    if (!encryptedAccessToken) {
      return res.status(401).json({ error: revendeurErrors.revendeurError.Unauthorized });
    }
  
    try {
      const encryptedAccessTokenWithoutBearer = encryptedAccessToken.split(' ')[1];
      let decryptedAccessToken = decryptData(encryptedAccessTokenWithoutBearer);
      const cert = fs.readFileSync(process.env.PUBLIC_KEY_PATH);
  
      let revendeur;
  
      try {
        revendeur = jwt.verify(decryptedAccessToken, cert, { algorithms: ['RS512'] });
      } catch (err) {
        if (!encryptedRefreshToken) {
          return res.status(401).json({ error: revendeurErrors.revendeurError.Unauthorized });
        }
  
        const decryptedRefreshToken = decryptData(encryptedRefreshToken);
  
        if (!decryptedRefreshToken) {
          return res.status(401).json({ error: revendeurErrors.revendeurError.Unauthorized });
        }
  
        const revendeurID = req.params.id;
        const certPathPrivate = process.env.PRIVATE_KEY_PATH;
        const certPrivate = fs.readFileSync(certPathPrivate);
  
        const newAccessToken = jwt.sign(
          {
            _id: revendeurID,
            exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
          },
          certPrivate,
          { algorithm: 'RS512' }
        );
  
        const newRefreshToken = jwt.sign(
          {
            _id: revendeurID,
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
  
        revendeur = jwt.verify(newAccessToken, cert, { algorithms: ['RS512'] });
      }
  
      req.revendeur = revendeur;
      next();
    } catch (err) {
      return res.status(401).json({ error: revendeurErrors.revendeurError.Unauthorized });
    }
  }
  