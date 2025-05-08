# Navigate to your project directory
cd "d:\Kuliah\semester 8\joki\smart lamp\Swell"

# Install dependencies if needed
npm install

# Create assets directory if it doesn't exist
node -e "require('fs').mkdirSync('android/app/src/main/assets', { recursive: true })"

# First terminal: Start Metro bundler
npm start

# Second terminal: Install and run on the emulator
npm run android
