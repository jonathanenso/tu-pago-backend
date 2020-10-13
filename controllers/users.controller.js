const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');//rutas
// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/update-user/:id', update);
router.delete('/:id', _delete);
router.post('/confirmEmail', confirmEmail);
router.post('/forgot', forgot);

router.get('/reset/:token', reset);
router.post('/reset/:token', restorePassword);

// storage user
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/users/')
    },
    filename: function (req, file, cb) {
      // randomBytes generar nombre random
      let customFileName = crypto.randomBytes(18).toString('hex')
      // obtener extension
      let fileExtension = path.extname(file.originalname).split('.')[1];
      cb(null, customFileName + '.' + fileExtension)
      
    }
})

var upload = multer({ storage: storage });
router.post('/upload-image/:id', upload.single("avatar"), uploadImage);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'El email o contraseña son inválidos' }))
        .catch(err => next(err));
}

/**
 * POST register
 */
function register(req, res, next) {
    userService.create(req.body)
        .then((data) =>{
            //Enviar email de activación de cuenta
            emailService.confirmation(data.user, data.userToken).then(()=>{
                res.json({})
            }).catch(err => next(err));
        })
        .catch(err => next(err));
}

function confirmEmail(req, res, next) {
    userService.confirmEmail(req.body)
    .then(() =>{
        res.json({})
    })
    .catch(err => next(err));
}

function forgot(req, res, next) {
    userService.forgotPassword(req.body)
    .then((data) =>{
        //Enviar para resetear contraseña
        emailService.sendPasswordEmail(data.user, data.token).then(()=>{
            res.json({})
        }).catch(err => next(err));
    })
    .catch(err => next(err));
}

function reset(req, res, next) {
    userService.validateToken(req.params.token)
    .then(() =>{
        res.json({})
    })
    .catch(err => next(err));
}

function restorePassword(req, res, next) {
    userService.restorePassword(req.params.token, req.body)
    .then((user) =>{
        //Enviar email de cambio de contraseña exitoso!
        emailService.successChangePassword(user);
        res.json({})
    })
    .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function uploadImage(req, res, next){
    userService.uploadFilePicture(req.params.id, req.file)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}