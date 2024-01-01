const categoryError = require('../../errors/error.category')
const Joi = require('joi')

function formValidation(req,res,next) {
    const formSchema = Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(15)
            .messages({
                "string.empty" : categoryError.categoryError.emptyName,
                "string.required" : categoryError.categoryError.emptyName
            }),
        description: 
                Joi.string()
                .required()
                .min(10)
                .max(150)
                .messages({
                    "string.empty" : categoryError.categoryError.emptyDescription,
                    "string.required" : categoryError.categoryError.emptyDescription
                }),
        events : 
                Joi.array()
                .items(Joi.string())
                .messages({
                    "string.empty" : categoryError.categoryError.emptyEvents,
                    "string.required" : categoryError.categoryError.emptyEvents
                })
    })


    const {value , error} = formSchema.validate(req.body);

    if(error) {
        return res.status(400).json({error: error.details[0].message})
    }else {
        req.body = value;
        next();
    }

}

module.exports = { formValidation }