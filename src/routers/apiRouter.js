import express from "express";
import {
  recordView,
  createComment,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", recordView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete(
  "/videos/:id([0-9a-f]{24})/delete-comment/:cid",
  deleteComment
);

export default apiRouter;
