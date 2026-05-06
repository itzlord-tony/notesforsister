document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileNameDisplay = document.getElementById('fileName');
    const removeFileBtn = document.getElementById('removeFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const fileList = document.getElementById('fileList');
    const refreshBtn = document.getElementById('refreshBtn');

    const API_BASE = '/api';

    // Fetch and display files
    const fetchFiles = async () => {
        fileList.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Loading notes...</div>';
        try {
            const response = await fetch(`${API_BASE}/files`);
            const files = await response.json();
            
            if (files.length === 0) {
                fileList.innerHTML = '<div class="loader">No notes shared yet. Be the first to upload!</div>';
                return;
            }

            fileList.innerHTML = '';
            files.sort((a, b) => b.date - a.date); // Sort by newest first

            files.forEach(file => {
                const card = document.createElement('div');
                card.className = 'file-card';
                
                const ext = file.name.split('.').pop().toLowerCase();
                let iconClass = 'fa-file-alt';
                if (['jpg', 'jpeg', 'png'].includes(ext)) iconClass = 'fa-file-image';
                if (['pdf'].includes(ext)) iconClass = 'fa-file-pdf';
                if (['doc', 'docx'].includes(ext)) iconClass = 'fa-file-word';
                if (['zip', 'rar'].includes(ext)) iconClass = 'fa-file-archive';

                card.innerHTML = `
                    <div class="file-icon"><i class="fas ${iconClass}"></i></div>
                    <span class="file-name" title="${file.name}">${file.name}</span>
                    <span class="file-meta">${formatBytes(file.size)}</span>
                    <a href="${API_BASE}/download/${file.name}" class="btn-download" download>
                        <i class="fas fa-download"></i> Download
                    </a>
                `;
                fileList.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching files:', error);
            fileList.innerHTML = '<div class="loader error">Failed to load notes. Please check your connection.</div>';
        }
    };

    // Format file size
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileNameDisplay.textContent = file.name;
            fileInfo.classList.remove('hidden');
            document.querySelector('.file-label').classList.add('hidden');
            uploadStatus.className = 'status-msg hidden';
        }
    });

    // Handle file removal
    removeFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        document.querySelector('.file-label').classList.remove('hidden');
    });

    // Handle upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files.length) return;

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Uploading...';
        
        try {
            console.log('Starting upload...');
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();
                console.log('Response body:', result);

                if (response.ok) {
                    showStatus('Success! Note uploaded and ready to share.', 'success');
                    fileInput.value = '';
                    fileInfo.classList.add('hidden');
                    document.querySelector('.file-label').classList.remove('hidden');
                    fetchFiles();
                } else {
                    showStatus(result.error || `Upload failed (Status ${response.status}).`, 'error');
                }
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                showStatus(`Server Error (Status ${response.status}). Please try again later.`, 'error');
            }
        } catch (error) {
            console.error('Detailed Upload Error:', error);
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                showStatus('Cannot connect to server. Please check if the backend is running.', 'error');
            } else {
                showStatus(`An unexpected error occurred: ${error.message}`, 'error');
            }
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<span class="btn-text">Upload Now</span> <i class="fas fa-paper-plane"></i>';
        }
    });

    function showStatus(msg, type) {
        uploadStatus.textContent = msg;
        uploadStatus.className = `status-msg ${type}`;
        uploadStatus.classList.remove('hidden');
    }

    refreshBtn.addEventListener('click', fetchFiles);

    // Initial load
    fetchFiles();
});
