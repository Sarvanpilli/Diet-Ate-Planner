# 💪 Diet-Ate-Planner

A comprehensive full-stack fitness and diet coaching platform that helps users achieve their health goals through personalized diet plans, workout tracking, AI-powered nutritional analysis, and progress monitoring.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure registration and login with JWT-based authentication
- **Profile Management** - Personalized user profiles with health metrics (age, gender, height, weight, goals, health conditions)
- **Diet Tracking** - Log daily food intake with detailed nutritional information (calories, protein, carbs, fats)
- **Workout Logging** - Track exercise sessions with duration and calories burned
- **AI-Powered Diet Analysis** - Get personalized nutritional recommendations using Google's Gemini AI
- **Progress Tracking** - Monitor your fitness journey over time
- **History** - View past diet and workout entries
- **Chatbot** - Interactive assistance for health and fitness queries
- **Dark/Light Mode** - Toggle between themes for comfortable viewing

### AI Integration
- **Gemini AI Analysis** - Analyzes daily diet based on user's health profile
- **Personalized Recommendations** - Receives actionable suggestions tailored to individual goals
- **Custom Meal Plans** - AI-generated meal plans aligned with health objectives

## 🏗️ Project Structure

```
Diet-Ate-Planner/
├── Diet/                      # Frontend files
│   ├── index.html            # Home page
│   ├── auth.html             # Login/Register page
│   ├── profile.html          # User profile page
│   ├── diet.html             # Diet tracking page
│   ├── workouts.html         # Workout logging page
│   ├── chatbot.html          # AI chatbot interface
│   ├── progress.html         # Progress tracking page
│   ├── history.html          # Historical data view
│   ├── settings.html         # User settings
│   └── assets/
│       ├── css/              # Stylesheets
│       ├── js/               # Client-side JavaScript
│       └── images/           # Image assets
├── models/                   # MongoDB schemas
│   ├── User.js              # User model
│   ├── Diet.js              # Diet entry model
│   └── Workout.js           # Workout entry model
├── routes/                   # API endpoints
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── diets.js             # Diet tracking routes
│   └── workouts.js          # Workout tracking routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── server.js                # Express server configuration
├── package.json             # Project dependencies
├── .env                     # Environment variables (not tracked)
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Google Gemini API Key** (for AI-powered diet analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarvanpilli/Diet-Ate-Planner.git
   cd Diet-Ate-Planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Important:**
   - Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your MongoDB credentials
   - Generate a secure random string for `JWT_SECRET`
   - Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Start the server**
   
   For development (with auto-restart):
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

5. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### Diets
- `GET /api/diets` - Get all diet entries for logged-in user (Protected)
- `POST /api/diets` - Add a new diet entry (Protected)
- `DELETE /api/diets/:id` - Delete a diet entry (Protected)
- `POST /api/diets/analyze` - Analyze daily diet with AI (Protected)

### Workouts
- `GET /api/workouts` - Get all workout entries for logged-in user (Protected)
- `POST /api/workouts` - Add a new workout entry (Protected)
- `DELETE /api/workouts/:id` - Delete a workout entry (Protected)

**Note:** Protected routes require an `x-auth-token` header with a valid JWT token.

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern design patterns
- **JavaScript (ES6+)** - Client-side logic
- **Showdown.js** - Markdown to HTML conversion

### AI Integration
- **Google Generative AI** - Gemini 1.5 Flash for diet analysis

## 💡 Usage

### 1. Create an Account
- Navigate to the authentication page
- Register with username, email, and password

### 2. Complete Your Profile
- Add personal information (age, gender, height, weight)
- Set your health goals (weight loss, muscle gain, etc.)
- Specify any health conditions

### 3. Track Your Diet
- Log daily food intake with nutritional details
- Use the "Analyze Today's Diet" feature for AI-powered insights
- Receive personalized meal plans and recommendations

### 4. Log Workouts
- Record exercise sessions
- Track duration and calories burned
- Monitor your activity over time

### 5. Monitor Progress
- View historical data
- Track trends in diet and exercise
- Adjust your plan based on results

## 🔒 Security Features

- **Password Hashing** - Passwords are hashed using bcrypt before storage
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Middleware ensures only authenticated users can access sensitive data
- **Token Expiration** - JWT tokens expire after 5 hours for security

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Mode** - User-selectable theme preference
- **Modern UI** - Clean, intuitive interface with smooth animations
- **LocalStorage Integration** - Client-side data persistence for better UX

## 🧪 Development

### Scripts

```bash
# Start server in production mode
npm start

# Start server in development mode with auto-restart
npm run dev

# Run tests (not yet implemented)
npm test
```

### Development Dependencies

- **nodemon** - Auto-restart server on file changes

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | No (default: 3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Sarvan Sri Sai Pilli**

## 🙏 Acknowledgments

- Google Generative AI for providing the Gemini API
- MongoDB for the database platform
- Express.js community for excellent documentation
- All contributors and users of this project

## 🐛 Known Issues

- Test suite not yet implemented
- Some frontend pages may need additional backend integration

## 🗺️ Roadmap

- [ ] Implement comprehensive test coverage
- [ ] Add social features (share progress, challenges)
- [ ] Integrate with fitness wearables
- [ ] Add meal photo recognition
- [ ] Implement recipe database
- [ ] Add nutritionist consultation booking
- [ ] Mobile app development (React Native)
- [ ] Advanced analytics and visualizations

## 📞 Support

For support, please open an issue in the GitHub repository or contact the author.

---

**Made with ❤️ for a healthier lifestyle**
