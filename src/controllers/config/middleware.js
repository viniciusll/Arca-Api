const jwt = require('jsonwebtoken')
const config = require('./config')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) { return res.status(401).send({ error: 'Nenhum token fornecido' }) }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) { return res.status(401).send({ error: 'erro no token' }) }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) { return res.status(401).send({ error: 'token está com malformato' }) }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: 'token invalido' })

    req.userId = decoded.id
    console.log(decoded)

    return next()
  })
}