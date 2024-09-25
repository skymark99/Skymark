const { config } = require("dotenv");
config();

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

async function otpToEmail(mail) {
  const otp = generateOtp();

  let transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: mail,
    subject: "Your OTP Code",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  line-height: 1.6;
              }
              .container {
                  max-width: 600px;
                  margin: 30px auto;
                  background: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  padding: 10px 0;
                  border-bottom: 1px solid #eeeeee;
                  margin-bottom: 20px;
              }
              .header h1 {
                  font-size: 24px;
                  color: #333;
                  margin: 0;
              }
              .content {
                  text-align: center;
                  margin-bottom: 20px;
              }
              .otp {
                  font-size: 32px;
                  font-weight: bold;
                  color: #007BFF;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  font-size: 14px;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Your OTP Code</h1>
              </div>
              <div class="content">
                  <p>Your OTP code is <span class="otp">${otp}</span>. It is valid for 5 minutes.</p>
              </div>
              <div class="footer">
                  <p>If you did not request this code, please ignore this email.</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    let info = await transpoter.sendMail(mailOptions);
    return [info.response, "OK", otp];
  } catch (err) {
    return [err, "Failed", null];
  }
}

module.exports = { otpToEmail };
