const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const config = require('./config/config');

const router = express.Router();

const user = process.env.user;
const pass = process.env.pass;

const configEmail = (text, subject, to) => {
    const transporter = nodemailer.createTransport({
        host: 'mail1.placasexpress.com',
        port: 587,
        auth: { user, pass }
    });

    transporter.sendMail({
        from: user,
        to: to,
        subject: subject,
        html: text
    }).then(info => {
        console.log('success: ', info);
    }).catch(err => {
        console.log('error: ', err);
    });

};

const createToken = (params = {}) =>
    jwt.sign(params, config.secret, {
        expiresIn: 86400
    });

router.post('/register', async (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName
    } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'Usuário já existe' });
        }


        const user = await User.create({
            email: email,
            password: password,
            profile: [{
                email: email,
                firstName: firstName,
                lastName: lastName
            }]
        });

        user.password = undefined;

        const token = createToken({ user: user.id, email: user.email, confirmed: user.confirmed });

        const msg = `
            Valide seu token para conseguir acessar em nosso sistema.<br />

            acesse o link para validar automaticamente http://localhost:3001/authenticate/confirmed/${token}
        `;

        // configEmail(msg, 'Cadastro Arca: ', newUser.email);

        return res.status(201).send({ user, token });
    } catch (err) {
        return res.status(503).send({
            error: `Não foi possível se registrar ${err}`
        });
    };
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuário não existe' });

    if (user.confirmed == false)
        return res.status(400).send({ error: 'Você precisa confirmar seu token antes de logar' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(401).send({ error: 'Senha errada' });

    user.password = undefined;

    return res.status(202).send({ user, token: createToken({ user: user.id, email: user.email }) });
});

router.get('/confirmed/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const tokenDecoded = jwt.decode(token);

        if (!tokenDecoded)
            return res.status(401).send({ error: "token invalido" });

        console.log('token decoded: ', tokenDecoded);

        const userId = tokenDecoded.user;

        if (userId === undefined)
            return res.status(400).send({ error: 'Não foi possível confirmar o token, id undefined' });

        await User.findByIdAndUpdate(userId, { confirmed: true });

        res.redirect(301, "http://localhost:3000/confirmation");

    } catch (err) {
        res.send({ error: `error: ${e}` });
    }
})


router.put('/updateProfile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            emailProfile,
            firstName,
            lastName,
            city,
            country,
            cep,
            state,
            street,
            number,
            district,
            complement,
            description
        } = req.body;

        const user = await User.findById(userId);

        const updateProfile = {
            emailProfile: emailProfile,
            firstName: firstName,
            lastName: lastName,
            address: [{
                city: city,
                country: country,
                cep: cep,
                state: state,
                street: street,
                number: number,
                district: district,
                complement: complement
            }],
            description: description
        };

        user.profile = updateProfile;

        user.save();

        res.status(200).send({ updateProfile });
    } catch (err) {
        return res.status(503).send({
            error: `Não foi possível enviar as alterações ${err}`
        });
    }
});

module.exports = app => app.use('/authenticate', router);