const mongoose = require('mongoose');
const uri = 'mongodb+srv://Vincius:426351@arca-64kil.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(
    uri, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }, err => {
        const msg = err || "MongoDB connected";
        console.log('database', msg);
    }
);
mongoose.Promise = global.Promise;

module.exports = mongoose;