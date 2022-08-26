
const express = require('express');
require('dotenv').config();
const path = require('path');
const hbs = require('hbs');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');


const app = express();
const PORT = process.env.PORT || 8080;

//Conexión a la Base de Datos
 const conexion = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306
}); 

 conexion.connect((err) => {
    if (err) {
        console.error(`Error en la conexión: ${err.stack}`)
        return;
    }
    console.log(`Conectado a la Base de Datos ${process.env.DATABASE}`);
});  

//Configurar Middelwares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));

//Configuración del Motor de plantillas
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));
//conexion.end();

app.get('/', (req, res, next) => {
    res.render('index', {
        titulo: 'Bienvenidos a la App de la UTN'
    })
});

 app.get('/productos', (req, res) => {

    let sql = 'SELECT * FROM productos';

    conexion.query(sql, (err, result) => {
        if (err) throw err;
        res.render('productos', {
            titulo: 'Productos',
            results: result,
        });
    }); 
}); 


app.get('/contacto', (req, res) => {
    res.render('contacto', {
        titulo: 'Formulario para Suscripción'
    })
});

app.post('/contacto', (req, res) => {
    
    const { nombre, email } = req.body;
    let fecha = new Date();
    

    
    if (nombre == '' || email == '') {
        let validacion = 'Rellene la Suscripción correctamente..';
        res.render('contacto', {
            titulo: 'Formulario para Suscripción',
            validacion
        });
    } else{
        console.log(nombre);
        console.log(email);
        
        async function envioMail(){

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.USEREMAIL,
                    pass: process.env.USERPASS
                }
            });

            let envio = await transporter.sendMail({
                from: process.env.USEREMAIL,
                to: `${email}`,
                subject: 'Gracias por Suscribirse a nuestro Canal',
                html: `Muchas gracias por contactar con nosotros, estaremos enviando su pedido a la brevedad. <br>
                Todas nuestras promociones ya estarán a su disposición. <br>
                ${fecha}`
            });
            
            //res.send(`Tu nombre es ${nombre} y tu email registrado es ${email}`);
            res.render('enviado', {
                titulo: 'Mail Enviado',
                nombre, 
                email
            })
        }
        envioMail();    
    }
})

app.listen(PORT, () => {
    //console.log(`El servidor está trabajando en el Puerto ${PORT}`);
});

