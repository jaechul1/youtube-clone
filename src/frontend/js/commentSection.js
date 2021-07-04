const videoElement = document.querySelector("video");
const form = document.getElementById("commentForm");
const eraseBtns = [...document.getElementsByClassName("eraseBtn")];

const addComment = (text, id, name, url) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "comment";

  let avatar = document.createElement("div");
  avatar.className = "avatarImg";
  avatar.style.backgroundImage = `url(${url})`;

  const span = document.createElement("span");
  span.innerText = name;

  const erase = document.createElement("button");
  erase.className = "eraseBtn";
  const i = document.createElement("i");
  i.className = "fas fa-eraser";
  erase.appendChild(i);
  erase.addEventListener("mousedown", handleErase);

  const span2 = document.createElement("span");
  span2.innerText = text;

  newComment.appendChild(avatar);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  newComment.appendChild(erase);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const commentArea = form.querySelector("input");
  const text = commentArea.value;
  if (!text) {
    return;
  }
  const response = await fetch(
    `/api/videos/${videoElement.dataset.id}/comment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    }
  );
  switch (response.status) {
    case 201:
      commentArea.value = "";
      const { newCommentId, name, avatarUrl } = await response.json();
      addComment(text, newCommentId, name, avatarUrl);
      break;
    default:
  }
};

const handleErase = async (event) => {
  const comment = event.target.parentNode.parentNode;
  const toDelete = comment.dataset.id;
  const response = await fetch(
    `/api/videos/${videoElement.dataset.id}/delete-comment/${toDelete}`,
    {
      method: "DELETE",
    }
  );
  switch (response.status) {
    case 200:
      comment.parentNode.removeChild(comment);
      break;
    default:
  }
};

if (form) {
  console.log("AA");
  form.addEventListener("submit", handleSubmit);
}

if (eraseBtns) {
  eraseBtns.forEach((eraseBtn) =>
    eraseBtn.addEventListener("mousedown", handleErase)
  );
}
