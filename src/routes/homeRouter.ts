import { Router } from "express";
import { environment } from "../environment.dev";
import axios from "axios";

const homeController = require("../controllers/homeController");

export const homeRouter = Router();

homeRouter.post("/", homeController.getP37iPass);
homeRouter.get("/list", homeController.getP37DB);
