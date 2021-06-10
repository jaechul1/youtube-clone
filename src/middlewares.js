export const localsMiddleware = (req, res, next) => {
  res.locals = {
    ...res.locals,
    loggedIn: Boolean(req.session.loggedIn),
    siteName: "Youtube Clone",
  };
  next();
};
