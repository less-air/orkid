// Get references to the audio, canvas, and drop text elements
const audioElement = document.getElementById('audio');
const canvas = document.getElementById('pureplace');
const ctx = canvas.getContext('2d');
const dropText = document.getElementById('drop-text'); // Get the "Plant your audio seed here" text element
const uploadButton = document.getElementById('upload-button'); // Upload button
const audioUploadInput = document.getElementById('audio-upload-input'); // Hidden file input

let fileDropped = false; // Flag to check if a file has been dropped

// Function to resize canvas based on window size
function resizeCanvas() {
  canvas.width = window.innerWidth * 1; // 100% of the screen width
  canvas.height = window.innerHeight * 0.8; // 80% of the screen height
}

// Call resizeCanvas to set the initial canvas size
resizeCanvas();

// Listen for window resize events to adjust the canvas size dynamically
window.addEventListener('resize', resizeCanvas);

// Set up the audio context and analyser
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;  // Defines the frequency bins
const bufferLength = analyser.frequencyBinCount;
const frequencyData = new Uint8Array(bufferLength);

// Create a new analyser for time-domain data (loudness)
const timeDomainAnalyser = audioContext.createAnalyser();
timeDomainAnalyser.fftSize = 256;  // Defines the size of the time-domain data
const timeDomainData = new Uint8Array(timeDomainAnalyser.frequencyBinCount);

// Connect the audio source to the analysers
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
source.connect(timeDomainAnalyser);
analyser.connect(audioContext.destination);
timeDomainAnalyser.connect(audioContext.destination);

// Frame delay interval (how often we update the blobs)
const frameDelay = 1; // Every 5 frames (you can increase this value to update less frequently)
let frameCounter = 0;

// Visualizer function
function renderFrame() {
  frameCounter++;

  // Only update the blobs every `frameDelay` frames
  if (frameCounter < frameDelay) {
    requestAnimationFrame(renderFrame); // Skip this frame
    return;
  }

  // Reset frame counter to start the cycle again
  frameCounter = 0;

  // Get frequency and time-domain data
  analyser.getByteFrequencyData(frequencyData);
  timeDomainAnalyser.getByteTimeDomainData(timeDomainData);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // If a file has been dropped, set the background to black (transparent) after the drop
  if (fileDropped) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background (black)
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Apply the transparent fill
  } else {
    // If no file is dropped, we can keep the regular behavior for background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Light black or semi-transparent background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Visualizer settings
  const purpleShades = ['#C7A1FF', '#D9A2FF', '#B08DFF', '#A56EFF']; // Different shades of purple
  const maxSize = 40; // Maximum size of blobs
  
  // Set shadow blur and color for the "plant-like" blobs
  ctx.shadowBlur = 20; // Add blur
  ctx.shadowColor = "rgba(199, 161, 255, 0.6)"; // Light purple shadow for glowing effect

  // Calculate loudness from time-domain data
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    sum += timeDomainData[i];
  }
  const averageLoudness = sum / timeDomainData.length;
  const loudness = (averageLoudness / 128) * 100; // Normalize the loudness to a percentage (0 to 100)

  // Calculate opacity based on loudness (from 0 to 1)
  const opacity = loudness / 100; // Map loudness (0-100) to opacity (0-1)

  // Get the mouse position (to center the circle of opacity)
  const mouseX = canvas.mouseX || 0;
  const mouseY = canvas.mouseY || 0;

  // Set the radius of the circle that will control the opacity
  const radius = 50 * (loudness / 100); // The cursor radius grows based on the loudness

  // Draw organic, scattered blobs based on frequency data
  for (let i = 0; i < bufferLength; i++) {
    let barHeight = frequencyData[i];

    // Random X and Y positions for scattered effect
    const xPos = Math.random() * canvas.width;
    const yPos = Math.random() * canvas.height;

    // Set the size of each "blob" based on both the frequency data and loudness
    const size = (barHeight / 4 + Math.random() * maxSize) * (loudness / 100); // Scale by loudness

    // Randomly pick a purple shade for each blob
    const randomPurple = purpleShades[Math.floor(Math.random() * purpleShades.length)];

    // Calculate the distance from the current blob position to the cursor
    const dist = Math.sqrt(Math.pow(mouseX - xPos, 2) + Math.pow(mouseY - yPos, 2));

    // Adjust the opacity of the blob based on the distance from the cursor
    let blobOpacity = 0.01;
    if (dist < radius) {
      // If the blob is within the radius, adjust opacity based on proximity
      blobOpacity = opacity * (1 - dist / radius);
    }

    // Draw an organic, blob-like shape
    ctx.beginPath();
    ctx.ellipse(xPos, yPos, size, size / 1.5, Math.random() * Math.PI, 0, Math.PI * 2); // Elliptical shapes for more organic feel
    ctx.fillStyle = randomPurple; // Use a random shade of purple
    ctx.globalAlpha = blobOpacity; // Set the opacity for each blob based on proximity to the cursor
    ctx.fill();
  }

  // Request the next frame to continue the animation
  requestAnimationFrame(renderFrame);
}

// Start the visualizer once the audio is playing
audioElement.onplay = function() {
  audioContext.resume().then(() => {
    renderFrame();
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

// Upload button functionality for mobile users
uploadButton.addEventListener('click', function() {
  audioUploadInput.click(); // Trigger the hidden file input click
});

// Handle file input change (when a file is selected through the upload button)
audioUploadInput.addEventListener('change', function(e) {
  const file = e.target.files[0];

  if (file && file.type.startsWith('audio/')) {
    const fileURL = URL.createObjectURL(file);
    audioElement.src = fileURL; // Set the audio element's source to the uploaded file
    audioElement.play(); // Automatically play the audio when the file is uploaded

    // Hide the "Plant your audio seed here" text
    dropText.style.opacity = '0'; // Fade out the text

    // Set the flag to true to indicate that a file has been uploaded
    fileDropped = true;
  } else {
    alert('Please upload a valid audio file!');
  }
});

// Track mouse position to create the cursor-centered opacity effect
canvas.addEventListener('mousemove', function(e) {
  canvas.mouseX = e.offsetX;
  canvas.mouseY = e.offsetY;
});
