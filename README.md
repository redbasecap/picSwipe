# PicSwipe

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/redbasecap)

A web application for managing Google Photos with intuitive swipe gestures.

## Project Status: On Hold

This project is currently on hold due to limitations in the Google Photos API. While the core functionality is working, the following features are affected:

- ❌ Image deletion is not possible through the Google Photos API
- ✅ Image viewing and navigation works
- ✅ Image favoriting works
- ✅ Image archiving works

## Features

- 🔐 Google Authentication
- 📸 View photos from your Google Photos library
- 👆 Intuitive swipe gestures:
  - ➡️ Swipe right: Next photo
  - ⬅️ Swipe left: Delete photo (currently disabled)
  - ⬆️ Swipe up: Favorite photo
  - ⬇️ Swipe down: Archive photo
- 🎨 Modern, responsive UI
- 🔄 Real-time updates

## Technical Stack

- Next.js
- Firebase Authentication
- Google Photos API
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase and Google API credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## Future Development

This project will be resumed once the Google Photos API provides support for image deletion. In the meantime, we're exploring alternative approaches to achieve the desired functionality.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
