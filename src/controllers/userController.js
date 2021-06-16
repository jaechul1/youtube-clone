import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (_, res) =>
  res.render("user/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("user/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("user/join", {
      pageTitle,
      errorMessage: "This username / email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("user/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (_, res) =>
  res.render("user/login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("user/login", {
      pageTitle,
      errorMessage: "No such account.",
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).render("user/login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

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
      return res.redirect("/login");
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
        return res.status(400).render("user/join", {
          pageTitle: "Join",
          errorMessage: error._message,
        });
      }
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getEdit = (_, res) => {
  return res.render("user/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, username, avatarUrl },
    },
    body: { name, email, location },
    file,
  } = req;
  const pageTitle = "Edit Profile";
  const userToCompare = await User.findOne({ email });
  const exists = userToCompare.username !== username;
  if (exists) {
    return res.status(400).render("user/edit-profile", {
      pageTitle,
      errorMessage: "This email is already taken.",
    });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        avatarUrl: file ? file.path : avatarUrl,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
  } catch (error) {
    return res.status(400).render("user/edit-profile", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("user/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPassword2 },
  } = req;
  const pageTitle = "Change Password";
  if (newPassword !== newPassword2) {
    return res.status(400).render("user/change-password", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const match = await bcrypt.compare(oldPassword, password);
  if (!match) {
    return res.status(400).render("user/change-password", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }
  try {
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save();
    return res.redirect("/users/logout");
  } catch (error) {
    return res.status(400).render("user/change-password", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const see = (req, res) => res.send("See User");
