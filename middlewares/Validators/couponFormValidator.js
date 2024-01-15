const couponError = require('../../errors/error.coupon');
const Joi = require('joi');

function formValidation (req, res, next) {
    const formSchema = Joi.object({
        code: Joi.string()
            .required()
            .min(3)
            .max(25)
            .messages({
                "string.empty": couponError.couponError.couponCodeEmpty,
                "string.required": couponError.couponError.couponCodeEmpty
            }),
        discount: Joi.number()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeDiscountEmpty,
                "string.required": couponError.couponError.couponCodeDiscountEmpty
            }),
        class: Joi.string().required(),
        startDate: Joi.date()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeExpirationDate,
                "string.required": couponError.couponError.couponCodeExpirationDate
            }),
        type: Joi.string()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeDiscountType,
                "string.required": couponError.couponError.couponCodeDiscountType
            }),
        event: Joi.string()
            .required(),
        creator: Joi.string()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeCreator,
                "string.required": couponError.couponError.couponCodeCreator
            }),
        expirationDate: Joi.date()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeExpirationDate,
                "string.required": couponError.couponError.couponCodeExpirationDate
            }),
        isActive: Joi.boolean()
            .required()
            .messages({
                "string.empty": couponError.couponError.couponCodeActive,
                "string.required": couponError.couponError.couponCodeActive
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