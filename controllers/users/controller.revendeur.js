const RevendeurModel = require("../../models/Users/model.revendeur");
const RevendeurErrors = require("../../errors/errors.revendeur");
const EventModel = require("../../models/Events/model.event");
const UserModel = require("../../models/Users/model.user");
const TicketModel = require("../../models/Tickets/model.ticket.model");
const BoughtTicketModel = require("../../models/Tickets/model.boughtTicket");

const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateSaltedHash } = require("../../utils/generateHash"); // Added import statement
const { encryptData } = require("../../utils/encryptionUtil");

const generateRevendeurRandomCode = (revendeurIdentityNumber) => {
  const randomNumber = Math.floor(Math.random() * 90 + 10);
  const randomCode = Math.random().toString(36).substring(3, 8);
  return `rev-${revendeurIdentityNumber}-${randomNumber}-${randomCode}`;
};

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

exports.sellTicket = async (req, res, next) => {
  try {
    const foundRevendeur = await RevendeurModel.findById(req.body.revendeur);
    const foundTicket = await TicketModel.findById(req.body.ticket);
    const foundEvent = await EventModel.findById(req.body.event);
    const foundUser = await UserModel.findById(req.body.user);

    if (!foundRevendeur || !foundTicket)
      return res.status(404).json({ error: "Revendeur or ticket not found" });

    if (!foundEvent || !foundUser)
      return res.status(404).json({ error: "Event or user not found" });

    if (foundEvent.tickets.length >= foundEvent.totalTickets)
      return res
        .status(400)
        .json({ error: "No available tickets for this event" });

    const isRevendeurAssignedToEvent = foundEvent.revendeur.some(
      (revendeur) => revendeur.toString() === foundRevendeur._id.toString()
    );


    if(!isRevendeurAssignedToEvent) {
      return res.status(400).json({ error: "Revendeur is not assigned to this event" });
    }

    
    const boughtTicketData = {
      ...req.body,
      price: foundTicket.price,
      code: generateRevendeurRandomCode(foundRevendeur.identityDocumentNumber),
    };

    console.log(boughtTicketData);
    const savedBoughTicket = await new BoughtTicketModel(
      boughtTicketData
    ).save();
    await savedBoughTicket.save();

    foundRevendeur.soldTickets = Array.isArray(foundRevendeur.soldTickets)
      ? foundRevendeur.soldTickets
      : [];
    foundRevendeur.soldTickets.push(savedBoughTicket._id);

    await foundRevendeur.save();

    return res.status(201).json(savedBoughTicket);
  } catch (error) {
    console.error("Error buying ticket:", error);
    res.status(400).json({ error });
  }
};

exports.getRevendeurSoldTickets = async (req, res) => {
  try {
    const revendeurId = req.params.id;

    const foundRevendeur = await RevendeurModel.findById(revendeurId).populate(
      "soldTickets"
    );

    if (!foundRevendeur)
      return res
        .status(404)
        .json({ error: RevendeurErrors.revendeurError.revendeurNotFound });

    if (foundRevendeur.soldTickets.length === 0)
      return res
        .status(404)
        .json({ error: "Revendeur didn't sell any ticket" });

    res.status(200).json(foundRevendeur.soldTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
