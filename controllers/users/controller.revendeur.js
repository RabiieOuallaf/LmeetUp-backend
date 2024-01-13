const RevendeurModel = require("../../models/Users/model.revendeur");
const RevendeurErrors = require("../../errors/errors.revendeur");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateSaltedHash } = require("../../utils/generateHash");
const { encryptData } = require("../../utils/encryptionUtil");
const redisClient = require("../../utils/redisClient");

exports.signUp = async (req, res) => {
  try {
    if (
      req.body.confirmPassword !== req.body.password ||
      !req.body.confirmPassword
    ) {
      return res.status("400").json({
        error: RevendeurErrors.revendeurError.passwordAndConfirmPasswordIsMatch,
      });
    }
    const createdRevendeurModel = new RevendeurModel(req.body);
    await createdRevendeurModel.save();

    res.status(201).json(createdRevendeurModel);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.CheckIfEmailIsExist = async (req, res, next) => {
  try {
    const count = await RevendeurModel.countDocuments({
      email: req.body.email,
    }).exec();

    if (count !== 0)
      return res.status(400).json({
        error: RevendeurErrors.revendeurError.checkThisEmailIfAlreadyExist,
      });

    next();
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.signIn = async (req, res) => {
  try {
    const foundRevendeur = await RevendeurModel.findOne({
      email: req.body.email,
    });
    if (!foundRevendeur) {
      return res.status(404).json({
        error: RevendeurErrors.revendeurError.checkThisEmailIfNotExist,
      });
    }

    const hashedPassword = await generateSaltedHash(
      req.body.password,
      foundRevendeur.password.salt,
      foundRevendeur.password.uuid
    );

    if (hashedPassword.hash !== foundRevendeur.password.hash) {
      return res
        .status(401)
        .json({ error: RevendeurErrors.revendeurError.invalidUserPassword });
    }

    const certPath = process.env.PRIVATE_KEY_PATH;

    try {
      const cert = fs.readFileSync(certPath);
      const accessToken = jwt.sign(
        {
          _id: foundRevendeur._id,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      const refreshToken = jwt.sign(
        {
          _id: foundRevendeur._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        cert,
        { algorithm: "RS512" }
      );

      const encryptedAccessToken = encryptData(accessToken);
      const encryptedRefreshToken = encryptData(refreshToken);

      foundRevendeur.password = undefined;

      res.cookie("accessToken", encryptedAccessToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", encryptedRefreshToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("user_id", foundRevendeur._id);

      res.json({
        userInfo: foundRevendeur,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      });

    } catch (error) {
      res.status(500).json({ error: error });
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.getOneRevendeur = async (req, res) => {
  try {
    const revendeurId = req.params.id;

    const revendeur = await RevendeurModel.findById(revendeurId).populate(
      "events"
    );

    if (!revendeur) {
      return res
        .status(404)
        .json({ error: RevendeurErrors.revendeurError.revendeurNotFound });
    }

    res.status(200).json(revendeur);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};


exports.sellTicket = async (req, res,next) => {
  // Get revendeur 
  // Get ticket 
  // Save bought ticket in bough ticket collection 
  // save sold ticket in an array in revendeur
}