# Create assets directory if it doesn't exist
mkdir -p android/app/src/main/assets
# Clear any existing bundle
rm -f android/app/src/main/assets/index.android.bundle
# Clear the res directory to avoid conflicts
rm -rf android/app/src/main/res/drawable-*
rm -rf android/app/src/main/res/raw
