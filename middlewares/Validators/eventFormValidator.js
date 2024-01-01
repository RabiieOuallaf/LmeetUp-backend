const eventError = require('../../errors/error.event')
const Joi = require('joi')

function formValidation(req, res, next) {
    
    const formSchema = Joi.object({
        category: Joi.string()
            .required()
            .min(3)
            .max(25)
            .messages({
                "string.empty": eventError.eventError.emptyCategory,
                "string.required": eventError.eventError.emptyCategory
            }),
        startTime: Joi.date()
            .required()
            .messages({
                "string.empty": eventError.eventError.emptyTime,
                "string.required": eventError.eventError.emptyTime
            }),
        endTime: Joi.date()
        .required()
        .messages({
            "string.empty": eventError.eventError.emptyTime,
            "string.required": eventError.eventError.emptyTime
        }),
        turnOver: Joi.number()
            .required()
            .messages({
                "string.empty": eventError.eventError.chiffreDaffaire,
                "string.required": eventError.eventError.chiffreDaffaire
            }),
        totalTickets: Joi.number()
            .required()
            .messages({
                "string.empty": eventError.eventError.ticketTotal,
                "string.required": eventError.eventError.ticketTotal
            }),
        image: Joi.binary()
            .optional()
            .messages({
                "any.empty": eventError.eventError.imageUrl,
                "any.required": eventError.eventError.imageUrl
            }),
        miniature: Joi.binary()
                .optional()
                .messages({
                    "any.empty": eventError.eventError.miniatureUrl,
                    "any.required": eventError.eventError.miniatureUrl
                }),
        videoUrl : Joi.string()
                .required()
                .messages({
                    "any.empty": eventError.eventError.videoUrl,
                    "any.required": eventError.eventError.videoUrl
                }),
        city: Joi.string()
            .required()
            .min(3)
            .max(25)
            .messages({
                "string.empty": eventError.eventError.city,
                "string.required": eventError.eventError.city
            })
    });
    const { value, error } = formSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    } else {
        req.body = value;
        next();
    }
}

module.exports = { formValidation };
