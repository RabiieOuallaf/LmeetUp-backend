const classError = require('../../errors/error.class')
const Joi = require('joi')

function formValidation(req, res, next) {
        
        const formSchema = Joi.object({
            name : Joi.string()
                .required()
                .messages({
                    "string.empty": classError.classError.classNameEmpty,
                    "string.required": classError.classError.classNameEmpty
                }),
            description: Joi.string()
                .required()
                .messages({
                    "string.empty": classError.classError.classDescriptionEmpty,
                    "string.required": classError.classError.classDescriptionEmpty
                }),
            ticket : Joi.string().hex().length(24)
                .required()
                .messages({
                    "string.empty": classError.classError.classTicketEmpty,
                    "string.required": classError.classError.classTicketEmpty
                })
        })
    
        const { error } = formSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
}

module.exports = { formValidation };