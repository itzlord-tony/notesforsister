# NoteShare - Premium Notes Sharing Website

A modern, elegant, and simple way to share your notes.

## Features
- **Premium Glassmorphic UI**: Beautiful dark theme with modern aesthetics.
- **Easy Uploads**: Drag and drop or browse to upload your notes.
- **Instant Downloads**: Your cousin can see the list of notes and download them instantly.
- **Secure File Handling**: Uses Flask for secure file management.

## How to Run
1. Open your terminal in this folder.
2. Run the command:
   ```bash
   python app.py
   ```
3. Open your browser and go to: `http://127.0.0.1:5000`

## Sharing with your Cousin
To share this with your cousin:
- **On the same network (Wi-Fi)**:
  1. Find your IP address (run `ipconfig` in CMD).
  2. Tell your cousin to visit `http://YOUR_IP:5000` in their browser.
- **Over the Internet**:
  - You can use a tool like **ngrok** to create a public URL:
    ```bash
    ngrok http 5000
    ```
  - Send her the ngrok link!

Enjoy sharing!
