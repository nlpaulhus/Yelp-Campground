const baseJoi = require('joi')
const SanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = SanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
            }
        }
    }
})

const Joi = baseJoi.extend(extension)

const campgroundSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    city: Joi.string().required().escapeHTML(),
    state: Joi.string().required().escapeHTML(),
    price: Joi.number().min(0).required(),
    description: Joi.string().required().escapeHTML()
}).required()

module.exports = { campgroundSchema }

const reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().required().escapeHTML()
})

module.exports = { campgroundSchema, reviewSchema }