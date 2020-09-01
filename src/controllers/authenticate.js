const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

const User = require('../models/user');
const config = require('./config/config');

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const createToken = (params = {}) =>
    jwt.sign(params, config.secret, {
        expiresIn: 86400
    });

router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'Usuário já existe' });
        }

        const user = await User.create(req.body);

        user.password = undefined;

        const token = createToken({ user: user.id, email: user.email, confirmed: user.confirmed });

        const msg = `
            Valide seu token para conseguir acessar em nosso sistema.<br />

            acesse o link para validar automaticamente http://localhost:3001/authenticate/confirmed/${token}
        `;

        const msgUser = {
            to: user.email,
            from: 'vinicius@democraciadopovo.com.br',
            subject: 'Você está registrado em nosso sistema.',
            html: msg
          };

        sgMail.send(msgUser)
          .then(() => console.log('email enviado'));

        return res.status(201).send({ user, token });
    } catch (err) {
        return res.status(503).send({
            error: 'Não foi possível se registrar'
        });
    };
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuário não existe' });

    if (user.confirmed == false)
        return res.status(400).send({ error: 'Você precisa confirmar seu token antes de logar'});

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


module.exports = app => app.use('/authenticate', router);