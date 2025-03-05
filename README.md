# Secureum Race Runner

A browser extension that helps security researchers simulate Secureum races in a realistic environment. Secureum hosts excellent smart contract security challenges at https://ventral.digital/posts/, but their live races fill up quickly. This tool lets you practice these challenges as if you were in a real race.

## Features

- Simulates the real race environment with a 16-minute timer
- Automatically scores your answers when time expires
- Hides solutions until the race is complete
- Tracks your progress with detailed scoring per question
- Provides a clean, distraction-free practice environment
- Generate and share beautiful result cards directly to social media

![Screenshot](https://i.ibb.co/ym0ggZ2C/screenshot-78.png)
## Installation

1. **Download the Extension**
   - Clone this repository or download it as a ZIP file
   - Extract the files to a folder on your computer

2. **Load in Chrome/Edge/Brave**
   - Open your browser and go to the extensions page:
     - Chrome: `chrome://extensions/`
     - Edge: `edge://extensions/`
     - Brave: `brave://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the folder containing the extension files
   - The Secureum Race Runner extension should now appear in your extensions list

## How to Use

1. **Navigate to a Secureum Race**
   - Go to any Secureum race page on Ventral Digital (e.g., https://ventral.digital/posts/2021/11/7/secureum-bootcamp-security-pitfalls-amp-best-practices-101-quiz/)
   - The extension will automatically expand the navigation sidebar to help you find races

2. **Start the Race Simulation**
   - Click the play button that appears at the top of the page
   - The 16-minute timer will start, and solutions will be hidden
   - Answer the questions by checking the appropriate options

3. **View Your Results**
   - When the timer ends (or if you click the stop button), your answers will be scored
   - You'll see a percentage score and the number of fully correct answers
   - Each question will be marked with a check (✓) or X (✗) and its score percentage

4. **Share Your Results**
   - Click the "Generate Image" button to create a beautiful result card with your race results
   - The image will automatically upload and prepare for sharing
   - You can:
     - Download the image directly and manually attach it to your social media posts (recommended for best visual results)
     - Share on X with a single click (includes your score, completion time, and image URL)
   - The result card includes your score, correct answers count, and completion time

5. **Quick Access to Races**
   - When not on a Secureum race page, click the extension icon in your browser toolbar
   - You'll see a motivational message and a link to start practicing

## Why Use This?

While anyone can study Secureum's race questions and solutions on Ventral Digital, this extension recreates the actual race experience by:
- Enforcing the 16-minute time limit
- Hiding solutions until completion
- Calculating scores using the same scoring system as real races
- Eliminating the need for manual timing and scoring

## Note
The extension uses the ImgBB API to upload the result image. The API key of free tier is hardcoded in the extension and is limited to some number of requests per day, feel free to replace it with your own.

## Disclaimer

This extension is a helper tool for practicing Secureum races. We do not hold any rights to Secureum content or races. All Secureum content belongs to its respective owners. This tool is designed solely to enhance the practice experience for security researchers using publicly available Secureum race content on Ventral Digital.

## License

MIT