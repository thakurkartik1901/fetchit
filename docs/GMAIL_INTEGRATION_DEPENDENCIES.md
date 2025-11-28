# Gmail Integration - Required Dependencies

## Frontend Packages to Install

Run these commands in the root of your FetchIt project:

### Core OAuth & Linking Packages
```bash
# Deep linking and OAuth browser flow
npx expo install expo-web-browser expo-linking
```

### Storage Package (if not already installed)
```bash
# Secure storage for tokens
npx expo install react-native-mmkv
```

### State Management (if not already installed)
```bash
# Global state management
npx expo install zustand
```

### Data Fetching (if not already installed)
```bash
# Server state management and HTTP client
npx expo install @tanstack/react-query axios
```

## Backend Packages

Backend dependencies are already defined in `backend/package.json`. To install:

```bash
cd backend
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `googleapis` - Google's official API client
- `nodemon` - Development auto-reload (dev dependency)

## Verify Installation

### Frontend
Check if packages are in your `package.json`:
```bash
cat package.json | grep -E "expo-web-browser|expo-linking|react-native-mmkv|zustand|@tanstack/react-query|axios"
```

### Backend
```bash
cd backend
npm list
```

## Package Versions

The implementation is compatible with:
- `expo-web-browser`: ^13.0.0+
- `expo-linking`: ^6.0.0+
- `react-native-mmkv`: ^2.0.0+
- `zustand`: ^4.0.0+
- `@tanstack/react-query`: ^5.0.0+
- `axios`: ^1.6.0+

## Notes

- Run `npx expo install` instead of `npm install` for Expo packages to ensure compatibility
- After installing new native dependencies, you may need to rebuild:
  ```bash
  # For development builds
  npx expo prebuild --clean
  pnpm android  # or pnpm ios
  ```
