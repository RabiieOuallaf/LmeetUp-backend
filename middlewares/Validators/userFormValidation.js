const userErrors = require("../../errors/errors.user");
const Joi = require("joi");


function formValidation(req, res, next) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const formSchema = Joi.object({
        firstName: Joi.string().min(3).max(25).messages({
            "string.min": userErrors.userError.emptyFirstName,
            "string.max": userErrors.userError.emptyFirstName,
        }),
        lastName: Joi.string().min(3).max(25).messages({
            "string.min": userErrors.userError.emptyLastName,
            "string.max": userErrors.userError.emptyLastName,
        }),
        phoneNumber : Joi.string().max(24).messages({
            "string.min": userErrors.userError.emptyPhoneNumber,
            "string.max": userErrors.userError.emptyPhoneNumber,
        }),
        email:
            Joi.string()
            .required()
            .pattern(new RegExp(emailRegex))
            .messages({
                "string.empty": userErrors.userError.emptyEmail,
                "string.required": userErrors.userError.emptyEmail
            })
            .min(3)
            .max(90),
        identityDocumentNumber : Joi.string().max(10).messages({
            "string.min": userErrors.userError.emptyIdentityDocumentNumber,
            "string.max": userErrors.userError.emptyIdentityDocumentNumber,
        }),
        birthDate : Joi.date().messages({
            "date.empty": userErrors.userError.emptyBirthDate
        }),
        City : Joi.string().messages({
            "string.empty": userErrors.userError.emptyCity,
        }),
        password: Joi.string()
            .required()
            .messages({
                "string.empty": userErrors.userError.emptyPassword,
                "string.required": userErrors.userError.emptyPassword
            }),
        confirmPassword: Joi.string()
            .messages({
                "string.empty": userErrors.userError.emptyPassword
            })
        
    });
    const {value , error } = formSchema.validate(req.body)

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value; 
        next();
    }
}

module.exports = {formValidation}