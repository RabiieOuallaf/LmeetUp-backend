const BenevolentModel = require("../../models/Users/model.benevolent");
const benevolentErrors = require("../../errors/error.benevolent");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateSaltedHash } = require("../../utils/generateHash");
const { encryptData } = require("../../utils/encryptionUtil");

exports.signUp = async (req, res) => {
  try {
    if (
      req.body.confirmPassword !== req.body.password ||
      !req.body.confirmPassword
    ) {
      return res
        .status(400)
        .json({
          error:
            benevolentErrors.benevolentError.passwordAndConfirmPasswordIsMatch,
        });
    }
    const createdBenevolentModel = new BenevolentModel(req.body);
    await createdBenevolentModel.save();

    res.status(201).json(createdBenevolentModel);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.checkIfEmailExists = async (req, res, next) => {
  try {
    const count = await BenevolentModel.countDocuments({
      email: req.body.email,
    }).exec();

    if (count !== 0)
      return res
        .status(400)
        .json({
          error: benevolentErrors.benevolentError.checkThisEmailIfAlreadyExist,
        });

    next();
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

exports.signIn = async (req, res) => {
  try {
    const foundBenevolent = await BenevolentModel.findOne({
      email: req.body.email,
    });

    if (!foundBenevolent) {
      return res
        .status(404)
        .json({
          error: benevolentErrors.benevolentError.checkThisEmailIfNotExist,
        });
    }
    const hashedPassword = await generateSaltedHash(
      req.body.password,
      foundBenevolent.password.salt,
      foundBenevolent.password.uuid
    );

    if (hashedPassword.hash !== foundBenevolent.password.hash) {
      return res
        .status(401)
        .json({ error: benevolentErrors.benevolentError.invalidUserPassword });
    }

    const certPath = process.env.PRIVATE_KEY_PATH;

    try {
      const cert = fs.readFileSync(certPath);

      const accessToken = jwt.sign(
        {
          _id: foundBenevolent._id,
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
        },
        cert,
        { algorithm: "RS256" }
      );

      const refreshToken = jwt.sign(
        {
          _id: foundBenevolent._id,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        },
        cert,
        { algorithm: "RS256" }
      );

      const encryptedAccessToken = encryptData(accessToken);
      const encryptedRefreshToken = encryptData(refreshToken);

      foundBenevolent.password = undefined;

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

      res.cookie("user_id", foundBenevolent._id);

      res.json({
        benevolent: foundBenevolent,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      });
    } catch (error) {
      console.error("Error in signIn:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error in signIn:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getOneBenevolent = async (req, res) => {
  try {
    const benevolentId = req.params.id;

    const benevolent = await BenevolentModel.findById(benevolentId);
    
    if (!benevolent) {
      return res
        .status(404)
        .json({ error: benevolentErrors.benevolentError.benevolentNotFound });
    }
    res.json({ benevolent });
  } catch (error) {
    console.error("Error in getOneBenevolent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
