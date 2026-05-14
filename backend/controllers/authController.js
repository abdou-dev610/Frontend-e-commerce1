import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/emailService.js';

// Helper: Créer un token JWT
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export const signUp = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    console.log("📝 SIGNUP REQUEST:", { email, fullName, phone, passwordLength: password?.length });

    if (!email || !password) {
      console.log("❌ Email ou password manquant");
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Vérifier si l'utilisateur existe
    console.log("🔍 Vérification d'un utilisateur existant avec email:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Utilisateur existe déjà");
      return res.status(409).json({ message: 'User already exists' });
    }

    console.log("✅ Email unique, création du nouvel utilisateur");

    // Créer le nouvel utilisateur (password sera hashé automatiquement par le pre-save middleware)
    const newUser = new User({
      email,
      password,
      fullName: fullName || '',
      phone: phone || '',
      isAdmin: false
    });

    console.log("💾 Sauvegarde utilisateur en BD...");
    await newUser.save();
    console.log("✅ Utilisateur sauvegardé:", { id: newUser._id, email: newUser.email });

    // Créer le token
    const token = createToken(newUser);
    console.log("🔑 Token créé");

    // Envoyer un email de bienvenue
    console.log("📧 Envoi email de bienvenue...");
    try {
      await sendWelcomeEmail({
        email: newUser.email,
        fullName: newUser.fullName || 'Utilisateur'
      });
      console.log("✅ Email de bienvenue envoyé");
    } catch (emailError) {
      console.error("⚠️ Erreur lors de l'envoi de l'email de bienvenue:", emailError.message);
      // Ne pas arrêter l'inscription si l'email échoue
    }

    const responseData = {
      message: 'User created successfully',
      token,
      user: newUser.toPublic()
    };

    console.log("📤 Réponse envoyée au client:", { message: responseData.message, hasToken: !!responseData.token, userId: responseData.user.id });

    return res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ SignUp Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Créer le token
    const token = createToken(user);

    return res.json({
      message: 'Logged in successfully',
      token,
      user: user.toPublic()
    });
  } catch (error) {
    console.error('SignIn Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADMIN LOGIN - Authentification sécurisée avec MongoDB
 * 
 * Flux:
 * 1. Valider les inputs (email, password)
 * 2. Chercher l'utilisateur admin dans MongoDB
 * 3. Comparer le password avec bcrypt.compare()
 * 4. Générer un JWT token
 * 5. Retourner le token et les infos admin
 */
export const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des inputs
    if (!email || !password) {
      console.warn('⚠️  Admin login: Email ou password manquant');
      return res.status(400).json({ message: 'Email and password required' });
    }

    console.log(`\n🔐 ADMIN LOGIN ATTEMPT for email: ${email}`);

    // Chercher l'admin dans MongoDB
    const admin = await User.findOne({ email, isAdmin: true });
    
    if (!admin) {
      console.warn(`❌ Admin not found with email: ${email}`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log(`✅ Admin found: ${admin.email}`);

    // Comparer le password avec bcrypt.compare()
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      console.warn(`❌ Invalid password for admin: ${email}`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log(`✅ Password valid for admin: ${email}`);

    // Créer le token JWT
    const token = createToken(admin);
    console.log(`🔑 JWT token created for admin: ${email}`);

    // Réponse succès
    const response = {
      message: 'Admin logged in successfully',
      token,
      user: admin.toPublic()
    };

    console.log(`📤 Admin login successful: ${email}`);
    return res.json(response);

  } catch (error) {
    console.error('❌ Admin SignIn Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({
      user: user.toPublic()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
