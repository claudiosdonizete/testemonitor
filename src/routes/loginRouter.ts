import { Router } from 'express';
import { environment } from '../environment.dev';
import axios from 'axios';
import { LoginController } from '../controllers/loginController';
 
export const loginRouter = Router();

const CLIENT_ID = environment.CLIENT_ID;
const CLIENT_SECRET = environment.CLIENT_SECRET;
const REDIRECT_URI = environment.REDIRECT_URI;

const AUTH_URL = 'https://fluigidentity.totvs.com/oauth/authorize';
const TOKEN_URL = 'https://fluigidentity.totvs.com/oauth/token';
const USER_INFO_URL = 'https://fluigidentity.totvs.com/oauth/userinfo';

loginRouter.get('/', (req, res) => {
    res.send(`
      <h1>Login com FLUIG Identity</h1>
      <a href="/login/login">Login</a>
    `);
  });
  
  // Redireciona o usuário para o FLUIG Identity
  loginRouter.post('/', async (req, res) => {
   const oLoginController = new LoginController();
   oLoginController.login();
   
   let cJson = `{ hasNext: true, body: ${JSON.stringify(req.body) },  items: [
    
  ],
  _messages: [{
    code: "INFO",
    type: "information",
    message: "Uma mensagem informativa.",
    detailedMessage: "Detalhes relativos a mensagem."
  }]
}`;

console.log("req.body", req.body);

   let response = res.status(400).json(cJson)

   
   return response;
  });

  loginRouter.get('/login', (req, res) => {
  
  });

  loginRouter.post('/sso', (req, res) => {
  
  });
  
  // Rota de callback após o login no FLUIG Identity


// Função para gerar uma string aleatória para o state
function generateRandomString() {
    return Math.random().toString(36).substring(2, 15);
  }