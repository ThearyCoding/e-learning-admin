const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
  log: true, 
  progress: ({ ratio }) => {
    const percent = (ratio * 100).toFixed(2);
    status.textContent = `Status: Compressing video... ${percent}%`;
  }
});

const videoInput = document.getElementById("videoInput");
const compressBtn = document.getElementById("compressBtn");
const status = document.getElementById("status");
const outputVideo = document.getElementById("outputVideo");

compressBtn.addEventListener("click", async () => {
  if (!videoInput.files[0]) {
    status.textContent = "Status: Please select a video file!";
    return;
  }

  const file = videoInput.files[0];
  status.textContent = "Status: Loading FFmpeg...";
  
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  status.textContent = "Status: Compressing video...";
  ffmpeg.FS("writeFile", file.name, await fetchFile(file));

  const outputFileName = "compressed.mp4";

  try {
    await ffmpeg.run(
      "-i", file.name,
      "-vf", "scale=-1:720",  // Scale height to 720px, keep aspect ratio
      "-c:v", "libx264",      // H.264 codec for compression
      "-preset", "faster",      // Better quality, slower encoding
      "-crf", "23",           // Lower CRF for higher quality
      "-c:a", "aac",          // Audio codec
      "-b:a", "128k",         // Higher-quality audio bitrate
      "-movflags", "faststart", // Optimize for web streaming
      outputFileName
    );

    const data = ffmpeg.FS("readFile", outputFileName);
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    // Show compressed video
    outputVideo.src = url;

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "compressed.mp4";
    downloadLink.textContent = "Download Compressed Video";
    downloadLink.style.display = "block";
    document.body.appendChild(downloadLink);

    status.textContent = "Status: Compression complete!";
  } catch (error) {
    status.textContent = "Error: Compression failed. Check console for details.";
    console.error(error);
  }
});
