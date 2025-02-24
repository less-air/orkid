// Get references to the audio and canvas elements
const audioElement = document.getElementById('audio');
const canvas = document.getElementById('pureplace');
const ctx = canvas.getContext('2d');

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
  const xPos = canvas.width / 2; // All circles will be at the center (same x value)
  let barHeight;

  // Set shadow blur and color for the "plant-like" circles
  ctx.shadowBlur = 15; // Add blur
  ctx.shadowColor = "rgba(199, 161, 255, 0.6)"; // Light purple shadow for glowing effect

  // Set a fixed purple color for all circles
  const purple = 199;
  const plantColor = `rgb(${purple}, ${Math.floor(purple / 2)}, ${Math.floor(purple / 3)})`; // Purple tone

  // Draw purple plant-like circles at the same x position (centered vertically)
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    // Flip the frequency to make low frequencies at the bottom and high at the top
    const yPos = canvas.height - (i / bufferLength) * canvas.height; // Flip the y-axis

    // Draw a circular shape that expands and shrinks based on the frequency
    ctx.beginPath();
    ctx.arc(xPos, yPos, barHeight / 4, 0, 2 * Math.PI); // All circles at the same xPos (center)
    ctx.fillStyle = plantColor;
    ctx.fill();
  }
}

// Start the visualizer once the audio is playing
audioElement.onplay = function() {
  audioContext.resume().then(() => {
    renderFrame();
  });
};
