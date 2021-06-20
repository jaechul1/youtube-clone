import express from "express";
import { recordView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", recordView);

export default apiRouter;
