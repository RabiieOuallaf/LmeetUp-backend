const ticketError = require('../../errors/error.ticket')
const Joi = require('joi')

function formValidation(req, res, next) {
    const formSchema = Joi.object({
    
        seatClass: Joi.string()
            .required(),
        quantityTotal: Joi.number()
            .required(),
        quantityOnline: Joi.number()
            .required(),
        quantityOffline: Joi.number()
            .required(),
        price: Joi.number()
            .required(),
        event: Joi.string()
            .required(),
        coupon: Joi.string()
            .required()
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


