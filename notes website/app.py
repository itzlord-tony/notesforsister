import os
from flask import Flask, request, send_from_directory, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='static', static_url_path='')
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'zip'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/files', methods=['GET'])
def list_files():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    file_list = []
    for f in files:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f)
        stats = os.stat(file_path)
        file_list.append({
            'name': f,
            'size': stats.st_size,
            'date': stats.st_mtime
        })
    return jsonify(file_list)

@app.route('/api/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File is too large. Max size is 100MB.'}), 413

if __name__ == '__main__':
    app.run(debug=True, port=5000)
