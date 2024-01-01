const revendeudError = require("../../errors/errors.revendeur");
const Joi = require("joi");

function formValidation(req, res, next) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const formSchema = Joi.object({
    firstName: Joi.string().required().min(3).max(25).messages({
      "string.empty": revendeudError.revendeurError.emptyFirstName,
      "string.required": revendeudError.revendeurError.emptyFirstName,
    }),
    lastName: Joi.string().required().min(3).max(25).messages({
      "string.empty": revendeudError.revendeurError.emptyLastName,
      "string.required": revendeudError.revendeurError.emptyLastName,
    }),
    email: Joi.string().required().pattern(new RegExp(emailRegex)).messages({
      "string.empty": revendeudError.revendeurError.emptyEmail,
      "string.required": revendeudError.revendeurError.emptyEmail,
      "string.email": revendeudError.revendeurError.email,
    }),
    phoneNumber: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyPhoneNumber,
      "string.required": revendeudError.revendeurError.emptyPhoneNumber,
    }),
    pseudo: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyPseudo,
      "string.required": revendeudError.revendeurError.emptyPseudo,
    }),
    birthdate: Joi.date().required().messages({
      "string.empty": revendeudError.revendeurError.emptyBirthdate,
      "string.required": revendeudError.revendeurError.emptyBirthdate,
    }),
    identityDocumentType: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyIdentityDocumentType,
      "string.required":
        revendeudError.revendeurError.emptyIdentityDocumentType,
    }),
    identityDocumentNumber: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyIdentityDocumentNumber,
      "string.required":
        revendeudError.revendeurError.emptyIdentityDocumentNumber,
    }),
    password: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyPassword,
      "string.required": revendeudError.revendeurError.emptyPassword,
    }),
    confirmPassword: Joi.string().required().messages({
      "string.empty": revendeudError.revendeurError.emptyPassword,
      "string.required": revendeudError.revendeurError.emptyPassword,
    }),
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

module.exports = { formValidation };
