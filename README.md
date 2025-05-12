# StraySense

A web application for managing and tracking stray animals.

## Project Structure

```
straysense/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── services/      # API services
├── backend/           # Node.js backend server
│   ├── src/          # Source code
│   └── config/       # Configuration files
├── database/         # Database related files
└── images/          # Project images and assets
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Set up environment variables (see .env.example files in both frontend and backend)
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend server
   cd ../frontend
   npm start
   ```

## Features

- User authentication
- Stray animal tracking
- Image upload and management
- Location-based services
- Real-time updates

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
