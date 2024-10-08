const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'https://mandelbrot.com.ar'
// }));


const allowedOrigins = ['https://mandelbrot.com.ar', 'http://localhost:3001','http://localhost:3000','https://vleoh.github.io'];


app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/enviar-contacto', async (req, res) => {
  console.log('Recibida solicitud de contacto:', req.body);
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    console.log('Datos incompletos');
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    console.log('Intentando enviar email...');
    await transporter.sendMail({
      from: `"Mandelbrot" <${process.env.SMTP_USER}>`,
      to: process.env.DESTINO_EMAIL,
      subject: "Nuevo mensaje de contacto",
      text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
      html: `<p><strong>Nombre:</strong> ${nombre}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong> ${mensaje}</p>`,
    });

    console.log('Email enviado con éxito');
    res.status(200).json({ message: 'Email enviado con éxito' });
  } catch (error) {
    console.error('Error detallado al enviar email:', error);
    res.status(500).json({ message: 'Error al enviar email', error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

module.exports = app;