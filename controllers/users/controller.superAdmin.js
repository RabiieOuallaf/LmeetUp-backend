const SuperadminModel = require("../../models/Users/model.superadmin");
let superAdminErrors = require("../../errors/errors.superAdmin");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateSaltedHash } = require("../../utils/generateHash");
const { encryptData } = require("../../utils/encryptionUtil");

exports.signup = async (req, res) => {
  try {
    if (
      req.body.confirmPassword !== req.body.password ||
      !req.body.confirmPassword
    ) {
      return res.status("400").json({
        error:
          superAdminErrors.superAdminError.passwordAndConfirmPasswordIsMatch,
      });
    }
    const superAdminData = {
      ...req.body,
      logoUrl: req.file.path,
    };
    console.log(superAdminData);
    const createdSuperAdminModel = new SuperadminModel(superAdminData);
    await createdSuperAdminModel.save();

    res.json(createdSuperAdminModel);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.CheckIfEmailIsExist = async (req, res, next) => {
  try {
    const count = await SuperadminModel.countDocuments({
      email: req.body.email,
    }).exec();

    if (count !== 0)
      return res.status(400).json({
        error: superAdminErrors.superAdminError.checkThisEmailIfAlreadyExist,
      });

    next();
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.signIn = async (req, res) => {
  try {
    const foundSuperAdmin = await SuperadminModel.findOne({
      email: req.body.email,
    });
    if (!foundSuperAdmin) {
      return res.status(404).json({
        error: superAdminErrors.superAdminError.checkThisEmailIfNotExist,
      });
    }

    const hashedPassword = await generateSaltedHash(
      req.body.password,
      foundSuperAdmin.password.salt,
      foundSuperAdmin.password.uuid
    );

    if (hashedPassword.hash !== foundSuperAdmin.password.hash) {
      return res
        .status(401)
        .json({ error: superAdminErrors.superAdminError.invalidUserPassword });
    }

    const certPath = process.env.PRIVATE_KEY_PATH;

    try {
      const cert = fs.readFileSync(certPath);
      const accessToken = jwt.sign(
        {
          _id: foundSuperAdmin._id,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      const refreshToken = jwt.sign(
        {
          _id: foundSuperAdmin._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      let encryptedAccessToken = encryptData(accessToken);
      let encryptedRefreshToken = encryptData(refreshToken);
      foundSuperAdmin.password = undefined;

      res.cookie("accessToken", encryptedAccessToken, {
        maxAge: 3 * 60 * 60 * 1000,
        sameSite: "strict", // Prevent CSRF attacks
        secure: process.env.NODE_ENV === "production", // Prevent http interception in production
      });
      res.cookie("refreshToken", encryptedRefreshToken, {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      res.cookie("user_id", foundSuperAdmin._id);

      res.json({
        userInfo: foundSuperAdmin,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      });
    } catch (readError) {
      res
        .status(500)
        .json({ error: superAdminErrors.superAdminError.invalidCert });
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.getOneAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await SuperadminModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ error: superAdminErrors.superAdminError.adminNotFound });
    }
    res.json({ admin });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
