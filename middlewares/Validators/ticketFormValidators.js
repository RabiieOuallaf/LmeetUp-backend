const Joi = require('joi')

function formValidation(req, res, next) {
    const formSchema = Joi.object({
    
        class: Joi.string().hex().length(24)
            .required(),
        event: Joi.string().hex().length(24)
            .required(),
        coupon: Joi.string().hex().length(24)
            .required(),
        price: Joi.number().required()
    });
        

    const { value, error } = formSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value;
        next();
    }
}

module.exports = { formValidation }


