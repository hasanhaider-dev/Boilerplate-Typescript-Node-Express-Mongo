"use strict";
const Joi = require("celebrate").Joi;
const createAccountValidationModel = {
    body: {
        email: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        dob: Joi.date().required(),
        password: Joi.string().required(),
    },
};
const signInValidationModel = {
    body: {
        email: Joi.string().required(),
        password: Joi.string().required(),
    },
};

const validationModels = {createAccountValidationModel, signInValidationModel};
export default validationModels;
