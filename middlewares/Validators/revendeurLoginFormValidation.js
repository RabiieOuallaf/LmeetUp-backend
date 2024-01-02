const Joi = require("joi");

function loginFormValidation (req, res, next) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const formSchema = Joi.object({
        email:
            Joi.string()
            .required()
            .pattern(new RegExp(emailRegex)),
        password: Joi.string()
            .required(),
            
        confirmPassword: Joi.string()
    })

    const { value, error } = formSchema.validate(req.body)
    
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value; 
        next();
    }
}


module.exports = {loginFormValidation}