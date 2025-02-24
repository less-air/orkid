// Get references to the audio and canvas elements
const audioElement = document.getElementById('audio');
const canvas = document.getElementById('pureplace');
const ctx = canvas.getContext('2d');
const dropArea = document.getElementById('drop-area');
const audioSource = document.getElementById('audioSource');

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
  let barHeight;
  let x = 0;

  // Set shadow blur and color for the "plant-like" circles
  ctx.shadowBlur = 15; // Add blur
  ctx.shadowColor = "rgba(199, 161, 255, 0.6)"; // Light purple shadow for glowing effect

  // Draw purple plant-like shapes (e.g., circles) based on frequency data
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    // Set color based on the frequency value
    const purple = Math.min(255, barHeight + 50);
    const plantColor = `rgb(${purple}, ${Math.floor(purple / 2)}, ${Math.floor(purple / 3)})`; // Purple tones

    // Flip the frequency to make low frequencies at the bottom and high at the top
    const yPos = canvas.height - (i / bufferLength) * canvas.height; // Flip the y-axis

    // Draw a circular shape that expands and shrinks based on the frequency
    ctx.beginPath();
    ctx.arc(x + (canvas.width / bufferLength) / 2, yPos, barHeight / 4, 0, 2 * Math.PI);
    ctx.fillStyle = plantColor;
    ctx.fill();

    x += canvas.width / bufferLength;
  }
}

// Start the visualizer once the audio is playing
audioElement.onplay = function() {
  audioContext.resume().then(() => {
    renderFrame();
  });
};

// Function to handle file drop and update the audio source
function handleFileDrop(event) {
  event.preventDefault();

  // Get the dropped file
  const file = event.dataTransfer.files[0];

  // Ensure the dropped file is an audio file
  if (file && file.type.startsWith('audio')) {
    const audioUrl = URL.createObjectURL(file);
    audioSource.src = audioUrl;
    audioElement.load(); // Reload the audio element with the new source
    audioElement.play(); // Play the new audio

    // Restart the visualizer
    audioContext.resume().then(() => {
      renderFrame();
    });
  } else {
    alert('Please drop a valid audio file!');
  }
}

// Prevent the default behavior when dragging over the drop area
dropArea.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = '#333'; // Change background color when over
});

// Revert the drop area background after the drag
dropArea.addEventListener('dragleave', () => {
  dropArea.style.backgroundColor = 'transparent';
});

// Handle the drop event
dropArea.addEventListener('drop', handleFileDrop);
