const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Load auth routes
const authRoutes = require('./auth/auth.route.js');
app.use('/auth', authRoutes);

// Simple healthcheck
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root route
app.get("/", (req, res) => {
  res.send("App is running!");
});

// Start server (ONLY once)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
