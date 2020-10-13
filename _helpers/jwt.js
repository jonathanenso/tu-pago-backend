const expressJwt = require('express-jwt');
const config = require('../config.json');
const userService = require('../services/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // rutas públicas que no requieren autenticación
            '/users/authenticate',
            '/users/register',
            '/users/confirmEmail',
            '/users/forgot',
            /^\/users\/reset\/([^\/]*)$/,
            /^\/image\/([^\/]*)$/
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // Revocar token si el usuario ya no existe
    if (!user) {
        return done(null, true);
    }

    done();
};