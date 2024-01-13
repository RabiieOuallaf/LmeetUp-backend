const benevolentError = require("../../errors/error.benevolent");
const Joi = require("joi");

const formValidator = (req, res, next) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const formSchema = Joi.object({
    firstName: Joi.string().min(2).max(15),
    lastName: Joi.string().min(2).max(15),
    email: Joi.string().required().pattern(new RegExp(emailRegex)),
    phoneNumber: Joi.string(),
    password: Joi.string().required(),
    confirmPassword: Joi.string(),
    pseudo: Joi.string(),
    birthdate: Joi.date(),
    identityDocumentType: Joi.string(),
    identityDocumentNumber: Joi.string(),
    function: Joi.string(),
  });

  const { value, error } = formSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } else {
    req.body = value;
    next();
  }
};

module.exports = { formValidator };
