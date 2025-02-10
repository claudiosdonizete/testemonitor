require("dotenv").config();
import express from "express";

import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";

import bodyParser from "body-parser";
import { config } from "./config/config";

const passport = require("passport");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");
const session = require("express-session");

export const app = express();

var allowCors = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // colocar os dominios permitidos | ex: 127.0.0.1:8090
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, X-Access-Token, X-Key"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS, PATCH"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(allowCors);

passport.use(
  new SamlStrategy(
    {
      entryPoint: config.saml.entryPoint,
      issuer: config.saml.issuer,
      path: config.saml.callbackUrl,
      cert: config.saml.cert,
    },
    (profile, done) => {
      console.log("entrou");
      if (!profile) {
        return done(null, false, { message: "Perfil inválido" });
      }
      return done(null, profile);
    }
  )
);

// Serialização do usuário
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

app.use(
  session({
    secret: "9c8f12ca8bf94bac87b77f9a5eda9183",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Rota de Login via SAML
app.get(
  "/login",
  passport.authenticate("saml", {
    failureRedirect: "/error",
    failureFlash: true,
  }),
  (req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline';"
    );
    console.log("Entpru login");
    // next();
  }
);

// Rota de Callback SAML
app.post(
  "/login/callback",
  passport.authenticate("saml", {
    failureRedirect: "/error",
    failureFlash: true,
  }),
  (req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline';"
    );
    // next();
    const { user } = req;
    console.log(user);
    res.send(
      `Bem-vindo, ${
        user["email"] + " " + user["firstname"] + " " + user["lastname"]
      } `
    );
  }
);
// 4️⃣ Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

//.use("/login", loginRouter);
// 3️⃣ Rota de erro
app.get("/error", (req, res) => res.send("Falha na autenticação"));
//Rotaa de hiome
app.use("/home", homeRouter);
// 3️⃣ Rota de erro
