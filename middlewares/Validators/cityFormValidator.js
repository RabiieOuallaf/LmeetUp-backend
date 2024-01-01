const cityError = require('../../errors/error.city');
const Joi = require('joi');

function formValidation (req, res, next) {
    const formSchema = Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(25)
        
    })

    const { value, error } = formSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value;
        next();
    }
}

module.exports = { formValidation };