const Laboratory = require('../models/laboratory.models');

const laboratoryServices = {
    
    async createLaboratory(name, address) {
        const laboratory = await Laboratory.create({
            name: name,
            status: 'Ativo',
            address: address
        });

        return await laboratory;
    }
};

module.exports = laboratoryServices;