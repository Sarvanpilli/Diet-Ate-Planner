const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Diet = require('../models/Diet');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// @route   GET api/diets
// @desc    Get all diet entries for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user.id }).sort({ date: -1 });
    res.json(diets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/diets
// @desc    Add a new diet entry
// @access  Private
router.post('/', auth, async (req, res) => {
  const { foodName, calories, protein, carbohydrates, fat } = req.body;

  try {
    const newDiet = new Diet({
      user: req.user.id,
      foodName,
      calories,
      protein,
      carbohydrates,
      fat,
    });

    const diet = await newDiet.save();
    res.json(diet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/diets/:id
// @desc    Delete a diet entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let diet = await Diet.findById(req.params.id);

    if (!diet) return res.status(404).json({ msg: 'Diet entry not found' });

    // Make sure user owns the diet entry
    if (diet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Diet.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Diet entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/diets/analyze
// @desc    Analyze a user's diet for a day and get recommendations
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  const { profile, dailyDiet } = req.body;

  if (!profile || !dailyDiet || dailyDiet.length === 0) {
    return res.status(400).json({ msg: 'Profile and daily diet are required.' });
  }

  // --- Refined Prompt Engineering ---
  
  // 1. Calculate BMI
  let bmi = 'Not available';
  if (profile.height && profile.weight) {
    const heightInMeters = profile.height / 100;
    bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }

  // 2. Summarize diet
  const dietSummary = dailyDiet.map(d => `- ${d.foodName}: ${d.calories} calories`).join('\n');
  
  // 3. Build detailed profile summary
  const profileSummary = `
    - **Health Goal:** ${profile.goal || 'Not specified'}
    - **BMI:** ${bmi}
    - **Known Health Conditions:** ${profile.healthConditions || 'None specified'}
    - **Age:** ${profile.age || 'Not specified'}
    - **Gender:** ${profile.gender || 'Not specified'}
  `;

  // 4. Construct the new, detailed prompt
  const prompt = `As a professional nutritionist AI, analyze the following user's daily diet based on their detailed health profile.

  **USER HEALTH PROFILE:**
  ${profileSummary}

  **USER'S DIET FOR TODAY:**
  ${dietSummary}

  **YOUR TASK:**
  1.  **Brief Analysis:** Provide a short, constructive analysis of the user's diet for today, keeping their health profile and goals in mind.
  2.  **Actionable Suggestions:** Offer 3-4 specific, actionable suggestions for improvement.
  3.  **Sample Meal Plan:** Provide a sample one-day meal plan (Breakfast, Lunch, Dinner, Snacks) that is healthier and specifically tailored to their profile and goals.

  Please format the entire response using clear and simple Markdown. Use headings for each section (e.g., "### Analysis", "### Suggestions").`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ analysis: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).send('Error analyzing diet. Please ensure your Gemini API key is correct.');
  }
});

module.exports = router; 