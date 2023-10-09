window.onload = function () {
  /* Initialise variables */
  let isDrawing = false;
  let x = 0;
  let y = 0;

  /* Get canvas and context */
  const canvas = document.getElementById("sheet");
  var context = canvas.getContext("2d");

  /* Add the event listeners for mousedown, mousemove, and mouseup */
  canvas.addEventListener("mousedown", (e) => {
    /* Drawing begins */
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  });

  canvas.addEventListener("mousemove", (e) => {
    /* Drawing continues */
    if (isDrawing === true) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
    }
  });

  window.addEventListener("mouseup", (e) => {
    /* Drawing ends */
    if (isDrawing === true) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });

  /* Initialise socket */
  var socket = io();

  /* Receiving Updates from server */
  socket.on("update_canvas", function (data) {
    let { x1, y1, x2, y2, color } = JSON.parse(data);
    drawLine(context, x1, y1, x2, y2, color, true);
  });

  /* Function to Draw line from (x1,y1) to (x2,y2) */
  function drawLine(
    context,
    x1,
    y1,
    x2,
    y2,
    color = selected_color,
    from_server = false
  ) {
    /* Send updates to server (not re-emiting those received from server) */
    if (!from_server)
      socket.emit("update_canvas", JSON.stringify({ x1, y1, x2, y2, color }));

    /* Draw line with color, stroke etc.. */
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineCap = "round";
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
  }
};

/* helper function to change selected_color
   triggered onclick buttons below canvas
   'red','green','blue'
 */
let selected_color = "red";
function selectColor(color) {
  document
    .getElementsByClassName(selected_color)[0]
    .classList.remove("selected");
  document.getElementsByClassName(color)[0].classList.add("selected");
  selected_color = color;
}

let selected_option = "line";


function changeBackgroundPattern(option) {

  const canvas = document.getElementById('sheet'); 
  const context = canvas.getContext("2d");
  const contentContainer = document.getElementById("sheet");
  const hasPattern = contentContainer.style.backgroundImage !== "none";
if (option === "dots") {
  contentContainer.style.backgroundColor = "white";
  contentContainer.style.opacity = "1";
  contentContainer.style.backgroundImage =
    "radial-gradient(#000000 1.3px, transparent 1.3px), radial-gradient(#000000 1.3px, #ffffff 1.3px)";
  contentContainer.style.backgroundSize = "108px 108px"; // Increase the size as needed
  contentContainer.style.backgroundPosition = "0 0, 108px 108px"; // Adjust this accordingly
}
else if (option === "paper") {
  
    contentContainer.style.backgroundColor = "#ffffff";
    contentContainer.style.opacity = "1";
    contentContainer.style.backgroundImage =
      "linear-gradient(#000000 4px, transparent 4px), linear-gradient(90deg, #000000 4px, transparent 4px), linear-gradient(#000000 2px, transparent 2px), linear-gradient(90deg, #000000 2px, #ffffff 2px)";
    contentContainer.style.backgroundSize =
      "100px 100px, 100px 100px, 20px 20px, 20px 20px";
    contentContainer.style.backgroundPosition =
      "-4px -4px, -4px -4px, -2px -2px, -2px -2px";
  } else if (option === "line") {
    contentContainer.style.backgroundColor = "#ffffff";
    contentContainer.style.opacity = "1";
    contentContainer.style.backgroundImage =
      " repeating-linear-gradient(0deg, #000000, #000000 1px, #ffffff 1px, #ffffff)";
    contentContainer.style.backgroundSize = "20px 20px";
  } else if (option === "grid") {
    contentContainer.style.backgroundColor = "#ffffff";
    contentContainer.style.opacity = "1";
    contentContainer.style.backgroundImage =
      " linear-gradient(#000000 1.3px, transparent 1.3px), linear-gradient(to right, #000000 1.3px, #ffffff 1.3px)";
    contentContainer.style.backgroundSize = "26px 26px";
  } else if (option === "paperTexture") {
    contentContainer.style.backgroundColor = "#ffeee0";
    contentContainer.style.backgroundImage =
      'url("https://www.transparenttextures.com/patterns/textured-paper.png")';
    contentContainer.style.backgroundSize = "auto";
  } else if (option === "none" && hasPattern) {
    // If the current background has a pattern and "blank" is selected again, remove the pattern
    contentContainer.style.backgroundImage = "none";
    contentContainer.style.backgroundColor = "white";
  }
  // } else if (option === "blank") {
  //   // Clear the canvas
  //   contentContainer.style.backgroundColor = "#ffffff";
  //   contentContainer.style.backgroundImage="none"
  // }
  


  selected_option = option;
  socket.emit("change_background", option);
}

var socket = io.connect();

socket.on("connect", function () {
  console.log("Connected");
});

