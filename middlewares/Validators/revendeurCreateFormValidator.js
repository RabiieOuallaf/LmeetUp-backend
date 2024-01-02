const Joi = require("joi");

function formValidation(req, res, next) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const formSchema = Joi.object({
    firstName: Joi.string().required().min(3).max(25),
    lastName: Joi.string().required().min(3).max(25),
    email: Joi.string().required().pattern(new RegExp(emailRegex)),
    phoneNumber: Joi.string().required(),
    pseudo: Joi.string().required(),
    birthdate: Joi.date().required(),
    identityDocumentType: Joi.string().required(),
    identityDocumentNumber: Joi.string().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  });

  req.body.email = req.body.email.trim();
  const {value , error} = formSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  } else {
    req.body = value;
    next();
  }
}
module.exports = { formValidation }