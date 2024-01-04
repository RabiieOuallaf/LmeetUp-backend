const classError = require('../../errors/error.class')
const Joi = require('joi')

function formValidation(req, res, next) {
        
        const formSchema = Joi.object({
            name : Joi.string()
                .required()
                .messages({
                    "string.empty": classError.classError.emptyName,
                    "string.required": classError.classError.emptyName
                }),
            description: Joi.string()
                .required()
                .messages({
                    "string.empty": classError.classError.emptyDescription,
                    "string.required": classError.classError.emptyDescription
                }),
            tickets : Joi.array()
                .optional()
        })
    
        const { error } = formSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
}

module.exports = { formValidation };