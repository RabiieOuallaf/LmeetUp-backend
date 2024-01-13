const User = require("../../models/Users/model.user");
let userErrors = require("../../errors/errors.user");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateSaltedHash } = require("../../utils/generateHash");
const { encryptData } = require("../../utils/encryptionUtil");

exports.signup = async (req, res) => {
  try {
    if (
      req.body.confirmPassword !== req.body.password ||
      !req.body.confirmPassword
    )
      return res
        .status("400")
        .json({
          error: userErrors.userError.passwordAndConfirmPasswordIsMatch,
        });

    const createdUserModel = new User(req.body);
    await createdUserModel.save();

    res.json(createdUserModel);
  } catch (error) {
    console.log(error);
    res.status(200).json({ error: error });
  }
};

exports.CheckIfEmailIsExist = async (req, res, next) => {
  try {
    const count = await User.countDocuments({ email: req.body.email }).exec();

    if (count !== 0)
      return res
        .status(400)
        .json({ error: userErrors.userError.checkThisEmailIfAlreadyExist });

    next();
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.signin = async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });

    if (!foundUser) {
      return res.status(404).json({
        error: userErrors.userError.checkThisEmailIfNotExist,
      });
    }

    const hashedPassword = await generateSaltedHash(
      req.body.password,
      foundUser.password.salt,
      foundUser.password.uuid
    );
    if (hashedPassword.hash !== foundUser.password.hash) {
      return res.status(401).json({
        error: userErrors.userError.invalidUserPassword,
      });
    }

    const certPath = process.env.PRIVATE_KEY_PATH;
    try {
      const cert = fs.readFileSync(certPath);

      const accessToken = jwt.sign(
        {
          _id: foundUser._id,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      const refreshToken = jwt.sign(
        {
          _id: foundUser._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      const encryptedAccessToken = encryptData(accessToken);
      const encryptedRefreshToken = encryptData(refreshToken);

      foundUser.password = undefined;

      res.cookie("token", encryptedAccessToken, {
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      res.cookie("refreshToken", encryptedRefreshToken, {
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      res.cookie("user_id", foundUser._id);

      res.json({
        userInfo: foundUser,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      });
    } catch (readError) {
      console.error(readError); // Log the error for debugging
      res.status(500).json({
        error: userErrors.userError.invalidCert,
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

exports.getOneAdmin = async (req, res) => {
  res.json(req.userInfo);
};
