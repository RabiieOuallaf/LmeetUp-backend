let eventError = require('../../errors/error.event')
const Joi = require("joi")

function formValidation(req, res, next) {
    const formSchema = Joi.object({

        category: Joi.
            string().
            required().
            min(3).
            max(25)
            .messages({
                "string.empty": eventError.eventError.emptyCategory,
                "string.required": eventError.eventError.emptyCategory
            }) 
        ,
        time: Joi.
            string().
            required().
            min(3).
            max(25).
            messages({
                "string.empty": eventError.eventError.emptyTime,
                "string.required": eventError.eventError.emptyTime
            }),

        chiffreDaffaire: Joi.
            string().
            required().
            min(3).
            max(25).
            messages({
                "string.empty": eventError.eventError.chiffreDaffaire,
                "string.required": eventError.eventError.chiffreDaffaire
            }),
        ticketTotal: Joi.
            string().
            required().
            min(3).
            max(25).
            message({
                "string.empty": eventError.eventError.ticketTotal,
                "string.required": eventError.eventError.ticketTotal
            }),
        imageUrl: Joi.
            string().
            required().
            min(3).
            max(25).
            message({
                "string.empty": eventError.eventError.imageUrl,
                "string.required": eventError.eventError.imageUrl
            }),
        city: Joi.
            string().
            required().
            min(3).
            max(25).
            message({
                "string.empty": eventError.eventError.city,
                "string.required": eventError.eventError.city
            })
    });

    const {value , error } = formSchema.validate(req.body)

    if(error) {
        return res.status(400).json({error: error.details[0].message});
    } else {
        req.body = value;
        next();
    }
}

module.exports = {formValidation}