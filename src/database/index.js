const mongoose = require('mongoose');

const uri = 'mongodb+srv://Admin:yUY2QpNm1sF01Ax2@cliniccluster.m8z8o.mongodb.net/clinic?retryWrites=true&w=majority';

mongoose.connect(
    uri, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }, err => {
        const msg = err || "MongoDB connected";
        console.log('database', msg);
    }
);
mongoose.Promise = global.Promise;

module.exports = mongoose;