// Get references to the audio, canvas, and drop text elements
const audioElement = document.getElementById('audio');
const canvas = document.getElementById('pureplace');
const ctx = canvas.getContext('2d');
const dropText = document.getElementById('drop-text'); // Get the "Plant your audio seed here" text element

let fileDropped = false; // Flag to check if a file has been dropped

// Track positions and velocities of blobs
let blobs = [];

// Create the audioContext BEFORE any event handler (important to initialize early)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;  // Defines the frequency bins
const bufferLength = analyser.frequencyBinCount;
const frequencyData = new Uint8Array(bufferLength);

// Function to resize canvas based on window size
function resizeCanvas() {
  canvas.width = window.innerWidth;  // Set canvas width to full screen width
  canvas.height = window.innerHeight * 0.8; // 80% of screen height
}

// Call resizeCanvas to set the initial canvas size
resizeCanvas();

// Listen for window resize events to adjust the canvas size dynamically
window.addEventListener('resize', resizeCanvas);

// Function to create a new blob
function createBlob() {
  return {
    xPos: Math.random() * canvas.width, // Random horizontal position
    yPos: 0, // Start from the top of the canvas
    velocityY: 0, // Initial downward velocity is 0 (gravity will affect it)
    velocityX: (Math.random() - 0.5) * 0.2, // Random horizontal velocity
  };
}

// Initialize blobs once, outside of renderFrame
for (let i = 0; i < 50; i++) { // Generate some blobs at the start
  blobs.push(createBlob());
}

// Visualizer function (renderFrame remains mostly unchanged)
function renderFrame() {
  // Get frequency data and clear the canvas
  analyser.getByteFrequencyData(frequencyData);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas each frame

  // Background color change when file is dropped
  if (fileDropped) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const purpleShades = ['#C7A1FF', '#D9A2FF', '#B08DFF', '#A56EFF'];
  const maxSize = 40;

  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(199, 161, 255, 0.6)";

  // Apply gravity to each blob (make them fall slowly)
  for (let i = 0; i < blobs.length; i++) {
    let blob = blobs[i]; // Access the current blob

    // Apply gravity (downward acceleration)
    blob.velocityY += 0.001;  // Reduce gravity to slow down falling

    // Update position based on velocity
    blob.yPos += blob.velocityY;

    // Add horizontal motion for some randomness
    blob.xPos += blob.velocityX;

    // Slow down the horizontal movement for a natural drift effect
    blob.velocityX *= 0.99;

    // If the blob reaches the bottom of the canvas, stop it from falling further
    if (blob.yPos >= canvas.height - 5) {
      blob.yPos = canvas.height - 5;  // Keep it at the bottom edge
      blob.velocityY = 0;  // Stop the downward motion
    }

    // Random size based on frequency data (or static here for simplicity)
    const size = Math.random() * maxSize;
    const randomPurple = purpleShades[Math.floor(Math.random() * purpleShades.length)];

    // Draw blob
    ctx.beginPath();
    ctx.ellipse(blob.xPos, blob.yPos, size, size / 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = randomPurple;
    ctx.fill();
  }

  // Continuously generate new blobs
  if (fileDropped) {
    if (blobs.length < 2000) { // Control the number of blobs
      blobs.push(createBlob()); // Add a new blob every frame
    }
  }

  // Request the next frame
  requestAnimationFrame(renderFrame);
}

// Start the visualizer once the audio is playing
audioElement.onplay = function() {
  audioContext.resume().then(() => {
    renderFrame(); // Start the visualizer
  });
};

// Drag and drop functionality for the canvas
canvas.addEventListener('dragover', function(e) {
  e.preventDefault(); // Prevent the default behavior (prevent file opening)
  canvas.classList.add('dragover'); // Add the 'dragover' class to style when a file is being dragged over
});

canvas.addEventListener('dragleave', function() {
  canvas.classList.remove('dragover'); // Remove the 'dragover' class when the file is dragged out
});

canvas.addEventListener('drop', function(e) {
  e.preventDefault(); // Prevent default behavior

  canvas.classList.remove('dragover'); // Reset the 'dragover' class once the file is dropped

  // Get the dropped file (the first file only)
  const file = e.dataTransfer.files[0];

  if (file && file.type.startsWith('audio/')) {
    const fileURL = URL.createObjectURL(file);
    audioElement.src = fileURL; // Set the audio element's source to the dropped file
    audioElement.play(); // Automatically play the audio when the file is dropped

    // Hide the "Plant your audio seed here" text
    dropText.style.opacity = '0'; // Fade out the text

    // Set the flag to true to indicate that a file has been dropped
    fileDropped = true;
  } else {
    alert('Please drop a valid audio file!');
  }
});

// Track mouse position to create the cursor-centered opacity effect
canvas.addEventListener('mousemove', function(e) {
  canvas.mouseX = e.offsetX; // Set the mouse X position on the canvas
  canvas.mouseY = e.offsetY; // Set the mouse Y position on the canvas
});
