import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const uploadVideo = document.querySelector(".upload__video");

let video;
let stream;
let recorder;
let videoFile;

const files = {
	input: "recording.webm",
	output: "output.mp4",
	thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
	const a = document.createElement("a");
	a.href = fileUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
};


const handleDownload = async () => {
	actionBtn.disabled = true;
	actionBtn.innerText = "Transcoding...";
	actionBtn.removeEventListener("click", handleDownload);
	
	const ffmpeg = createFFmpeg({
		log: true,
		corePath: "https://unpkg.com/@ffmpeg/core@0.8.5/dist/ffmpeg-core.js",
	});
	await ffmpeg.load();
	
	ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
	
	await ffmpeg.run("-i", files.input, "-r", "60", files.output);
	await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);
	
	const mp4File = ffmpeg.FS("readFile", files.output);
	const thumbFile = ffmpeg.FS("readFile", files.thumb);
	
	const mp4Blob = new Blob([mp4File.buffer], {type:"video/mp4"});
	const thumbBlob = new Blob([thumbFile.buffer], {type: "image/jpg"});
	
	const mp4Url = URL.createObjectURL(mp4Blob);
	const thumbUrl = URL.createObjectURL(thumbBlob);
	
	downloadFile(mp4Url, "My_Recording.mp4");
	downloadFile(thumbUrl, "My_Thumbnail.jpg");
	
	ffmpeg.FS("unlink", files.input);
	ffmpeg.FS("unlink", files.output);
	ffmpeg.FS("unlink", files.thumb);
	
	URL.revokeObjectURL(mp4Url);
	URL.revokeObjectURL(thumbUrl);
	URL.revokeObjectURL(videoFile);
	
	actionBtn.innerText = "Record Again";
	actionBtn.addEventListener("click", handleStart);
	actionBtn.disabled = false;
};

const handleStart = () => {
	actionBtn.disabled = true;
	actionBtn.innerText = "Recording...";
	actionBtn.removeEventListener("click", handleStart);
	recorder =  new MediaRecorder(stream, {mimeType: "video/webm"});
	recorder.ondataavailable = (event) => {
		videoFile = URL.createObjectURL(event.data);
		video.srcObject = null;
		video.src = videoFile;
		video.loop = true;
		video.play();
		actionBtn.innerText = "Download";
		actionBtn.addEventListener("click", handleDownload);
		actionBtn.disabled = false;
	};
	recorder.start();
	setTimeout(() => {
		recorder.stop();
	}, 5000);
};

const handleCreate = async () => {
	actionBtn.disabled = true;
	actionBtn.innerText = "Please wait...";
	actionBtn.removeEventListener("click", handleCreate);
	
	video = document.createElement("video");
	video.id = "preview";
	uploadVideo.insertBefore(video, uploadVideo.firstChild);
	
	stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			width: 1024,
			height: 576,
		},
	});
	video.srcObject = stream;
	video.play();
	
	actionBtn.innerText = "Start Recording";
	actionBtn.addEventListener("click", handleStart);
	actionBtn.disabled = false;
};


actionBtn.addEventListener("click", handleCreate);