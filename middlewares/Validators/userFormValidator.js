let superAdminErrors = require('../../errors/errors.superAdmin')
const Joi = require("joi")

function formValidation(req, res, next) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const formSchema = Joi.object({
        name: Joi.string().min(3).max(25),
        email:
            Joi.string()
            .required()
            .pattern(new RegExp(emailRegex))
            .messages({
                "string.pattern.base": superAdminErrors.superAdminError.email,
                "string.empty": superAdminErrors.superAdminError.emptyEmail,
                "string.required": superAdminErrors.superAdminError.emptyEmail
            })
            .min(3)
            .max(90),
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
