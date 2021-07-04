import User from "../models/User";
import fetch from "node-fetch";

export const startGithubLogin = (_, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const url = `${baseUrl}?${params}`;
  return res.redirect(url);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
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
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      req.flash(
        "error",
        "No primary & verified email found in your Github account"
      );
      return res.status(400).redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      try {
        user = await User.create({
          name: userData.name ? userData.name : "Unknown",
          email: emailObj.email,
          socialOnly: true,
          avatarUrl: userData.avatar_url,
          username: userData.login,
          password: "",
          location: userData.location,
        });
      } catch (error) {
        req.flash("error", error._message);
        return res.status(400).redirect("/login");
      }
    }
    req.session.loggedIn = true;
    req.session.user = user;
    req.flash("success", "Github login success");
    return res.redirect("/");
  } else {
    req.flash("error", "Failed to get an access token");
    return res.status(400).redirect("/login");
  }
};