socket.on("video", function (data) {
  // Set the received image data as the background of the sheet canvas
  const sheetCanvas = document.getElementById("sheet"); // Get the sheet canvas
  sheetCanvas.style.backgroundImage = `url(${data})`; // Set the background image
  console.log(data);
});

window.addEventListener("load", function () {
  let hideimg = document.getElementById("theimage");
  let video = document.getElementById("myvideo");
  video.style.display = "none";
  hideimg.style.border = "none";
  hideimg.style.display = "none";

  let constraints = { audio: true, video: true };

  // Prompt the user for permission, get the stream
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      /* Use the stream */

      // Attach to our video object
      video.srcObject = stream;

      // Wait for the stream to load enough to play
      video.onloadedmetadata = function (e) {
        // console.log(e);
        video.play();
        draw();
      };
    })
    .catch(function (err) {
      /* Handle the error */
      alert(err);
    });

  function draw() {
    let videoCanvas = document.getElementById("video-canvas"); // Use separate canvas variable
    let videoContext = videoCanvas.getContext("2d"); // Use separate context variable
    videoContext.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
  
  

    requestAnimationFrame(draw);
  }
  let videoCanvas = document.getElementById("video-canvas");
  videoCanvas.style.display = "none";
  const drawingcanvas= document.getElementById('sheet')
  const startbtn = document.getElementById("start");
  const stopbtn = document.getElementById("stop");
  const photobtn = document.getElementById("photo-button");
  const startStopContainer = document.getElementById("startStopContainer");
  const colorcanvas = document.getElementsByClassName("color-choice");
  const sheetCanvas = document.getElementById("sheet");
  const videoElement = document.getElementById("captured-video");
  const downloadButton = document.getElementById("download-button");
  const drawingdiv= document.getElementById('drawing-material')
  const flexcont=document.getElementById('flex-container')

  downloadButton.addEventListener('click', ()=>{
    videoElement.style.display='none'
    sheetCanvas.width = 1700;
    downloadButton.style.display='none'
  })
  
  // Initially, hide the "Stop" button
  stopbtn.style.display = "none";
  photobtn.style.display = "none";
  startbtn.addEventListener("click", () => {
    videoCanvas.style.display = "block";
    drawingdiv.style.display='none'

    flexcont.style.display='block'
    startStopContainer.style.display = "flex"; // Show the container
    startbtn.style.display = "none";
    stopbtn.style.display = "flex"; // Show the "Stop" button
    photobtn.style.display = "block";
    photobtn.style.display = "flex";
    sheetCanvas.width = 1500;
    colorcanvas.style.display='none'
  });
  
  stopbtn.addEventListener("click", () => {
    videoCanvas.style.display = "none";
    drawingcanvas.style.width='1700'
    drawingdiv.style.display='block'
    flexcont.style.display='flex'
    drawingdiv.style.marginLeft= '10vw'
    startStopContainer.style.display = "flex"; // Show the container
    startbtn.style.display = "flex"; // Show the "Start" button
    stopbtn.style.display = "none";
    photobtn.style.display = "none";
    sheetCanvas.width = 1700;
    colorcanvas.style.display='none'
  });
  

  const photobutton = document.getElementById("photo-button");
  photobutton.addEventListener("click", function (e) {
    let videoCanvas = document.getElementById("video-canvas");
    let videoContext = videoCanvas.getContext("2d");
    let sheetCanvas = document.getElementById("sheet"); // Use separate canvas for sheet
    let sheetContext = sheetCanvas.getContext("2d"); // Use separate context for sheet
    const drawingdiv= document.getElementById('drawing-material')

    // Capture the current frame from the video and draw it on the video canvas
    videoContext.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);

    // Set the captured image as the background of the sheet canvas
    const imageData = videoCanvas.toDataURL("image/webp");
    sheetCanvas.style.backgroundImage = `url(${imageData})`;
    sheetCanvas.style.background = "no-repeat";
    sheetCanvas.style.backgroundSize = "cover"; 
    videoCanvas.style.display= "none"
    drawingdiv.style.display="block"
    // Optionally, you can clear the video canvas if you want to remove the drawn content
    videoContext.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

    // Emit the captured image to other users via Socket.io
    socket.emit("video", imageData);
  }); 

  // const navbtn = document.getElementById("menu-icon");
  // const collapseNavbar = document.querySelector(".collapse-navbar");

  // navbtn.addEventListener("click", () => {
  //   if (collapseNavbar.style.display === "none" || collapseNavbar.style.display === "") {
  //     collapseNavbar.style.display = "block";
  //   } else {
  //     collapseNavbar.style.display = "none";
  //   }
  // });
});

// window.addEventListener("load", function () {

//   // const navbtn= document.getElementById('menu-icon')
//   // // const nav- document.getElementById('collapse-navbar')
//   // navbtn.addEventListener('click', ()=>{
//   //   const navitems= document.getElementById('collapse-navbar')
//   //   navitems.style.backgroundColor='red'
//   //   navitems.style.display='none'
//   // })
// })