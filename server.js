const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5502;

// Dummy database to simulate user data
let users = [];

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/connectdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection error:', error));

// User schema and model
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true // Assuming username needs to be unique
    },
    password: {
        type: String,
        required: true
    },
    metamaskAddress: {
        type: String,
        unique: false // Allowing null values
    }
});
const User = mongoose.model('User', userSchema);

// Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ message: 'Internal Server Error' });
// });

// Signup Endpoint
app.post('/signup', async (req, res, next) => {
    const { username, password, metamaskId } = req.body;

    try {
        // Validate user inputs
        if (!username || !password || !metamaskId) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Check if username or metamaskId already exists
        const existingUser = await User.findOne({ $or: [{ username }, { metamaskId }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Metamask ID already exists' });
        }

        // Create a new user
        const newUser = new User({ username, password, metamaskId });
        await newUser.save();

        // Respond with success message
        res.status(200).json({ message: 'Signup successful' });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.username) {
            res.status(400).json({ message: 'Username already exists' });
        } else if (error.code === 11000 && error.keyPattern.metamaskId) {
            res.status(400).json({ message: 'Metamask ID already exists' });
        } else {
            next(error); // Pass other errors to the error handling middleware
        }
    }
});

// Login Endpoint
app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        // Find user by username and password
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Login successful
        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        next(error);
    }
});

// Upgrade Endpoint
app.post('/upgrade', async (req, res, next) => {
    const { username, plan } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's premium status and expiry based on plan
        const currentDate = new Date();
        let premiumExpiryDate;
        switch (plan.toLowerCase()) {
            case '1':
                premiumExpiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
                break;
            case '6':
                premiumExpiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, currentDate.getDate());
                break;
            case '12':
                premiumExpiryDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Update user document
        user.isPremium = true;
        user.premiumExpiry = premiumExpiryDate;
        await user.save();

        // Respond with success message
        res.status(200).json({ message: 'User upgraded to premium successfully' });
    } catch (error) {
        next(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
