const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

async function sendMail(addresses, subject, htmlBody) {
    const recipients = Array.isArray(addresses) ? addresses : [addresses];

    const result = await transporter.sendMail({
        from: `Toritora Team ${process.env.GMAIL_USER}`,
        to: recipients.join(', '),
        subject: subject,
        html: htmlBody
    });

    console.log(JSON.stringify(result, null, 4));
}

module.exports = sendMail;
