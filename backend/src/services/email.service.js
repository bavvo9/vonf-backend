const nodemailer = require('nodemailer');

// Configuración explícita para evitar Timeouts en servidores Cloud con 587 para que no paniquee google
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // tfalse por 587 usa STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls:{
    rejectUnauthorized: false //Evita que render se ponga loco con los certificados de google
  }
});

const sendVerificationEmail = async (to, token) => {
  
  // Usamos la variable FRONTEND_URL que ya le pusimos a Render (la de Vercel). 
  // Si por algún motivo no la encuentra, usa localhost de respaldo para cuando programe en mi pc
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"VONF Neon" <${process.env.EMAIL_USER}>',
    to: to,
    subject: 'Verificá tu cuenta en VONF',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #ff00ff;">¡Bienvenido a VONF!</h1>
        <p>Gracias por registrarte. Para activar tu cuenta, hacé clic en el botón:</p>
        <a href="${verificationUrl}" style="background-color: #00ffff; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar Email</a>
        <p>O copiá este link en tu navegador:</p>
        <p>${verificationUrl}</p>
        <p style="color: #666; font-size: 12px;">Si no creaste esta cuenta, ignorá este email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};