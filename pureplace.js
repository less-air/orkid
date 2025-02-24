// Get references to the audio, canvas, and drop text elements
const audioElement = document.getElementById('audio');
const canvas = document.getElementById('pureplace');
const ctx = canvas.getContext('2d');
const dropText = document.getElementById('drop-text'); // Get the "Plant your audio seed here" text element

// Function to resize canvas based on window size
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8; // 80% of the screen width
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
const dataArray = new Uint8Array(bufferLength);

// Connect the audio source to the analyser
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioContext.destination);

// Visualizer function
function renderFrame() {
  requestAnimationFrame(renderFrame);

  // Get frequency data
  analyser.getByteFrequencyData(dataArray);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Visualizer settings
  const purpleShades = ['#C7A1FF', '#D9A2FF', '#B08DFF', '#A56EFF']; // Different shades of purple
  const maxSize = 40; // Maximum size of blobs
  
  // Set shadow blur and color for the "plant-like" blobs
  ctx.shadowBlur = 20; // Add blur
  ctx.shadowColor = "rgba(199, 161, 255, 0.6)"; // Light purple shadow for glowing effect

  // Draw organic, scattered blobs based on frequency data
  for (let i = 0; i < bufferLength; i++) {
    let barHeight = dataArray[i];

    // Random X and Y positions for scattered effect
    const xPos = Math.random() * canvas.width;
    const yPos = Math.random() * canvas.height;

    // Set the size of each "blob" based on the frequency data
    const size = barHeight / 4 + Math.random() * maxSize; // Adjust the range for more dynamic sizes

    // Randomly pick a purple shade for each blob
    const randomPurple = purpleShades[Math.floor(Math.random() * purpleShades.length)];

    // Draw an organic, blob-like shape
    ctx.beginPath();
    ctx.ellipse(xPos, yPos, size, size / 1.5, Math.random() * Math.PI, 0, Math.PI * 2); // Elliptical shapes for more organic feel
    ctx.fillStyle = randomPurple; // Use a random shade of purple
    ctx.fill();
  }
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
  } else {
    alert('Please drop a valid audio file!');
  }
});
