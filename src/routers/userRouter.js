import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  profile,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/githubLogin";
import { startKakaoLogin, finishKakaoLogin } from "../controllers/kakaoLogin";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);
userRouter.get("/:id", profile);

export default userRouter;
