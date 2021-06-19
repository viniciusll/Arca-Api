const express = require('express');

const Laboratory = require('../models/laboratory.models');
const LaboratoryServices = require('../services/laboratory.service');

const router = express.Router();

const createLaboratory = async (req, res) => {
    try {
        const { name, address } = req.body;

        if (!name) {
            if (await Laboratory.findOne({ name }))
            {
                return res.status(404).send({ error: 'There is already a laboratory with this name!' })
            }
            return res.status(400).send({ error: 'The name field is required!' })
        };

        if (
            !address.city && 
            !address.country && 
            !address.country && 
            !address.cep && 
            !address.state && 
            !address.street && 
            !address.district) {
            return res.status(400).send({ error: 'All mandatory address fields must be completed.' })
        };

        const newLaboratory = await LaboratoryServices.createLaboratory(name, address);

        return res.send({ newLaboratory });
    } catch (error) {
        res.status(400).send({ error: `It was not possible to create the laboratory ${error}` })
    };
};

router.post('/', createLaboratory);

module.exports = app => app.use('/laboratory', router);