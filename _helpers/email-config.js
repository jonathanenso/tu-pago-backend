
var nodemailer = require('nodemailer');

/**
 * configuracion para email a través de Gmail 
 */
module.exports.GmailTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.google.com",
    secure: false,
    port: 587,
    auth: {
        user: "test@gmail.com",
        pass: "test"
    }
});

/**
 * configuracion para email a través de un SMTP
 */
module.exports.SMTPTransport = nodemailer.createTransport({
    host: "smtp.ionos.mx",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "sendtestemail@ensomarketingdigital.com",
        pass: "Sendtestemail#123"
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
});


/**
 * configuracion de vista template de email
 * Compila la vista para enviar por email 
 */
module.exports.ViewOption = (transport, hbs) => {
    const handlebarOptions = {
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'template.hbs',
        },
        viewPath: 'views/email',
        extName: '.hbs',
    };

    transport.use('compile', hbs(handlebarOptions));
}