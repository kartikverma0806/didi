function requestPermissions() {
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => handleCameraAccess(stream))
        .catch(error => handleError('Camera', error));
    
    // Add gallery button if supported
    const supportGallery = window.ImageCapture;
    document.getElementById('gallery-control').innerHTML += 
        supportGallery ?
            `<button onclick="getGallery()">View Your Gallery</button>` :
            '<!-- ImageCapture API not available -->';
}

function handleCameraAccess(stream) {
    console.log('[DEBUG] Camera access granted');
    
    // Create video element for preview
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    document.getElementById('camera-preview').appendChild(videoElement);
    
    // Display the preview container now that we have content
    document.getElementById('camera-preview').style.display = 'block';
    
    // Set up event handler for when playback starts
    videoElement.addEventListener('playing', () => {
        console.log('[DEBUG] Camera stream started');
        
        // Capture image every 2 seconds (adjust as needed)
        setInterval(() => captureImage(videoElement, canvas), 2000);
    });
    
    videoElement.play();
}

function captureImage(videoEl, targetCanvas) {
    if (!stream.active || !videoEl.videoWidth > 0) return;
    
    // Resize canvas to match stream dimensions
    const ctx = targetCanvas.getContext('2d');
    targetCanvas.width = videoEl.videoWidth;
    targetCanvas.height = videoEl.videoHeight;
    
    try {
        // Draw current frame and save as image
        ctx.drawImage(videoEl, 0, 0);
        
        console.log('[DEBUG] Image captured successfully');
        
        // Convert to data URL for display or processing
        const imageData = targetCanvas.toDataURL('image/jpeg', 0.9);
        
        // Display preview (optional)
        document.body.innerHTML += `<img src="${imageData}" width="200">`;
    } catch(e) {
        console.error('[ERROR] Image capture failed:', e);
    }
}

function getGallery() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; 
    fileInput.multiple = true;
    
    // Show the dialog when clicked
    fileInput.onclick = () => {
        console.log('[DEBUG] Gallery selection:', fileInput.files.length);
        
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            
            // Process each image as needed
            
            // Preview the image
            const imgPreview = document.createElement('img');
            imgPreview.src = URL.createObjectURL(file);
            imgPreview.style.maxWidth = '300px';
            document.body.appendChild(imgPreview);
        }
    };
    
    fileInput.click();
}

function handleError(source, error) {
    console.error(`Error accessing ${source}:`, error);
    alert(`${source} access denied or not supported`);
}
