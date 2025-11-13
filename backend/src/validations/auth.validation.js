import Joi from "joi";

export const signupValidation = Joi.object({
  name: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().optional(),
  orgId: Joi.string().optional()
});
