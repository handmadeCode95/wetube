const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const leftArrow = document.getElementById("videoContainer__leftArrow");
const rightArrow = document.getElementById("videoContainer__rightArrow");

let volumeValue = 0.5;
let controlsMovementTimeout = null;
let controlsTimeout = null;
let videoDuration = null;
video.volume = volumeValue;


const handlePlayAndStop = (event) => {
	if(video.paused) {
		video.play();
	} else {
		video.pause();
	};
	playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = (event) => {
	if(video.muted) {
		video.muted = false;
	} else {
		video.muted = true;
	};
	muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
	if (video.muted) {
		volumeRange.value = 0;
	} else {
		if (volumeValue <= 0.01) {
			volumeRange.value = 0.5;
			video.volume = 0.5;
		} else {
			volumeRange.value = volumeValue;
		};
	};
};

const handleVolumeChange = (event) => {
	const {target: {value}} = event;
	if(value <= 0) {
		muteBtnIcon.classList = "fas fa-volume-mute";
		video.muted = true;
	} else {
		muteBtnIcon.classList = "fas fa-volume-up";
		video.muted = false;
	};
	volumeValue = video.volume = value;
};

const handleTimelineChange = (event) => {
	const {target: {value}} = event;
	video.currentTime = value;
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
	videoDuration = Math.floor(video.duration);
	totalTime.innerText = formatTime(videoDuration);
	timeline.max = videoDuration;
};

const handleTimeUpdate = () => {
	const videoCurrentTime = Math.floor(video.currentTime);
	currentTime.innerText = formatTime(videoCurrentTime);
	timeline.value = videoCurrentTime;
};

const handleFullScreen = () => {
	const fullScreen = document.fullscreenElement;
	if(fullScreen) {
		document.exitFullscreen();
		fullScreenIcon.classList = "fas fa-expand";
	} else {
		videoContainer.requestFullscreen();
		fullScreenIcon.classList = "fas fa-compress";
	};
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
	if(controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null;
	};
	videoControls.classList.add("showing");
	
	if(controlsMovementTimeout) {
		clearTimeout(controlsMovementTimeout);
		controlsMovementTimeout = null;
	};
	controlsMovementTimeout = setTimeout(hideControls, 1000);
};

const handleMouseLeave = () => {
	controlsTimeout = setTimeout(hideControls, 1000);
};

const handleLeftKey = (videoCurrentTime) => {
	if(videoCurrentTime < videoDuration) {
		video.currentTime = timeline.value = videoCurrentTime - 5;
		leftArrow.classList.add("showing");
		leftArrowTimeout = setTimeout(() => leftArrow.classList.remove("showing"), 1000);
	};
};

const handleRightKey = (videoCurrentTime) => {
	if(videoCurrentTime < videoDuration) {
		video.currentTime = timeline.value = videoCurrentTime + 5;
		rightArrow.classList.add("showing");
		rightArrowTimeout = setTimeout(() => rightArrow.classList.remove("showing"), 1000);
	};
};

const handleUpKey = () => {
	if (volumeValue < 0.1) {
		muteBtnIcon.classList = "fas fa-volume-up";
		video.muted = false;
	};
	if (volumeValue < 1) {
		video.volume = volumeRange.value = volumeValue = Math.round((volumeValue + 0.1) * 10) / 10;
	};
};

const handleDownKey = () => {
	if (volumeValue > 0) {
		video.volume = volumeRange.value = volumeValue = Math.round((volumeValue - 0.1) * 10) / 10;
	};
	if (volumeValue < 0.1) {
		muteBtnIcon.classList = "fas fa-volume-mute";
		video.muted = true;
	};
};

const handleKeyup = (event) => {
	const keyCode = event.code;
	const fullScreen = document.fullscreenElement;
	const videoCurrentTime = Math.floor(video.currentTime);
	switch(keyCode) {
		case "Space":
			handlePlayAndStop();
			break;
		case "KeyF":
			const textarea = document.querySelector("textarea");
			const activeElement = document.activeElement;
			if(textarea === activeElement) break;
			if(!fullScreen) handleFullScreen();
			break;
		case "Escape":
			if(fullScreen) handleFullScreen();
			break;
		case "ArrowRight":
			handleRightKey(videoCurrentTime);
			break;
		case "ArrowLeft":
			handleLeftKey(videoCurrentTime);
			break;
		case "ArrowUp":
			handleUpKey();
		  break;
		case "ArrowDown":
			handleDownKey();
			break;
		default:
			break;
	};
};

const handleEnded = () => {
	const {id} = videoContainer.dataset;
	fetch(`/api/videos/${id}/view`, {
		method: "POST",
	});
};


if (video.readyState === 4) handleLoadedMetadata();
playBtn.addEventListener("click", handlePlayAndStop);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("click", handlePlayAndStop);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
window.addEventListener("keyup", handleKeyup);