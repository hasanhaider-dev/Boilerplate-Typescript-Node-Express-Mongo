// ************* AUDIT LOG *************
// Author            : Hasan Haider
// Version           : 1.0
// Created At        : 30 Jun 2020
// Description       : This file helps to validate data of the incoming requests.

"use strict";
const Joi = require("celebrate").Joi;
const validationmodel = {
    body: {
        payloadName: Joi.string(),
        payloadDate: Joi.date(),
    },
};
export default validationmodel;
