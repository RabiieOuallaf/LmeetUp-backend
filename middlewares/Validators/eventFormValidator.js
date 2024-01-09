const eventError = require("../../errors/error.event");
const Joi = require("joi");
function formValidation(req, res, next) {
  const formSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    category: Joi.string().hex().length(24).required().messages({
      "string.empty": eventError.eventError.emptyCategory,
      "string.required": eventError.eventError.emptyCategory,
    }),
    startTime: Joi.string().required().messages({
      "string.empty": eventError.eventError.emptyTime,
      "string.required": eventError.eventError.emptyTime,
    }),
    endTime: Joi.string().required().messages({
      "string.empty": eventError.eventError.emptyTime,
      "string.required": eventError.eventError.emptyTime,
    }),
    date: Joi.date().required().messages({
      "date.empty": eventError.eventError.emptyDate,
      "date.required": eventError.eventError.emptyDate,
    }),
    turnOver: Joi.number().required().messages({
      "number.empty": eventError.eventError.chiffreDaffaire,
      "number.required": eventError.eventError.chiffreDaffaire,
    }),
    totalTickets: Joi.number().required().messages({
      "number.empty": eventError.eventError.ticketTotal,
      "number.required": eventError.eventError.ticketTotal,
    }),
    totalTicketsOnline: Joi.number().required().messages({
      "number.empty": eventError.eventError.ticketTotal,
      "number.required": eventError.eventError.ticketTotal,
    }),
    totalTicketsOffline: Joi.number().required().messages({
      "number.empty": eventError.eventError.ticketTotal,
      "number.required": eventError.eventError.ticketTotal,
    }),
    image: Joi.binary().optional().messages({
      "any.empty": eventError.eventError.imageUrl,
      "any.required": eventError.eventError.imageUrl,
    }),
    miniature: Joi.binary().optional().messages({
      "any.empty": eventError.eventError.miniatureUrl,
      "any.required": eventError.eventError.miniatureUrl,
    }),
    videoUrl: Joi.string().required().messages({
      "any.empty": eventError.eventError.videoUrl,
      "any.required": eventError.eventError.videoUrl,
    }),
    city: Joi.string().hex().length(24).required().messages({
      "string.empty": eventError.eventError.city,
      "string.required": eventError.eventError.city,
    }),
    localisation: Joi.string().required().messages({
      "string.empty": eventError.eventError.localisation,
      "string.required": eventError.eventError.localisation,
    }),
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
