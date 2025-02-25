// Track positions and velocities of blobs
let blobs = [];

// Function to generate a new blob
function createBlob() {
  return {
    xPos: Math.random() * canvas.width,
    yPos: Math.random() * canvas.height,
    velocityX: (Math.random() - 0.5) * 0.2, // Slow horizontal velocity
    velocityY: (Math.random() - 0.5) * 0.2, // Slow vertical velocity
  };
}

// Initialize blobs
for (let i = 0; i < bufferLength; i++) {
  blobs.push(createBlob());
}

// Visualizer function (renderFrame remains mostly unchanged)
function renderFrame() {
  frameCounter++;

  if (frameCounter < frameDelay) {
    requestAnimationFrame(renderFrame); // Skip this frame
    return;
  }

  frameCounter = 0;

  analyser.getByteFrequencyData(frequencyData);
  timeDomainAnalyser.getByteTimeDomainData(timeDomainData);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    sum += timeDomainData[i];
  }
  const averageLoudness = sum / timeDomainData.length;
  const loudness = (averageLoudness / 128) * 100;
  const opacity = loudness / 100;

  const mouseX = canvas.mouseX || 0;
  const mouseY = canvas.mouseY || 0;
  const radius = 500;

  // Move each blob based on its velocity and update its position
  for (let i = 0; i < bufferLength; i++) {
    let barHeight = frequencyData[i];
    let blob = blobs[i]; // Access the current blob

    // Update blob position based on its velocity
    blob.xPos += blob.velocityX;
    blob.yPos += blob.velocityY;

    // Slow down the movement by controlling the velocity range
    blob.velocityX *= 0.98;  // Slight drag effect on horizontal velocity
    blob.velocityY *= 0.98;  // Slight drag effect on vertical velocity

    // Add some random bouncing effect if the blob reaches the edge of the canvas
    if (blob.xPos <= 0 || blob.xPos >= canvas.width) {
      blob.velocityX *= -1;
    }
    if (blob.yPos <= 0 || blob.yPos >= canvas.height) {
      blob.velocityY *= -1;
    }

    const size = (barHeight / 4 + Math.random() * maxSize) * (loudness / 100);
    const randomPurple = purpleShades[Math.floor(Math.random() * purpleShades.length)];

    const dist = Math.sqrt(Math.pow(mouseX - blob.xPos, 2) + Math.pow(mouseY - blob.yPos, 2));

    let blobOpacity = 0;
    if (dist < radius) {
      blobOpacity = opacity * (1 - dist / radius);
    }

    ctx.beginPath();
    ctx.ellipse(blob.xPos, blob.yPos, size, size / 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = randomPurple;
    ctx.globalAlpha = blobOpacity;
    ctx.fill();
  }

  requestAnimationFrame(renderFrame);
}
