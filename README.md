![MUSICK Logo](https://raw.githubusercontent.com/kingsareliveee/waveflow/main/musick.png)

# 🎵 MUSICK

> **Flow With The Sound.**

A modern, full-stack music streaming web application built with **React**, **Vite**, **Node.js**, **Express**, **Supabase**, and **yt-dlp**, delivering a fast, immersive, and premium music listening experience.

MUSICK combines a beautiful UI with real-time audio streaming, persistent playback, playlist management, and a responsive design inspired by modern music platforms.

---

## ✨ Features

### 🎧 Music Streaming
- Stream music directly from YouTube
- Fast backend-powered audio streaming
- Seamless playback
- Auto play next song
- Queue management
- Persistent music player

### 🔍 Search
- Instant song search
- Artist search
- Album thumbnails
- Responsive search experience

### ❤️ Personal Library
- Liked Songs
- Recently Played
- Custom Playlists
- Playlist management
- Song history

### 👤 Authentication
- Secure authentication with Supabase
- User accounts
- Persistent sessions

### 🎨 Modern UI
- Dark premium interface
- Glassmorphism
- Responsive design
- Smooth animations
- Theme support
- Mobile-first experience

### ⚡ Performance
- Fast rendering
- Optimized React architecture
- Efficient audio streaming
- Lazy-loaded components
- Persistent player across navigation

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Lucide Icons

## Backend

- Node.js
- Express.js
- yt-dlp

## Database & Authentication

- Supabase

---

# 📂 Project Structure

```
MUSICK/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── lib/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── index.js
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/yourusername/musick.git

cd musick
```

---

## Install dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

# ⚙ Environment Variables

## Frontend

Create:

```
client/.env
```

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## Backend

Create:

```
server/.env
```

```env
PORT=5000
```

---

# ▶ Running the project

## Backend

```bash
cd server

npm start
```

Runs on

```
http://localhost:5000
```

---

## Frontend

```bash
cd client

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# 📱 Responsive Design

MUSICK is optimized for:

- 📱 Mobile
- 📱 Tablet
- 💻 Laptop
- 🖥 Desktop

---

# 🎵 Streaming Architecture

```
User

     │

     ▼

Frontend Player

     │

     ▼

Express Backend

     │

     ▼

yt-dlp

     │

     ▼

YouTube Audio Stream

     │

     ▼

Browser Audio Player
```

---

# 🧠 Core Features

- Search music
- Stream songs
- Queue songs
- Next / Previous
- Play / Pause
- Volume control
- Seek support
- Playlist creation
- Recently Played
- Liked Songs
- Persistent player
- Authentication
- Responsive UI

---

# 🎨 Design Philosophy

MUSICK focuses on creating an immersive music experience inspired by platforms like:

- Spotify Premium
- Apple Music
- Arc Browser
- Linear
- Framer
- Raycast

The goal is to deliver a clean, premium interface where music remains the center of attention.

---

# 🔒 Authentication

Authentication is powered by **Supabase Auth**.

Features include:

- Secure login
- Secure signup
- Persistent sessions
- User-specific library and playlists

---

# ⚡ Performance Optimizations

- Optimized React rendering
- Zustand state management
- Lazy loading
- Persistent audio player
- Efficient streaming
- Smooth animations
- Responsive layouts
- Optimized API requests

---



# 📌 Roadmap

- [ ] Lyrics support
- [ ] Offline caching
- [ ] Equalizer
- [ ] Dynamic themes
- [ ] Audio visualizer
- [ ] Crossfade playback
- [ ] Playlist sharing
- [ ] Friend activity
- [ ] Desktop PWA
- [ ] Keyboard shortcuts

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/awesome-feature
```

3. Commit changes

```bash
git commit -m "Add awesome feature"
```

4. Push

```bash
git push origin feature/awesome-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Anuj Tripathi**

If you like this project, consider giving it a ⭐ on GitHub.

---

# ⭐ Support

If you found MUSICK useful:

⭐ Star the repository

🍴 Fork the project

🛠 Contribute improvements

🎵 Enjoy the music!

---

<p align="center">
  <b>🎶 MUSICK — Flow With The Sound.</b>
</p>
