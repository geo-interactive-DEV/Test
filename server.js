const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors()); // enable CORS for all origins

// Apps metadata
const APPS = [
  {
    name: "Reminder Timer",
    description: "Set a timer with a custom message.",
    category: "official",
    filename: "reminder_timer.py"
  },
  {
    name: "To-Do List",
    description: "Organize your tasks and check them off.",
    category: "official",
    filename: "todo_list.py"
  },
  {
    name: "Weather Check",
    description: "Check local weather from an API.",
    category: "community",
    filename: "weather_check.py"
  },
  {
    name: "Meme Generator",
    description: "Make random meme captions (unapproved).",
    category: "unapproved",
    filename: "meme_generator.py"
  }
];

// Serve app metadata
app.get('/apps', (req, res) => {
  res.json(APPS);
});

// Serve app files from hosted_apps folder
app.use('/download', express.static(path.join(__dirname, 'hosted_apps')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
