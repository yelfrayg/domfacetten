const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

async function sendMail(data) {
    try {
        const { customerFirstname, customerMail } = data;
        console.log(process.env.MAIL_PASS);
        console.log(process.env.MAIL_USER);
        const transporter = nodemailer.createTransport({
            host: "smtp.web.de",
            port: 587,
            secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: '"Domfacetten-Team" <domfacetten@web.de>',
            to: "yassin-4@outlook.de", // list of recipients
            subject: "Rechnung", // subject line
            // text: "Hello world?", // plain text body
            html: `
                <h2>Vielen Dank für Ihren Einkauf bei Domfacetten!</h2>
                <p>Anbei senden wir Ihnen eine Rechnung über Ihren Einkauf.</p>
                <strong>Gekauft hat ${customerFirstname} mit E-Mail ${customerMail}</strong>
            `,
        });

        console.log("E-Mail gesendet: ", info.messageId);
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = {
    sendMail,
};
