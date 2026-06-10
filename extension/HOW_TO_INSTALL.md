# Lifeline Recall — Chrome Extension
## How to Install & Use

---

## Installation (takes 2 minutes)

### Step 1 — Open Chrome Extensions
Open Chrome and go to:
```
chrome://extensions
```

### Step 2 — Enable Developer Mode
Toggle **Developer mode** ON in the top-right corner of the page.

### Step 3 — Load the extension
Click **"Load unpacked"** → navigate to your project folder → select the **`extension`** folder inside `Lifeline MEDed`.

```
Lifeline MEDed/
└── extension/          ← Select THIS folder
    ├── manifest.json
    ├── content.js
    ├── background.js
    ├── youtube.js
    ├── popup.html
    └── ...
```

### Step 4 — Pin the extension
Click the puzzle piece 🧩 icon in Chrome toolbar → find **Lifeline Recall** → click the pin icon.

The green **L** icon will appear in your toolbar. You're ready.

---

## How to Use

### On any webpage (UWorld, Amboss, textbooks, etc.)

1. **Highlight any text** on the page
2. A floating **"Capture with Lifeline"** button appears near your selection
3. Click it — a sidebar slides in from the right
4. Choose your source type (Q-Bank, Video, Textbook, Notes)
5. Click **"⚡ Generate Flashcards + Study Guide"**
6. Review the generated cards, then click **"💾 Save All to Lifeline"**

You can also **right-click** selected text → **"Capture with Lifeline Recall"** for the same result.

### On YouTube

1. Go to any medical YouTube video (Boards & Beyond, Osmosis, Ninja Nerd, etc.)
2. A **Lifeline Recall bar** appears below the video title
3. Choose:
   - **⏱ Current Segment** — captures what's being said right now
   - **⏪ Last 60s** — captures the last minute of content
   - **📋 Full Transcript** — captures the entire video transcript
4. The sidebar opens with the captured text → generate cards instantly

> **Tip:** For best results, open YouTube's transcript panel first (click `...` under the video → "Show transcript"), then use "Full Transcript" capture.

### Extension Popup (quick access)

Click the **L icon** in your Chrome toolbar to:
- See how many cards you've saved
- **Paste any text** and generate cards without leaving your current tab
- Open Lifeline or Lifeline Recall in a new tab
- View recently saved cards

---

## Connect to Your Lifeline Account

To save cards to your Lifeline account (with spaced repetition):

1. Click the **L icon** in Chrome
2. Enter your Lifeline URL: `http://localhost:3000` (or your deployed URL)
3. Enter your API token from Lifeline Settings → API
4. Click **Connect Account**

**Without connecting:** The extension still works — cards are generated locally and you can copy/review them, but they won't sync to your Lifeline dashboard.

---

## Works On

| Site | What it captures |
|------|-----------------|
| **UWorld** | Question stems + answer explanations |
| **Amboss** | Article content + question explanations |
| **YouTube** | Video subtitles + full transcripts |
| **Boards & Beyond** | Any text you highlight |
| **Osmosis** | Any text you highlight |
| **PubMed / NCBI** | Research abstracts |
| **UpToDate** | Clinical summaries |
| **Any webpage** | Any highlighted text |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close sidebar | `Escape` |
| Open popup | Click the L icon |

---

## Troubleshooting

**Floating button doesn't appear?**
→ Make sure you selected at least 30 characters of text. Very short selections are ignored.

**YouTube bar not showing?**
→ Refresh the page after installing the extension. YouTube is a single-page app and sometimes needs a refresh.

**Cards not saving?**
→ Make sure Lifeline is running (`npm run dev`) and you're connected in the popup.

**Extension not loading?**
→ Make sure you selected the `extension/` subfolder, not the parent `Lifeline MEDed/` folder.
