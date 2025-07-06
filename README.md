# Wordly Game

A word guessing game inspired by Wordle, with additional features like user registration, difficulty levels, and an admin dashboard.

## Features

- User registration system
- Multiple difficulty levels
- Game statistics tracking
- Admin dashboard with user and session statistics
- Responsive design for mobile and desktop

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wordly.git
cd wordly
```

2. Install dependencies:
```bash
npm install
# If you encounter permission issues with PowerShell, try:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# npm install
```

3. Required Dependencies:
```bash
npm install react-router-dom firebase
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Admin Dashboard

The admin dashboard provides insights into user activity and game statistics. It's protected by a simple password mechanism.

To access the admin dashboard:
- Navigate to `/admin/992233` in your browser
- The dashboard displays:
  - User statistics in tiles (total users, active users, games played, etc.)
  - Recent game sessions in a table
  - Registered users in a table

## Technologies Used

- React with TypeScript
- Firebase for backend services
- React Router for navigation
- Vite for build tooling

## Project Structure

- `/src/components` - React components
- `/src/context` - React context for state management
- `/src/services` - Service classes for data handling
- `/src/utils` - Utility functions and helpers
- `/src/styles` - CSS stylesheets

## License

MIT
