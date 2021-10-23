const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".video__comment-delete");

const addComment = (text, id) => {
	const videoComments = document.querySelector(".video__comments ul");
	const newComment = document.createElement("li");
	const commentIcon = document.createElement("i");
	const xIcon = document.createElement("i");
	const span = document.createElement("span");
	newComment.classList = "video__comment";
	newComment.dataset.id = id;
	commentIcon.className = "fas fa-comment";
	xIcon.className = "fas fa-times";
	xIcon.addEventListener("click", handleDeleteComment);
	span.innerText = ` ${text}`;
	newComment.appendChild(commentIcon);
	newComment.appendChild(span);
	newComment.appendChild(xIcon);
	videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
	event.preventDefault();
	const textarea = form.querySelector("textarea");
	const text = textarea.value;
	const videoId = videoContainer.dataset.id;
	if(text === "") return;
	const response = await fetch(`/api/videos/${videoId}/comment`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({text}),
	});
	if (response.status === 201) {
		textarea.value = "";
		const {newCommentId} = await response.json();
		addComment(text, newCommentId);
	};
};

const handleDeleteComment = async (event) => {
	const li = event.target.parentElement;
	const commentId = li.dataset.id;
	const response = await fetch(`/api/comments/${commentId}`, {
		method: "DELETE"
	});
	if (response.status === 200) {
		li.remove();
	};
};

if(form) form.addEventListener("submit", handleSubmit);
if(deleteBtn) {
	deleteBtn.forEach(function(item) {
		item.addEventListener("click", handleDeleteComment);
	});
};