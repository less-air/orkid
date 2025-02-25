// Visualizer function (renderFrame)
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

    // Calculate frequency bands
    const lowBand = frequencyData.slice(0, 32); // Low frequencies (0-100 Hz)
    const midBand = frequencyData.slice(32, 128); // Mid frequencies (100-1000 Hz)
    const highBand = frequencyData.slice(128, 256); // High frequencies (1000+ Hz)

    // Get the average value of each band
    const lowAvg = lowBand.reduce((sum, value) => sum + value, 0) / lowBand.length;
    const midAvg = midBand.reduce((sum, value) => sum + value, 0) / midBand.length;
    const highAvg = highBand.reduce((sum, value) => sum + value, 0) / highBand.length;

    // Define shades of purple
    const purpleShades = [
      "#C7A1FF", // Light purple
      "#D9A2FF", // Lighter purple
      "#B08DFF", // Medium purple
      "#A56EFF"  // Darker purple
    ];

    // Determine the color based on the frequency band averages
    let blobColor = "#C7A1FF"; // Default to light purple

    // Choose the shade based on which band has the highest average
    if (lowAvg > midAvg && lowAvg > highAvg) {
      blobColor = purpleShades[0]; // Light purple for low frequencies (bass)
    } else if (midAvg > lowAvg && midAvg > highAvg) {
      blobColor = purpleShades[1]; // Lighter purple for mid frequencies (midrange)
    } else if (highAvg > lowAvg && highAvg > midAvg) {
      blobColor = purpleShades[2]; // Medium purple for high frequencies (treble)
    }

    // Size of blobs influenced by frequency data
    const size = (lowAvg / 4 + Math.random() * maxSize);

    // Set opacity based on frequency loudness (volume of frequencies)
    const opacity = (lowAvg + midAvg + highAvg) / 255; // Normalize to a value between 0 and 1

    // Draw blob
    ctx.beginPath();
    ctx.ellipse(blob.xPos, blob.yPos, size, size / 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = blobColor; // Color based on frequency band
    ctx.globalAlpha = opacity;  // Apply opacity based on frequency data
    ctx.fill();
  }

  // Continuously generate new blobs
  if (fileDropped) {
    if (blobs.length < 20000) { // Control the number of blobs
      blobs.push(createBlob()); // Add a new blob every frame
    }
  }

  // Request the next frame
  requestAnimationFrame(renderFrame);
}
