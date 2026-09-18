import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyMail = async (token, email) => {
  try {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "template.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(emailTemplateSource);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const htmlToSend = template({ token, clientUrl });

    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.mailUser || "deba.aot@gmail.com";
    const senderName = process.env.BREVO_SENDER_NAME || "eKart";

    // Use Brevo Transactional Email REST API (HTTPS / Render-recommended)
    if (apiKey) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email }],
          subject: "Verify Your Email - eKart",
          htmlContent: htmlToSend,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || JSON.stringify(result));
      }

      console.log("Email Sent Successfully via Brevo API to:", email, "MessageId:", result.messageId);
      return result;
    } else {
      throw new Error("Brevo API key is missing. Please set BREVO_API_KEY in .env");
    }
  } catch (error) {
    console.error("Error sending verification email:", error.message || error);
    throw error;
  }
};
