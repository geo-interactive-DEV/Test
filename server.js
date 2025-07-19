const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_CODE = "supersecret";  // Change this to your code

const APPS_DB_FILE = path.join(__dirname, "apps_db.json");
const UPLOAD_FOLDER = path.join(__dirname, "uploaded_apps");

// Create upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_FOLDER);
    },
    filename: function (req, file, cb) {
        // Save with original filename, or you could generate unique name here
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded app files
app.use('/download', express.static(UPLOAD_FOLDER));

// Serve static assets (like CSS if you want)
app.use('/static', express.static(path.join(__dirname, 'static')));

// Helper to read apps DB
function readAppsDb() {
    if (!fs.existsSync(APPS_DB_FILE)) {
        fs.writeFileSync(APPS_DB_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(APPS_DB_FILE);
    return JSON.parse(data);
}

// Helper to write apps DB
function writeAppsDb(apps) {
    fs.writeFileSync(APPS_DB_FILE, JSON.stringify(apps, null, 2));
}

// Front page - login form
app.get('/', (req, res) => {
    res.send(`
        <h1>App Upload Portal</h1>
        <form method="POST" action="/login">
            <label>Enter code to upload apps:</label><br>
            <input type="password" name="code" required />
            <button type="submit">Login</button>
        </form>
    `);
});

// Handle login form
app.post('/login', (req, res) => {
    const code = req.body.code;
    if (code === SECRET_CODE) {
        // Show upload form
        res.send(`
            <h1>Upload New App</h1>
            <form method="POST" action="/upload" enctype="multipart/form-data">
                <label>App Name:</label><br>
                <input type="text" name="name" required /><br>
                <label>Description:</label><br>
                <textarea name="description" required></textarea><br>
                <label>Category:</label><br>
                <select name="category" required>
                    <option value="official">Official</option>
                    <option value="community">Community</option>
                    <option value="unapproved">Unapproved</option>
                </select><br>
                <label>Python file (.py):</label><br>
                <input type="file" name="appfile" accept=".py" required /><br><br>
                <button type="submit">Upload</button>
            </form>
        `);
    } else {
        res.send("Wrong code. <a href='/'>Try again</a>");
    }
});

// Handle app upload
app.post('/upload', upload.single('appfile'), (req, res) => {
    const { name, description, category } = req.body;
    const file = req.file;

    if (!file || !name || !description || !category) {
        return res.send("Missing data. <a href='/'>Try again</a>");
    }

    // Read current apps DB
    const apps = readAppsDb();

    // Add new app metadata
    apps.push({
        name,
        description,
        category,
        filename: file.originalname
    });

    writeAppsDb(apps);

    res.send(`App "${name}" uploaded successfully! <a href="/">Upload another</a>`);
});

// Serve apps metadata dynamically from DB
app.get('/apps', (req, res) => {
    const apps = readAppsDb();
    res.json(apps);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
