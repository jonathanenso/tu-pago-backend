const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const roles = require('../enums/roles.enum');
const userStatus = require('../enums/user.status.enum');
const User = db.User;
const Token = db.Token;
const criptoHelper = require('../_helpers/crypto');
const fs = require('fs');//archivos
const path = require('path');//rutas

let userService = {

    /**
     * Función para autenticar usuario
     * 
     * @param {string} email Correo 
     * @param {string} password Contraseña 
     */
    authenticate: async ({ email, password }) => {
        const user = await User.findOne({ email });
        
        //Verificar cuenta verificada
        if (user && !user.isVerified)
            throw 'Tu cuenta no ha sido verificada';

        if (user && bcrypt.compareSync(password, user.hash)) {
            const token = jwt.sign({ sub: user.id }, config.secret);

            return {
                ...user.toJSON(),
                token
            };
        }
    },

    /**
     * Funcion para obtener todos los usuarios
     */
    getAll: async () => {
        return await User.find();
    },

    /**
     * Función para obtener usuario por id
     *  
     * @param {string} id 
     */
    getById: async (id) => {
        return await User.findById(id);
    },

    /**
     * Función para registrar usuario
     * 
     * @param {params} userParam 
     */
    create: async (userParam) => {
        // Buscar email
        if (await User.findOne({ email: userParam.email })) {
            // return { success: false, message: 'El email ya está registrado' };
            throw 'El email ya está registrado';
        }

        //añadir rol y estado de usuario 
        // userParam.role = roles.rol.STUDENT;
        userParam.status = userStatus.status.ACTIVE;

        const user = new User(userParam);
 
        // encriptar pass
        if (userParam.password) {
            user.hash = bcrypt.hashSync(userParam.password, 10);
        }

        var userToken;

        const userSaved = await user.save();

        if(userSaved){
            //Generar token user._id + @@ + user.email
            userToken = criptoHelper.encrypt(`${user._id}@@${user.email}`);

            // Crear token de verificación para el usuario
            const token = new Token({ user: user._id, token: userToken });

            // Guardar token
            token.save();
        }

        return { user: userSaved, userToken };
    },

    /**
     * Función para confirmar email
     * Activar usuario registrado
     * 
     * @param {params} userParam 
     */
    confirmEmail: async (userParam) => {

        //Buscar token
        const token = await Token.findOne({ token: userParam.token });

        if (!token) throw Error('No pudimos encontrar un token válido. Tu email ha expirado.');

        //Decrypt token
        decryptToken = criptoHelper.decrypt(userParam.token);

        //Obtener email del token para asegurar la confimación
        let dataToken =  decryptToken.split('@@');
        let email = dataToken[1];

        const user = await User.findOne({ _id: token.user, email: email});

        if (!user) 
            throw 'No pudimos encontrar un usuario para este token.';
        
        if (user.isVerified) 
            throw 'Este usuario ya ha sido verificado.'; 

        // Verify and save the user
        user.isVerified = true;
        user.isVerifiedEmail = true;
        user.save();

    },

    /** 
     * Generar token para cambio de contraseña 
     * 
     * @param {params} userParam 
     */
    forgotPassword: async (userParam) => {

        //Generar token
        let token =  criptoHelper.randomBytes(20);
    
        //Buscar 
        const user = await User.findOne({ email: userParam.email });

        if (!user) 
            throw 'No existe una cuenta con esa dirección de correo electrónico.';
        
        if (!user.isVerified) 
            throw 'Este usuario no ha sido verificado.'; 

        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now()+3600000; // 1 hora

        await user.save();

        return { user , token };

    },

    /** 
     * Verificar token cambio de contraseña
     * 
     * @param {params} userParam 
     */
    validateToken: async (token) => {

        const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

        if (!user) 
            throw 'El token de restablecimiento de contraseña no es válido o ha expirado.';
        
        if (!user.isVerified) 
            throw 'Este usuario no ha sido verificado.'; 

    },

    /** 
     * Reestablecimiento de contraseña
     * 
     * @param {params} userParam 
     */
    restorePassword: async (token, userParam) => {

        const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

        if (!user) 
            throw 'El token de restablecimiento de contraseña no es válido o ha expirado.';
        
        if (!user.isVerified) 
            throw 'Este usuario no ha sido verificado.'; 
        
        //actualizar data
        user.hash = bcrypt.hashSync(userParam.password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        user.save();

        return user;
    },
    

    /**
     * Función para actualizar usuario
     * 
     * @param {id} id de usuario 
     * @param {params} userParam
     */
    update: async (id, userParam) => {
        const user = await User.findById(id);

        // Validar
        if (!user) throw 'Usuario no encontrado';

        // Encriptar password si fue ingresado
        if (userParam.password) {
            userParam.hash = bcrypt.hashSync(userParam.password, 10);
        }

        // copiar propiedades de userParam a user
        Object.assign(user, userParam);

        await user.save();
    },

    /**
     * Función para actualizar usuario
     * 
     * @param {id} id de usuario 
     * @param {params} userParam
     */
    uploadFilePicture: async (id, image) => {
        //Validar que existe el archivo
        if (!image) {
            throw 'No se ha seleccionado ningún archivo' 
        }

        //obtener nombre del archivo cargado
        let fileName = image.filename;
        
        const user = await User.findById(id);
    
        if (!user){
            //eliminar archivo del server
            deleteFile(fileName);
            throw 'Usuario no econtrado' 
        }

        //obtener nombre de imagen original
        let userImage = image.originalname;
        let splitName = userImage.split('.');
        //obtener extension del archivo
        let extension = splitName[splitName.length - 1];

        // Extensiones permitidas
        let validEstensions = ['png', 'jpg', 'jpeg'];
        
        //validar correcta extension
        if (validEstensions.indexOf(extension) < 0) {

            //eliminar archivo del server
            deleteFile(fileName);
            throw 'Las extensiones permitidas son ' + validEstensions.join(', ');
        }

        //Imagen anterior
        var previousImage = user.image;

        //Asignar nuevo nombre
        user.image = fileName;

        await user.save((err, doc) => {
            if (err) console.error(err);
            if(previousImage){
                //eliminar archivo anterior
                deleteFile(previousImage);
            }
        });

        return user;
        
    },

    /**
     * Función para eliminar usuario
     * 
     * @param {string} id de usuario
     */
    _delete: async (id) => {
        await User.findByIdAndRemove(id);
    }

}

/**
 * Elimina un archivo cargado
 * 
 * @param {String} imageName 
 */
function deleteFile(imageName) {
    
    try {
        //obtener ruta de archivo
        let pathImagen = path.resolve(__dirname, `../public/uploads/users/${ imageName }`);

        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = userService;