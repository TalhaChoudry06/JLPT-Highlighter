# 🗾 JLPT Highlighter – Chrome Extension

**JLPT Highlighter** is a Chrome extension that helps Japanese learners by scanning any Japanese website, identifying the JLPT level (N5 to N1) of each word or phrase, and highlighting them with color-coded tags. Users can bookmark words and look up their definitions using an integrated dictionary powered by IndexedDB.

## 📌 Features

- 🔍 **JLPT Level Detection**: Automatically highlights Japanese words and phrases by JLPT level.
- 🎨 **Color-Coded Highlighting**:
  - **N5** – 🟩 Green
  - **N4** – 🟦 Blue
  - **N3** – 🟨 Yellow
  - **N2** – 🟧 Orange
  - **N1** – 🟥 Red
- 📖 **Inline Dictionary Lookup**: Click on any highlighted word to see its meaning, reading, and JLPT level.
- ⭐ **Bookmark Words**: Save words you want to review later. Bookmarks are stored locally using IndexedDB.
- 📑 **Bookmark Manager**: View, search, and remove bookmarked words via the popup or a dedicated page.

## 🛠️ Installation (Development Mode)

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **"Load unpacked"** and select the project folder.
5. Visit any Japanese website to see the extension in action!


## ⚙️ Technologies Used

- JavaScript (ES6+)
- Chrome Extension APIs (content scripts, background scripts, storage)
- IndexedDB (for persistent bookmarks)
- Kuromoji.js (Japanese tokenizer)
- JSON-based JLPT dictionary

## 🚧 Future Plans

- Export bookmarks to Anki or CSV
- Custom color and JLPT level settings
- Sentence-level grammar analysis
- Debug

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request. There are many bugs...

## 📄 License

MIT License © 2025 

