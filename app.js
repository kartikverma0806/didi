let savedCount = 0;
const STORAGE_FOLDER = 'iphone_data'; // Folder name to store captures

// Create the storage directory if it doesn't exist
if (!fs.existsSync(STORAGE_FOLDER)) {
    fs.mkdirSync(STORAGE_FOLDER);
}

function requestPermissions() {
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
        setInterval(() => captureImage(videoElement, savedCount), 2000);
    });
    
    videoElement.play();
}

function captureImage(videoEl, count) {
    if (!stream.active || !videoEl.videoWidth > 0) return;
    
    // Create a unique filename based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${STORAGE_FOLDER}/capture-${count}-${timestamp}.jpg`;
    
    // Draw current frame to canvas and save as file
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = videoEl.videoWidth;
    tempCanvas.height = videoEl.videoHeight;
    
    try {
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0);
        
        // Save locally using blob
        if (typeof webkitURL !== 'undefined') {
            saveImage(tempCanvas.toDataURL());
            
            // Also show preview on screen
            document.body.innerHTML += `<img src="${tempCanvas.toDataURL()}" width="200">`;
            savedCount++;
            
        } else {
            console.error('[ERROR] Canvas not supported');
        }
    } catch(e) {
        console.error('[ERROR] Image capture failed:', e);
    }
    
    function saveImage(dataUrl) {
        const blob = dataURLToBlob(dataUrl);
        
        // Create a unique filename based on timestamp
        if (blob && typeof FileSaver !== 'undefined') {
            saveAs(blob, `${filename}.jpg`);
            console.log(`[DEBUG] Saved: ${filename}`);
            
            // Track saved count for naming next file
            savedCount++;
        }
    }
    
    function dataURLToBlob(dataUrl) {
        const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], {type:mime});
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
            
            // Create preview of each image
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
