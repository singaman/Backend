const Joi = require('joi');

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(255).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(255).required(),
  deviceInfo: Joi.object().optional()
});

function validateRegistration(data) {
  return registrationSchema.validate(data);
}

function validateLogin(data) {
  return loginSchema.validate(data);
}

module.exports = {
  validateRegistration,
  validateLogin
};
