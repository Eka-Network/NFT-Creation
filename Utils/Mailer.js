const nodemailer = require("nodemailer");


//Method to send email to a user
var SendEmail = async function(to, subject, text) {
    return new Promise(resolve => {
        console.log("[FW_Mailer] mailing to " + to);
        var mailOptions = {
            from: '"Mail from EKA" <noreply@eka.network>',
            to: to,
            subject: subject,
            text: text,
        }

        var smtpTransport = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: '587',
            secure: false,
            auth: {
                user: "noreply@eka.network",
                pass: "Eka@1234"
            }
        });

        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log("[FW_Mailer]" + error);
                resolve(0);
            } else {
                console.log("[FW_Mailer]Message sent: " + JSON.stringify(response));
                resolve(1);
            }
        });
    });
}

module.exports = { SendEmail }