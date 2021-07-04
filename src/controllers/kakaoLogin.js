import User from "../models/User";
import fetch from "node-fetch";

export const startKakaoLogin = (_, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KA_CLIENT,
    redirect_uri:
      "https://youtube-clone-jaechul10.herokuapp.com/users/kakao/finish",
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  const url = `${baseUrl}?${params}`;
  return res.redirect(url);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const config = {
    grant_type: "authorization_code",
    client_id: process.env.KA_CLIENT,
    redirect_uri:
      "https://youtube-clone-jaechul10.herokuapp.com/users/kakao/finish",
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const url = `${baseUrl}?${params}`;
  const tokenData = await (
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenData) {
    const { access_token } = tokenData;
    const apiUrl = "https://kapi.kakao.com";
    const {
      kakao_account: {
        profile: { nickname, profile_image_url },
        is_email_valid,
        is_email_verified,
        email,
      },
    } = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      })
    ).json();
    if (!(is_email_valid && is_email_verified)) {
      req.flash(
        "error",
        "No valid & verified email found in your Kakao account"
      );
      return res.status(400).redirect("/login");
    }
    let user = await User.findOne({ email });
    if (!user) {
      try {
        user = await User.create({
          name: nickname ? nickname : "Unknown",
          email,
          socialOnly: true,
          avatarUrl: profile_image_url,
          username: email,
          password: "",
        });
      } catch (error) {
        req.flash("error", error._message);
        return res.status(400).redirect("/login");
      }
    }
    req.session.loggedIn = true;
    req.session.user = user;
    req.flash("success", "Kakao login success");
    return res.redirect("/");
  } else {
    req.flash("error", "Failed to get an access token");
    return res.status(400).redirect("/login");
  }
};
