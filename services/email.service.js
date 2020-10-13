const config = require('../config.json');
const db = require('../_helpers/db');
const User = db.User;
const LogEmail = db.LogEmail;
const MailConfig = require('../_helpers/email-config');
const hbs = require('nodemailer-express-handlebars');
const smtpTransport = MailConfig.SMTPTransport;
const emailType = require('../enums/email.type.enum');
const emailFromOption = '"TU PAGO" <mailtest@hersymac.com>';
let emailService = {

    /**
     * Enviar email de confirmación para activación de cuenta
     * 
     * @param {object} user usuario registrado
     */
    confirmation: async (user, token) => {

        var result = new Promise((resolve, reject) => {

            try {
                MailConfig.ViewOption(smtpTransport, hbs);
                let HelperOptions = {
                    from: emailFromOption,
                    to: config.dev == "1" ? config.email_dev : user.email,
                    subject: 'Confirmación de correo',
                    template: 'confirm.email',
                    context: {
                        names:user.firstName,
                        url:`${config.urlClient}confirm/${token}`
                    }
                };
        
                //Verificar smtp y enviar email
                //Si el email falla se elimina el usuario ya que no puede confirmar
                smtpTransport.verify((error, success) => {
                    if(error) {
                        User.findOneAndDelete(user._id).exec();
                        reject(Error('Ocurrió un error durante el registro, intente más tarde'));
                    } else {
                        smtpTransport.sendMail(HelperOptions, (error, info) => {
                            if(error) {
                                User.findByIdAndRemove(user._id).exec();
                                RegisterLogEmail(user, error.code, user.email, emailFromOption, 'Confirmación de correo', 'failed', emailType.type.REGISTER );
                                reject(Error('Ocurrió un error durante el registro, intente más tarde'));
                            }
                            RegisterLogEmail(user, info.response, user.email, emailFromOption, 'Confirmación de correo', info.response, emailType.type.REGISTER );
                            resolve('Confirma tu email para activar tu cuenta');
                        });
                    }
                }); 
            } catch (error) {
                User.findByIdAndRemove(user._id).exec();
                reject(Error('Ocurrió un error durante el registro, intente más tarde'));
            }
           
        });

        return result;
        
    },


    /**
     * Enviar email para resetear contraseña
     * 
     * @param {Object} user usuario registrado
     * @param {string} token de expiración
     */
    sendPasswordEmail: async (user, token) => {

        var result = new Promise((resolve, reject) => {

            try {
                MailConfig.ViewOption(smtpTransport, hbs);
                let HelperOptions = {
                    from: emailFromOption,
                    to: config.dev == "1" ? config.email_dev : user.email,
                    subject: 'Recuperar contraseña',
                    template: 'forgot',
                    context: {
                        names:user.firstName,
                        url:`${config.urlClient}requestpwd/${token}`
                    }
                };
        
                //Verificar smtp y enviar email
                smtpTransport.verify((error, success) => {
                    if(error) {
                        reject(Error('Ocurrió un error enviando el email, intente más tarde'));
                    } else {
                        smtpTransport.sendMail(HelperOptions, (error, info) => {
                            if(error) {
                                //Log Email
                                RegisterLogEmail(user, error.code, user.email, emailFromOption, 'Recuperar contraseña', 'failed', emailType.type.RESET_PASSWORD );
                                reject(Error('Ocurrió un error enviando el email, intente más tarde'));
                            }
                            RegisterLogEmail(user, info.response, user.email, emailFromOption, 'Recuperar contraseña', info.response, emailType.type.RESET_PASSWORD );
                            resolve('Se ha enviado un email a su cuenta para recuperar contraseña');
                        });
                    }
                }); 
            } catch (error) {
                reject(Error('Ocurrió un error enviando el email, intente más tarde'));
            }
           
        });

        return result;
        
    },

    /**
     * Enviar email cambio de contraseña exitoso
     * 
     * @param {Object} user usuario registrado
     */
    successChangePassword: async (user) => {

        try {
            MailConfig.ViewOption(smtpTransport, hbs);
            let HelperOptions = {
                from: emailFromOption,
                to: config.dev == "1" ? config.email_dev : user.email,
                subject: 'Tu contraseña ha sido cambiada',
                template: 'success.recover',
                context: {
                    names:user.firstName,
                }
            };

            //Verificar smtp y enviar email
            smtpTransport.verify((error, success) => {
                if(error) {
                    console.log('Ocurrió un error enviando el email, intente más tarde');
                } else {
                    smtpTransport.sendMail(HelperOptions, (error, info) => {
                        if(error) {
                            console.log('Ocurrió un error enviando el email, intente más tarde');
                            RegisterLogEmail(user, error.code, user.email, emailFromOption, 'Tu contraseña ha sido cambiada', 'failed', emailType.type.SUCCESS_CHANGE_PASSWORD );
                        }
                        RegisterLogEmail(user, info.response, user.email, emailFromOption, 'Tu contraseña ha sido cambiada', info.response, emailType.type.SUCCESS_CHANGE_PASSWORD );
                    });
                }
            });
        } catch (error) {
            console.log('Ocurrió un error enviando el email, intente más tarde');
            RegisterLogEmail(user, error, user.email, emailFromOption, 'Tu contraseña ha sido cambiada', 'failed', emailType.type.SUCCESS_CHANGE_PASSWORD );
        }
        
    },

    
    /**
     * Enviar email con la contraseña para el ingreso a la plataforma
     * Puede ser profesor o estudiante
     * 
     * @param {Object} user usuario registrado
     */
    sendUserPassword: async (user, pass) => {

        try {
            MailConfig.ViewOption(smtpTransport, hbs);
            let HelperOptions = {
                from: emailFromOption,
                to: config.dev == "1" ? config.email_dev : user.email,
                subject: 'Tu cuenta de acceso a UNO',
                template: 'register.teacher',
                context: {
                    names:user.firstName,
                    pass,
                }
            };

            //Verificar smtp y enviar email
            smtpTransport.verify((error, success) => {
                if(error) {
                    console.log('Ocurrió un error enviando el email, intente más tarde');
                } else {
                    smtpTransport.sendMail(HelperOptions, (error, info) => {
                        if(error) {
                            console.log('Ocurrió un error enviando el email, intente más tarde');
                            RegisterLogEmail(user, error.code, user.email, emailFromOption, 'Tu cuenta de acceso a UNO', 'failed', emailType.type.SEND_USER_PASSWORD );
                        }
                        RegisterLogEmail(user, info.response, user.email, emailFromOption, 'Tu cuenta de acceso a UNO', info.response, emailType.type.SEND_USER_PASSWORD );
                    });
                }
            });
        } catch (error) {
            console.log('Ocurrió un error enviando el email, intente más tarde');
            RegisterLogEmail(user, error, user.email, emailFromOption, 'Tu cuenta de acceso a UNO', 'failed', emailType.type.SEND_USER_PASSWORD );
        }
        
    },

}

/**
 * Registrar emails enviados en BD
 * 
 * @param {ObjectId} userID id de usuario
 * @param {String} code código de nodemailer
 * @param {String} emailTo 
 * @param {String} emailFrom 
 * @param {String} emailSubject 
 * @param {String} result 
 * @param {Number} typeAction Tipo de Email
 */
function RegisterLogEmail(user, code, emailTo, emailFrom, emailSubject, result, typeAction){

    var logEmail = new LogEmail({
        user: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        code: code,
        emailTo: emailTo,
        emailFrom: emailFrom,
        emailSubject: emailSubject,
        result: result,
        emailType: typeAction
    });

    logEmail.save();
}



module.exports = emailService;