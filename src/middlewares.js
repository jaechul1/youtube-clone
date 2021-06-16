export const localsMiddleware = (req, res, next) => {
  res.locals = {
    ...res.locals,
    loggedIn: Boolean(req.session.loggedIn),
    loggedInUser: req.session.user,
    siteName: "Youtube Clone",
  };
  next();
};
