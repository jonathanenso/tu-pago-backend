//require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');
const config = require('./config.json');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//usar la autenticación JWT para asegurar la API
app.use(jwt());

//permisos carpetas
app.use('/image', express.static('public/uploads/users/'));

// api routes
app.use('/users', require('./controllers/users.controller'));
//controlador de error global
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.Promise = global.Promise;
// Conexion a la base de datos
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions).then( () => {
    console.log('Connection to the database established successfully...');

    // Creacion del servidor
    app.listen(port, () => {
        console.log(`Server running correctly in the url: ${port}`);
    });
}).catch( (error) => {
    console.log(error);
});