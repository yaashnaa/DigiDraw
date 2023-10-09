window.addEventListener("load", function () {
  var btnCapture = document.getElementById("btn-capture");
  var btnCaptureScreen = document.getElementById("btn-capture-screen"); // New button for screen capture

  var capture = document.getElementById("capture");
  var screenCapture = document.getElementById("screen-capture"); // New video element for screen capture

  var cameraStream = null;
  var screenStream = null; // New variable for screen capture stream

  btnCaptureScreen.addEventListener("click", captureScreen); // Add a listener for screen capture

  function captureScreen() {
    navigator.mediaDevices
      .getDisplayMedia({ video: { mediaSource: "screen" } })
      .then(function (mediaStream) {
        screenStream = mediaStream;
        screenCapture.srcObject = mediaStream;
        screenCapture.play();

        // You can also save the screen capture as a file (optional)
        const mediaRecorder = new MediaRecorder(mediaStream);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);

          // Display the captured video in the video element
          const videoElement = document.getElementById("captured-video");
          videoElement.src = url;

          // Show the download button
          // const navitem = document.getElementById("nav-items");
          const downloadButton = document.getElementById("download-button");
          const drawingcont = document.getElementById("drawing-material");
          downloadButton.style.display = "block";
          downloadButton.style.display = "flex";
          const sheetCanvas = document.getElementById("sheet");
          drawingcont.style.display = 'none';
          

          // Set the download link to the video URL
          const downloadLink = document.getElementById("download-button");
          downloadLink.href = url;
        };

        mediaRecorder.start();

        // Stop recording after 10 seconds (you can adjust the time)
        setTimeout(() => {
          mediaRecorder.stop();
          screenStream.getTracks().forEach((track) => track.stop());
        }, 10000); // 10 seconds
      })
      .catch(function (err) {
        console.log("Unable to capture screen: " + err);
      });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);

        // Send video frame data to the server using Socket.io
        const canvas = document.getElementById("video-canvas");
        const ctx = canvas.getContext("2d");
        const videoElement = document.getElementById("captured-video");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg"); // Convert frame to base64
        socket.emit("videoFrame", imageData);
      }
    };
    socket.on("videoFrame", function (imageData) {
      const canvas = document.getElementById("video-canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageData;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    });
  }

  // Server-side code (Node.js)
  io.on("connection", (socket) => {
    socket.on("videoFrame", (imageData) => {
      socket.broadcast.emit("videoFrame", imageData);
    });
  });
});
