let superAdminErrors = require("../../errors/errors.superAdmin");
const Superadmin = require("../../models/Users/model.superadmin");

const fs = require("fs");
const jwt = require("jsonwebtoken");

const { decryptData, encryptData } = require("../../utils/encryptionUtil");

exports.verifyAuthHeaderToken = async (req, res, next) => {
  const encryptedAccessToken = req.headers["authorization"];
  const encryptedRefreshToken = req.cookies.refreshToken;
  
  if (!encryptedAccessToken) {
    return res.status(401).json({ error: superAdminErrors.superAdminError.Unauthorized });
  }

  try {
    const encryptedAccessTokenWithoutBearer = encryptedAccessToken.split(" ")[1];
    const decryptedAccessToken = decryptData(encryptedAccessTokenWithoutBearer);
    const cert = fs.readFileSync(process.env.PUBLIC_KEY_PATH);

    let user;

    try {
      user = jwt.verify(decryptedAccessToken, cert, { algorithms: ["RS512"] });
    } catch (err) {
      // Token verification failed
      if (!encryptedRefreshToken) {
        return res.status(401).json({ error: superAdminErrors.superAdminError.Unauthorized });
      }

      const decryptedRefreshToken = decryptData(encryptedRefreshToken);

      if (!decryptedRefreshToken) {
        return res.status(401).json({ error: superAdminErrors.superAdminError.Unauthorized });
      }

      // Refresh the token
      const adminID = req.params.id;
      const certPathPrivate = process.env.PRIVATE_KEY_PATH;
      const certPrivate = fs.readFileSync(certPathPrivate);

      const newAccessToken = jwt.sign(
        {
          _id: adminID,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
        certPrivate,
        { algorithm: "RS512" }
      );
      const newRefreshToken = jwt.sign(
        {
          _id: adminID,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        certPrivate,
        { algorithm: "RS512" }
      );

      let encryptedNewAccessToken = encryptData(newAccessToken);
      let encryptedNewRefreshToken = encryptData(newRefreshToken);

      // Set the new tokens
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

      user = jwt.verify(newAccessToken, cert, { algorithms: ["RS512"] });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: superAdminErrors.superAdminError.Unauthorized });
  }
}



exports.verifyCookieToken = (req, res, next) => {
  const jwtAccessToken = req.cookies.accessToken;
  const authId = req.cookies.user_id;

  if (!jwtAccessToken)
    return res
      .status(401)
      .json({ error: superAdminErrors.superAdminError.Unauthorized });

  const certPathPublic = process.env.PUBLIC_KEY_PATH;

  try {
    const cert = fs.readFileSync(certPathPublic);
    const token = jwtAccessToken;

    jwt.verify(token, cert, { algorithms: ["RS512"] }, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ error: superAdminErrors.superAdminError.Unauthorized });
      }

      if (user._id !== authId)
        return res
          .status(401)
          .json({ error: superAdminErrors.superAdminError.Unauthorized });

      next();
    });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};



exports.adminByID = async (req, res, next, id) => {
  try {
    if (!req.params.adminID || req.params.adminID == "null")
      return res
        .status(401)
        .json({ error: superAdminErrors.superAdminError.Unauthorized });

    const admin = await Superadmin.findById(id);

    if (!admin)
      res.status(404).json({
        error: superAdminErrors.superAdminError.checkThisEmailIfNotExist,
      });

    admin.password = undefined;
    req.userInfo = admin;

    next();
  } catch (err) {}
};

exports.signOut = (req, res) => {
  const cookies = req.cookies;

  for (const cookieName in cookies) {
    res.clearCookie(cookieName);
  }

  res.json({
    message: superAdminErrors.superAdminError.Disconnected,
  });
};
