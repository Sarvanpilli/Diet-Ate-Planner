// main.js

// Navigation and active link highlighting
// ...

// Profile form: Save to localStorage, BMI & Ideal Weight calculation
// ...

// Diet Plan: Generate meals, switch days, regenerate/print/download
// ...

// Workouts: Filter videos, mark as done, weekly planner
// ...

// Chatbot: Simple chat UI with predefined responses
// ...

// Progress Tracker: Chart rendering, log handling, streaks/badges
// ...

// History: Populate tables from localStorage
// ...

// Settings: Edit profile, change goals, notification preferences
// ...

// Auth: Login/Register/Forgot (dummy, localStorage)
// ...

// Dark/Light mode toggle
// ...

// Diet Plan: Dynamic meal/food entry and Gemini API integration
if (document.getElementById('user-diet-form')) {
  const mealsList = document.getElementById('meals-list');
  const addMealBtn = document.getElementById('add-meal-btn');
  const generateBtn = document.getElementById('generate-diet-btn');
  const loadingDiv = document.getElementById('diet-loading');
  const resultsDiv = document.getElementById('diet-results');
  const dayBtns = document.querySelectorAll('.diet-day-btn');

  // Store meals for all 7 days (0=Mon, 6=Sun)
  const weekDiet = Array(7).fill().map(() => []);
  let currentDay = 0;

  const defaultMeals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  function renderMealsForDay(dayIdx) {
    mealsList.innerHTML = '';
    const meals = weekDiet[dayIdx];
    if (!meals.length) {
      // Add default meals for new day
      defaultMeals.forEach(mealName => createMealCard(mealName, [{name:'',qty:'',time:''}], false));
    } else {
      meals.forEach(meal => createMealCard(meal.meal, meal.foods, false));
    }
  }

  function saveCurrentDayMeals() {
    // Save current meals to weekDiet[currentDay]
    const meals = [];
    mealsList.querySelectorAll('.diet-meal-card').forEach(mealCard => {
      const mealName = mealCard.querySelector('.diet-meal-name').value.trim() || 'Meal';
      const foods = [];
      mealCard.querySelectorAll('.diet-food-row').forEach(row => {
        const name = row.querySelector('.diet-food-name').value.trim();
        const qty = row.querySelector('.diet-food-qty').value.trim();
        const time = row.querySelector('.diet-food-time').value.trim();
        if (name && qty) foods.push({name, qty, time});
      });
      if (foods.length) meals.push({meal: mealName, foods});
    });
    weekDiet[currentDay] = meals;
  }

  function createMealCard(mealName = '', foods = [{name: '', qty: '', time: ''}], append = true) {
    const mealCard = document.createElement('div');
    mealCard.className = 'diet-meal-card';
    mealCard.innerHTML = `
      <div class="diet-meal-header">
        <input type="text" class="diet-meal-name" placeholder="Meal name (e.g. Breakfast)" value="${mealName}" style="flex:1; font-weight:600; font-size:1.05rem; border:none; background:transparent; outline:none; color:var(--primary);">
        <button type="button" class="diet-remove-btn" title="Remove meal">&times;</button>
      </div>
      <div class="diet-food-list"></div>
      <button type="button" class="diet-add-food-btn">+ Add Food</button>
    `;
    // Remove meal
    mealCard.querySelector('.diet-remove-btn').onclick = () => mealCard.remove();
    // Add food row
    const foodList = mealCard.querySelector('.diet-food-list');
    function addFoodRow(food = {name:'', qty:'', time:''}) {
      const row = document.createElement('div');
      row.className = 'diet-food-row';
      row.innerHTML = `
        <input type="text" class="diet-food-name" placeholder="Food (e.g. Oats)" value="${food.name}" required>
        <input type="text" class="diet-food-qty" placeholder="Qty (e.g. 1 cup)" value="${food.qty}" required>
        <input type="text" class="diet-food-time" placeholder="Time (e.g. 8:00am)" value="${food.time}">
        <button type="button" class="diet-remove-btn" title="Remove food">&times;</button>
      `;
      row.querySelector('.diet-remove-btn').onclick = () => row.remove();
      foodList.appendChild(row);
    }
    foods.forEach(addFoodRow);
    mealCard.querySelector('.diet-add-food-btn').onclick = () => addFoodRow();
    if (append) mealsList.appendChild(mealCard);
    else mealsList.appendChild(mealCard);
  }

  // Day switcher logic
  dayBtns.forEach(btn => {
    btn.onclick = () => {
      if (btn.classList.contains('active')) return;
      saveCurrentDayMeals();
      dayBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDay = parseInt(btn.dataset.day);
      renderMealsForDay(currentDay);
    };
  });

  // Add meal for current day
  addMealBtn.onclick = () => createMealCard();

  // Initial render for Monday
  renderMealsForDay(0);

  // Handle form submit
  document.getElementById('user-diet-form').onsubmit = async function(e) {
    e.preventDefault();
    saveCurrentDayMeals();
    // Gather all days' data
    const allDays = weekDiet.map((meals, idx) => ({
      day: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][idx],
      meals
    }));
    // At least one meal for at least one day
    if (!allDays.some(day => day.meals.length)) {
      alert('Please enter at least one meal with food items for any day.');
      return;
    }
    // Show loading
    loadingDiv.style.display = '';
    resultsDiv.innerHTML = '';
    // Get user profile from localStorage (if available)
    let profile = {};
    try {
      profile = JSON.parse(localStorage.getItem('fitdiet_profile') || '{}');
    } catch {}
    // Call Gemini API (placeholder)
    const result = await generateDietWithGemini(profile, allDays);
    loadingDiv.style.display = 'none';
    renderDietResults(result);
  };

  // Gemini API integration
  const GEMINI_API_KEY = 'AIzaSyCEjyc9n9AakbuqSpFmhN53Y0S-xA3yDCs';
  async function generateDietWithGemini(profile, allDays) {
    const prompt = `You are an API. Given this user profile: ${JSON.stringify(profile)} and this weekly diet: ${JSON.stringify(allDays)}, generate a healthy, personalized 7-day diet plan. Respond ONLY with valid JSON in this format: [{\"day\":\"Monday\",\"meals\":[{\"meal\":\"Breakfast\",\"foods\":[\"Oats with milk (1 cup)\"]}]}]. Do not include any explanation, markdown, or extra text.`;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Fallback: extract JSON from code block if present
      if (text.includes('```')) {
        text = text.split('```')[1] || text;
      }
      // Try to extract JSON array
      let jsonStart = text.indexOf('[');
      let jsonEnd = text.lastIndexOf(']') + 1;
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON in Gemini response. Raw: ' + text);
      let jsonString = text.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonString);
    } catch (err) {
      alert('Failed to generate diet with Gemini API. ' + (err.message || err));
      return [];
    }
  }

  function renderDietResults(results) {
    resultsDiv.innerHTML = '';
    if (!results || !results.length) {
      resultsDiv.innerHTML = '<div style="text-align:center;color:#b91c1c;">No diet plan generated.</div>';
      return;
    }
    results.forEach(dayPlan => {
      const card = document.createElement('div');
      card.className = 'diet-result-card';
      card.innerHTML = `<h3>${dayPlan.day}</h3>`;
      dayPlan.meals.forEach(meal => {
        const mealBlock = document.createElement('div');
        mealBlock.innerHTML = `<strong>${meal.meal}</strong><ul>${meal.foods.map(f=>`<li>${f}</li>`).join('')}</ul>`;
        card.appendChild(mealBlock);
      });
      resultsDiv.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Universal Authentication UI Handler ---
    const handleAuthUI = () => {
        const token = localStorage.getItem('token');
        const nav = document.querySelector('header nav ul');
        if (!nav) return;

        const authLink = nav.querySelector('a[href="auth.html"]');

        if (token) {
            // User is logged in
            if (authLink) {
                authLink.textContent = 'Profile';
                authLink.href = 'profile.html';
            }

            // Add logout button if it doesn't exist
            if (!document.getElementById('logout-btn')) {
                const logoutLi = document.createElement('li');
                logoutLi.innerHTML = `<a href="#" id="logout-btn">Logout</a>`;
                nav.appendChild(logoutLi);

                logoutLi.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.href = 'auth.html';
                });
            }
        } else {
            // User is logged out
            if (authLink) {
                authLink.textContent = 'Login';
                authLink.href = 'auth.html';
            }
        }
    };
    
    handleAuthUI(); // Run on every page load

    // --- Page-specific Logic ---
    const pagePath = window.location.pathname;

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('input[name="register-name"]').value;
            const email = registerForm.querySelector('input[name="register-email"]').value;
            const password = registerForm.querySelector('input[name="register-password"]').value;

            try {
                // Register the user
                const regResponse = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                if (!regResponse.ok) {
                    const errorData = await regResponse.json();
                    throw new Error(errorData.msg || 'Registration failed');
                }
                
                alert('Registration successful! Please log in.');

                // Automatically log in the user after registration
                 const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!loginResponse.ok) {
                    const errorData = await loginResponse.json();
                    throw new Error(errorData.msg || 'Login failed after registration');
                }

                const { token } = await loginResponse.json();
                localStorage.setItem('token', token);
                window.location.href = 'profile.html'; // Redirect to profile page

            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error('Registration/Login Error:', error);
            }
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="login-email"]').value;
            const password = loginForm.querySelector('input[name="login-password"]').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'Login failed');
                }

                const { token } = await response.json();
                localStorage.setItem('token', token);
                window.location.href = 'profile.html'; // Redirect to profile page

            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error('Login Error:', error);
            }
        });
    }

    // --- Profile Page Logic ---
    if (pagePath.endsWith('profile.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html'; // Redirect to login if not authenticated
            return;
        }

        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/users/me', {
                    headers: { 'x-auth-token': token }
                });

                if (!response.ok) {
                    // If token is invalid (e.g., expired), clear it and redirect
                    localStorage.removeItem('token');
                    window.location.href = 'auth.html';
                    throw new Error('Session expired. Please log in again.');
                }

                const user = await response.json();
                
                // Populate the form
                const nameInput = document.getElementById('name');
                if (nameInput) {
                    nameInput.value = user.username;
                }
                // We can populate other fields here later if they are added to the User model
                // For example: document.getElementById('email').value = user.email;

            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error('Fetch User Error:', error);
            }
        };

        fetchUserData();
    }

    // --- Diet Page Logic ---
    if (pagePath.endsWith('diet.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const dietFormContainer = document.getElementById('user-diet-form');
        const dietListContainer = document.getElementById('diet-results');

        // --- Create a simpler form for adding diet entries ---
        const createDietForm = () => {
            const form = document.createElement('form');
            form.id = 'add-diet-entry-form';
            form.innerHTML = `
                <h3>Log a New Food Entry</h3>
                <input type="text" name="foodName" placeholder="Food Name" required>
                <input type="number" name="calories" placeholder="Calories" required>
                <input type="number" name="protein" placeholder="Protein (g)">
                <input type="number" name="carbohydrates" placeholder="Carbs (g)">
                <input type="number" name="fat" placeholder="Fat (g)">
                <button type="submit">Add Entry</button>
            `;
            dietFormContainer.innerHTML = ''; // Clear existing complex form
            dietFormContainer.appendChild(form);
            return form;
        };

        const dietEntryForm = createDietForm();

        // --- Function to fetch and display diet entries ---
        const getAndDisplayDiets = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/diets', {
                    headers: { 'x-auth-token': token },
                });
                if (!response.ok) throw new Error('Failed to fetch diet entries.');
                
                const diets = await response.json();
                dietListContainer.innerHTML = '<h3>Your Diet Log</h3>';
                
                if (diets.length === 0) {
                    dietListContainer.innerHTML += '<p>No diet entries found. Add one above!</p>';
                    return;
                }

                const list = document.createElement('ul');
                diets.forEach(diet => {
                    const item = document.createElement('li');
                    item.innerHTML = `
                        <strong>${diet.foodName}</strong> - ${diet.calories} kcal
                        (P: ${diet.protein || 0}g, C: ${diet.carbohydrates || 0}g, F: ${diet.fat || 0}g)
                        - <span>${new Date(diet.date).toLocaleDateString()}</span>
                        <button class="delete-btn" data-id="${diet._id}">Delete</button>
                    `;
                    list.appendChild(item);
                });
                dietListContainer.appendChild(list);

            } catch (error) {
                console.error('Error fetching diets:', error);
                dietListContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
            }
        };

        // --- Handle Add Diet Entry Form Submission ---
        dietEntryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(dietEntryForm);
            const body = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/api/diets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify(body),
                });
                if (!response.ok) throw new Error('Failed to add diet entry.');
                
                dietEntryForm.reset(); // Clear form
                getAndDisplayDiets(); // Refresh the list

            } catch (error) {
                console.error('Error adding diet:', error);
                alert(error.message);
            }
        });

        // --- Handle Delete Button Clicks ---
        dietListContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const dietId = e.target.dataset.id;
                if (!confirm('Are you sure you want to delete this entry?')) return;

                try {
                    const response = await fetch(`http://localhost:3000/api/diets/${dietId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token },
                    });
                     if (!response.ok) throw new Error('Failed to delete diet entry.');

                    getAndDisplayDiets(); // Refresh the list
                } catch (error) {
                    console.error('Error deleting diet:', error);
                    alert(error.message);
                }
            }
        });

        // Initial fetch
        getAndDisplayDiets();

        // --- Handle Diet Analysis ---
        const analyzeBtn = document.getElementById('analyze-diet-btn');
        analyzeBtn.addEventListener('click', async () => {
            dietListContainer.innerHTML = '<h3>Analyzing...</h3><p>Please wait while we generate your diet analysis.</p>';

            try {
                // 1. Fetch user profile
                const profileRes = await fetch('http://localhost:3000/api/users/me', {
                    headers: { 'x-auth-token': token }
                });
                if (!profileRes.ok) throw new Error('Could not get user profile.');
                const profile = await profileRes.json();

                // 2. Fetch today's diet entries
                const dietRes = await fetch('http://localhost:3000/api/diets', {
                    headers: { 'x-auth-token': token },
                });
                if (!dietRes.ok) throw new Error('Could not get diet entries.');
                const allDiets = await dietRes.json();
                
                const today = new Date().toLocaleDateString();
                const dailyDiet = allDiets.filter(d => new Date(d.date).toLocaleDateString() === today);

                if (dailyDiet.length === 0) {
                    alert('No diet entries logged for today. Please add some entries first.');
                    getAndDisplayDiets(); // Refresh to show the list again
                    return;
                }

                // 3. Call analysis endpoint
                const analysisRes = await fetch('http://localhost:3000/api/diets/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify({ profile, dailyDiet }),
                });

                if (!analysisRes.ok) {
                     const error = await analysisRes.text();
                     throw new Error(`Analysis failed: ${error}`);
                }

                const { analysis } = await analysisRes.json();
                
                // 4. Convert Markdown to HTML and display
                const converter = new showdown.Converter();
                dietListContainer.innerHTML = converter.makeHtml(analysis);

            } catch (error) {
                console.error('Analysis Error:', error);
                alert(error.message);
                getAndDisplayDiets(); // Refresh list on error
            }
        });
    }

    // --- Workouts Page Logic ---
    if (pagePath.endsWith('workouts.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const workoutSection = document.querySelector('.workout-section');
        const plannerBody = document.getElementById('planner-body');

        // --- Create a form for adding workout entries ---
        const createWorkoutForm = () => {
            const form = document.createElement('form');
            form.id = 'add-workout-entry-form';
            form.innerHTML = `
                <h3>Log a New Workout</h3>
                <input type="text" name="exerciseName" placeholder="Exercise Name" required>
                <input type="number" name="duration" placeholder="Duration (minutes)" required>
                <input type="number" name="caloriesBurned" placeholder="Calories Burned" required>
                <button type="submit">Add Workout</button>
            `;
            // Prepend form to the workout section
            workoutSection.insertBefore(form, workoutSection.firstChild);
            return form;
        };

        const workoutEntryForm = createWorkoutForm();

        // --- Function to fetch and display workout entries ---
        const getAndDisplayWorkouts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/workouts', {
                    headers: { 'x-auth-token': token },
                });
                if (!response.ok) throw new Error('Failed to fetch workout entries.');
                
                const workouts = await response.json();
                plannerBody.innerHTML = ''; // Clear existing planner rows
                
                if (workouts.length === 0) {
                    const row = plannerBody.insertRow();
                    const cell = row.insertCell();
                    cell.colSpan = 3;
                    cell.textContent = 'No workout entries found. Add one above!';
                    return;
                }

                workouts.forEach(workout => {
                    const row = plannerBody.insertRow();
                    row.innerHTML = `
                        <td>${new Date(workout.date).toLocaleDateString()}</td>
                        <td><strong>${workout.exerciseName}</strong> (${workout.duration} mins) - ${workout.caloriesBurned} kcal</td>
                        <td><button class="delete-btn" data-id="${workout._id}">Delete</button></td>
                    `;
                });

            } catch (error) {
                console.error('Error fetching workouts:', error);
                plannerBody.innerHTML = `<tr><td colspan="3" style="color: red;">${error.message}</td></tr>`;
            }
        };

        // --- Handle Add Workout Entry Form Submission ---
        workoutEntryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(workoutEntryForm);
            const body = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://localhost:3000/api/workouts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify(body),
                });
                if (!response.ok) throw new Error('Failed to add workout entry.');
                
                workoutEntryForm.reset(); // Clear form
                getAndDisplayWorkouts(); // Refresh the list

            } catch (error) {
                console.error('Error adding workout:', error);
                alert(error.message);
            }
        });

        // --- Handle Delete Button Clicks ---
        plannerBody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const workoutId = e.target.dataset.id;
                if (!confirm('Are you sure you want to delete this entry?')) return;

                try {
                    const response = await fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token },
                    });
                     if (!response.ok) throw new Error('Failed to delete workout entry.');

                    getAndDisplayWorkouts(); // Refresh the list
                } catch (error) {
                    console.error('Error deleting workout:', error);
                    alert(error.message);
                }
            }
        });

        // Initial fetch
        getAndDisplayWorkouts();
    }

    // --- Progress Page Logic ---
    if (pagePath.endsWith('progress.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const ctx = document.getElementById('progress-chart');

        const renderProgressChart = async () => {
            try {
                // Fetch both diets and workouts
                const [dietRes, workoutRes] = await Promise.all([
                    fetch('http://localhost:3000/api/diets', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:3000/api/workouts', { headers: { 'x-auth-token': token } })
                ]);

                if (!dietRes.ok || !workoutRes.ok) throw new Error('Failed to fetch progress data.');

                const diets = await dietRes.json();
                const workouts = await workoutRes.json();

                // Process data: sum calories by day
                const dataByDate = {};
                const addData = (entry, type) => {
                    const date = new Date(entry.date).toLocaleDateString();
                    if (!dataByDate[date]) {
                        dataByDate[date] = { caloriesIn: 0, caloriesOut: 0 };
                    }
                    if (type === 'diet') dataByDate[date].caloriesIn += entry.calories;
                    if (type === 'workout') dataByDate[date].caloriesOut += entry.caloriesBurned;
                };

                diets.forEach(d => addData(d, 'diet'));
                workouts.forEach(w => addData(w, 'workout'));
                
                // Get last 7 days for the chart
                const labels = Object.keys(dataByDate).sort((a,b) => new Date(a) - new Date(b)).slice(-7);
                const caloriesInData = labels.map(label => dataByDate[label].caloriesIn);
                const caloriesOutData = labels.map(label => dataByDate[label].caloriesOut);

                // Render the chart
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Calories Consumed',
                                data: caloriesInData,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Calories Burned',
                                data: caloriesOutData,
                                backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });

            } catch (error) {
                console.error('Error rendering chart:', error);
                ctx.parentElement.innerHTML = `<p style="color: red;">Could not load chart: ${error.message}</p>`;
            }
        };
        
        renderProgressChart();
    }

    // --- History Page Logic ---
    if (pagePath.endsWith('history.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const historySection = document.querySelector('.history-section');

        const displayCombinedHistory = async () => {
            historySection.innerHTML = '<h1>Your History</h1><div id="history-list">Loading...</div>'; // Reset section
            const historyList = document.getElementById('history-list');

            try {
                // Fetch both diets and workouts
                const [dietRes, workoutRes] = await Promise.all([
                    fetch('http://localhost:3000/api/diets', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:3000/api/workouts', { headers: { 'x-auth-token': token } })
                ]);

                if (!dietRes.ok || !workoutRes.ok) throw new Error('Failed to fetch history data.');

                const diets = await dietRes.json();
                const workouts = await workoutRes.json();

                // Add a 'type' property to distinguish them
                const typedDiets = diets.map(d => ({ ...d, type: 'DIET' }));
                const typedWorkouts = workouts.map(w => ({ ...w, type: 'WORKOUT' }));

                // Combine, sort by date descending
                const combined = [...typedDiets, ...typedWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date));

                if (combined.length === 0) {
                    historyList.innerHTML = '<p>No history found.</p>';
                    return;
                }

                // Render the combined list
                historyList.innerHTML = combined.map(item => {
                    const date = new Date(item.date).toLocaleDateString();
                    if (item.type === 'DIET') {
                        return `<div class="history-item diet">
                                    <p><strong>DIET</strong> - ${date}</p>
                                    <p>${item.foodName} - ${item.calories} kcal</p>
                                </div>`;
                    } else { // WORKOUT
                        return `<div class="history-item workout">
                                    <p><strong>WORKOUT</strong> - ${date}</p>
                                    <p>${item.exerciseName} (${item.duration} mins) - ${item.caloriesBurned} kcal</p>
                                </div>`;
                    }
                }).join('');

            } catch (error) {
                console.error('Error fetching history:', error);
                historyList.innerHTML = `<p style="color: red;">Could not load history: ${error.message}</p>`;
            }
        };

        displayCombinedHistory();
    }

    // --- Settings Page Logic ---
    if (pagePath.endsWith('settings.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const settingsFormContainer = document.getElementById('settings-form');

        const setupSettingsForm = async () => {
            // 1. Fetch current user data
            let currentUser;
            try {
                const response = await fetch('http://localhost:3000/api/users/me', {
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) throw new Error('Could not fetch user data.');
                currentUser = await response.json();
            } catch (error) {
                settingsFormContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
                return;
            }

            // 2. Create and populate the form
            settingsFormContainer.innerHTML = `
                <h2>Edit Profile</h2>
                <label>Name: <input type="text" name="username" value="${currentUser.username || ''}"></label>
                <label>Email: <input type="email" name="email" value="${currentUser.email || ''}"></label>
                <label>Age: <input type="number" name="age" value="${currentUser.age || ''}"></label>
                <label>Gender: <input type="text" name="gender" value="${currentUser.gender || ''}"></label>
                <label>Height (cm): <input type="number" name="height" value="${currentUser.height || ''}"></label>
                <label>Weight (kg): <input type="number" name="weight" value="${currentUser.weight || ''}"></label>
                <label>Primary Goal: <input type="text" name="goal" placeholder="e.g., Weight Loss, Muscle Gain" value="${currentUser.goal || ''}"></label>
                <label>Health Conditions: <input type="text" name="healthConditions" placeholder="e.g., Hypertension, None" value="${currentUser.healthConditions || ''}"></label>
                <button type="submit">Save Changes</button>
            `;

            // 3. Handle form submission
            settingsFormContainer.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(settingsFormContainer);
                const body = Object.fromEntries(formData.entries());

                // Filter out empty fields so we don't send them
                for (const key in body) {
                    if (body[key] === '') {
                        delete body[key];
                    }
                }

                try {
                    const response = await fetch('http://localhost:3000/api/users/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token,
                        },
                        body: JSON.stringify(body),
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.msg || 'Failed to update settings.');
                    }
                    
                    alert('Settings updated successfully!');

                } catch (error) {
                    console.error('Error updating settings:', error);
                    alert(`Error: ${error.message}`);
                }
            });
        };

        setupSettingsForm();
    }

    // --- Chatbot Page Logic ---
    if (pagePath.endsWith('chatbot.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const chatWindow = document.getElementById('chat-window');
        const chatForm = document.getElementById('chat-form');

        if (chatWindow) {
            chatWindow.innerHTML = '<div class="message bot">Hello! The full AI chatbot is coming soon. For now, you can manage your diet and workouts.</div>';
        }
        if(chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('This feature is coming soon!');
            });
        }
    }
}); 