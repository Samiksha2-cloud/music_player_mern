const router = require("express").Router();
const { supabase } = require("../config/supabase.config");  // your Supabase client

// Protected GET route to validate user (GET /login or /validate)
router.get("/validate", async (req, res) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid Authorization header. Use Bearer token."
      });
    }

    // Extract token: Bearer <token> → <token>
    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: error?.message || "User not found"
      });
    }

    // Load User model
    const User = require('../models/User');

    // Find or create/update user in MongoDB
    let dbUser = await User.findOne({ userId: user.id });

    if (!dbUser) {
      dbUser = new User({
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
        role: user.role || 'user'
      });
      await dbUser.save();
      console.log('New user created in MongoDB:', dbUser.email);
    } else {
      dbUser.lastLogin = new Date();
      await dbUser.save();
      console.log('User logged in again:', dbUser.email);
    }

    // Return combined data (from Supabase + MongoDB)
    res.status(200).json({
      success: true,
      message: "User validated and synced with DB",
      user: {
        id: user.id,
        email: user.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        role: dbUser.role,
        lastLogin: dbUser.lastLogin || dbUser.createdAt  // fallback for new user
      }
    });

  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during validation",
      error: err.message
    });
  }
});

    
module.exports = router;