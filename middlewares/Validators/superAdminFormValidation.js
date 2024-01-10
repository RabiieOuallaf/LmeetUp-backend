let superAdminErrors = require('../../errors/errors.superAdmin')
const Joi = require("joi")

function formValidation(req, res, next) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const formSchema = Joi.object({
        fullName: Joi.string().min(3).max(25),
        email:
            Joi.string()
            .required()
            .pattern(new RegExp(emailRegex))
            .messages({
                "string.empty": superAdminErrors.superAdminError.emptyEmail,
                "string.required": superAdminErrors.superAdminError.emptyEmail
            })
            .min(3)
            .max(90),
        phoneNumber: 
            Joi.string()
            .messages({
                "string.empty": superAdminErrors.superAdminError.emptyPhoneNumber,
            })
            .max(24),
        logoUrl: Joi.string().messages({
            "string.empty": superAdminErrors.superAdminError.emptyLogoUrl,
        }),
        pseudo: Joi.string().messages({
            "string.empty": superAdminErrors.superAdminError.emptyPseudo,
        }),
        password: Joi.string()
            .required()
            .messages({
                "string.empty": superAdminErrors.superAdminError.emptyPassword,
                "string.required": superAdminErrors.superAdminError.emptyPassword
            }),
        confirmPassword: Joi.string()
            .messages({
                "string.empty": superAdminErrors.superAdminError.emptyPassword
            })
    });

    const { value, error } = formSchema.validate(req.body)
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value; 
        next();
    }
}

module.exports = {formValidation}
