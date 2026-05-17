const nodemailer = require("nodemailer");
const path = require("path");
const userService = require('../../services/userService')
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["info", "warn", "error"],
});

async function sendMail(userId, orderId) {
    try {
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

        const user = await prisma.users.findFirst({
            where: {
                userId: userId
            }
        })

        const userMail = await user.email

        const info = await transporter.sendMail({
            from: '"Domfacetten-Team" <domfacetten@web.de>',
            to: `${userMail}`,
            subject: "Rechnung", 
            attachments: [
                {   
                    filename: `domfacetten-${orderId}.pdf`,
                    path: `./uploads/invoices/domfacetten-${orderId}.pdf`
                }
            ],
            html: `
                <h2>Vielen Dank für Ihren Einkauf bei Domfacetten!</h2>
                <strong>Hallo ${user.first_name},</strong>
                <p>Anbei senden wir Dir eine Rechnung über deinen Einkauf.</p>
            `,
        });

        return {
            code: 200,
            message: 'Mail erfolgreich gesendet.'
        }
    } catch (error) {
        
        return {
            code: 500,
            message: error.message
        }
    }
}

module.exports = {
    sendMail,
};
