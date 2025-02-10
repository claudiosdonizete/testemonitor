import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const config = {
  saml: {
    entryPoint: process.env.SAML_ENTRY_POINT as string,
    issuer: process.env.SAML_ISSUER as string,
    callbackUrl: process.env.SAML_CALLBACK_URL as string,
    cert: fs.readFileSync("src/certs/fluighml.pem", "utf-8"),
  },
  server: {
    port: process.env.PORT || 8080,
  },
};