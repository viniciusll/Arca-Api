const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const config = require('./config/config');

const router = express.Router();

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

        return res.send({ user, token: createToken({ user: user.id, funcoes: user.funcoes, nome: user.name }) });
    } catch (err) {
        return res.status(400).send({
            error: 'Não foi possivel se registrar'
        });
    };
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'Usuario não existe' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Senha errada' });

    // user.password = undefined;

    return res.send({ user, token: createToken({ user: user.id, funcoes: user.funcoes, nome: user.name }) });
});

router.post('/updateFuncoes', async (req, res) => {

    try {
        // voce pode pegar o id via body.params também
        const { _id } = req.body;

        const user = await User.findByIdAndUpdate(_id, { ...req.body }, { new: true }).select('-password');
        
        console.log(user.funcoes);

        res.send({ user: user });
    } catch {
        res.status(400).send({ error: 'Erro em setar funcoes tente novamente' });
    };
});


router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select(' -password');
        res.send({ users: users });
    } catch {
        res.status(400).send({ error: 'Erro em pegar usuarios' });
    }
});

router.delete('/deleteUser', async (req, res) => {
    try {
        // aqui ele pega os Ids dos usuarios que serão deletados
        // tipo: array;
        const { ids } = req.body;
        console.log('IDS:', ids);

        await User.deleteMany({ _id: { $in: ids } });

        return res.send({ deletedCount: ids.length });
    } catch (e) {
        return res.status(400)
            .send({ error: `Error on delete users: ${e}` });
    }
});

module.exports = app => app.use('/auth', router);