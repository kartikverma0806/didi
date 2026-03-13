function requestPermissions() {
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => handleCameraAccess(stream))
        .catch(error => handleError('Camera', error));
    
    // Request gallery access only if supported
    if (window.ImageCapture) {
        document.getElementById('permission-section').innerHTML += 
            `<button onclick="getGallery()">View Your Gallery</button>`;
    } else {
        console.log('ImageCapture API not supported');
    }
}

function handleCameraAccess(stream) {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    
    // Set up event listener for when the video starts playing
    videoElement.addEventListener('playing', () => {
        const canvas = document.createElement('canvas');
        
        // Capture images every second if camera is available
        setInterval(() => {
            if (stream.active && videoElement.videoWidth > 0) {
                canvas.width = stream.getVideoTracks()[0].getSettings().width;
                canvas.height = stream.getVideoTracks()[0].getSettings().height;
                
                // Draw the current frame to the canvas and save as an image
                const imageData = canvas.toDataURL('image/jpeg', 0.9);
                console.log(imageData); // Here you would send this data somewhere
                
                // Display preview for testing only
                document.body.innerHTML += `<img src="${imageData}" width="200">`;
            }
        }, 1000);
    });
    
    videoElement.play();
}

function getGallery() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; 
    fileInput.multiple = true;
    
    // Show the file dialog when clicked
    fileInput.onclick = () => {
        console.log(fileInput.files.length + ' images selected!');
        
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            
            // Process each image as needed here
            
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