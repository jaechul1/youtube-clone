let videos = [
  {
    title: "First Video",
    rating: 4,
    comments: 2,
    createdAt: "5 minutes ago",
    views: 49,
    id: 0,
  },
  {
    title: "Second Video",
    rating: 3,
    comments: 9,
    createdAt: "11 minutes ago",
    views: 197,
    id: 1,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const { id } = req.params;
  const video = videos[id];
  return res.render("watch", { pageTitle: `Watching: ${video.title}`, video });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id];
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  videos[id].title = title;
  return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};
export const postUpload = (req, res) => {
  const newVideo = {
    title: req.body.title,
    rating: 0,
    comments: 0,
    createdAt: "just now",
    views: 0,
    id: videos.length,
  };
  videos.push(newVideo);
  return res.redirect("/");
};
