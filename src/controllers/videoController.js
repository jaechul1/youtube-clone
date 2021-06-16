import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findById(id);
    return res.render("video/watch", { pageTitle: video.title, video });
  } catch {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findById(id);
    return res.render("video/edit", {
      pageTitle: `Edit: ${video.title}`,
      video,
    });
  } catch {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  try {
    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);
  } catch {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
};

export const getUpload = (req, res) => {
  return res.render("video/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    body: { title, description, hashtags },
    file: { path },
  } = req;
  try {
    await Video.create({
      title,
      description,
      fileUrl: path,
      hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("video/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  try {
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
  } catch {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  return res.render("video/search", { pageTitle: "Search", videos });
};
