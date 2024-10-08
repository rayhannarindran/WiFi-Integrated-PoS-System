const video = document.getElementById('video');
const output = document.getElementById('output');

// Access the webcam
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(function (stream) {
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
    requestAnimationFrame(tick); // Start reading the frames
  })
  .catch(function (err) {
    console.error('Error accessing the camera: ', err);
  });

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      output.textContent = `QR Code Data: ${code.data}`;
    } else {
      output.textContent = "No QR code detected";
    }
  }
  requestAnimationFrame(tick);
}
