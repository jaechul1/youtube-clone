import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (_, res) =>
  res.render("user/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  if (password !== password2) {
    req.flash("info", "Password confirmation does not match");
    return res.status(400).redirect("/join");
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    req.flash("info", "This username / email is already taken");
    return res.status(400).redirect("/join");
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    req.flash("success", "Create account success");
    return res.redirect("/login");
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).redirect("/join");
  }
};

export const getLogin = (_, res) =>
  res.render("user/login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    req.flash("info", "No such account");
    return res.status(400).redirect("/login");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    req.flash("info", "Wrong password");
    return res.status(400).redirect("/login");
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", "Login success");
  return res.redirect("/");
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
  const userToCompare = await User.findOne({ email });
  const exists = userToCompare.username !== username;
  if (exists) {
    req.flash("info", "This email is already taken");
    return res.status(400).redirect("/users/edit");
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        avatarUrl: file ? file.location : avatarUrl,
        location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    req.flash("success", "Edit profile success");
    return res.redirect("/users/edit");
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).redirect("/users/edit");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  req.flash("success", "Logout success");
  return res.redirect("/");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("info", "You can't change the password of social account");
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
  if (newPassword !== newPassword2) {
    req.flash("info", "Password confirmation does not match");
    return res.status(400).redirect("/users/change-password");
  }
  const match = await bcrypt.compare(oldPassword, password);
  if (!match) {
    req.flash("info", "Wrong password");
    return res.status(400).redirect("/users/change-password");
  }
  try {
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save();
    req.flash("success", "Password update success");
    return res.redirect("/users/logout");
  } catch (error) {
    req.flash("error", error._message);
    return res.status(400).redirect("/users/change-password");
  }
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found" });
  }
  return res.render("user/profile", {
    pageTitle: user.name,
    user,
  });
};
