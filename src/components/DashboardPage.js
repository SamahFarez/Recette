import React, { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';  // Import the LogoutButton component

const Dashboard = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data directly from your backend API
    fetch('https://recettemagique.onrender.com/fetch-recipes/tomato,egg,pork', {
      credentials: 'include', // Ensure session cookies are sent
    })
      .then(response => {
        if (response.ok) {
          return response.text();  // Convert the response to text (since you're dealing with raw text data)
        } else {
          // Handle different error codes and provide specific messages
          switch (response.status) {
            case 402:
              throw new Error('Daily API limit exceeded. Please try again later.');
            case 404:
              throw new Error('Recipes not found. Please check your ingredients or try again later.');
            case 500:
              throw new Error('Server error. Please try again.');
            default:
              throw new Error('An unexpected error occurred.');
          }
        }
      })
      .then(data => {
        setData(data);  // Set the raw data from the response
      })
      .catch(error => {
        setError(error.message);  // Use the specific error message
        console.error(error);  // Log the error for debugging purposes
      });
  }, []);

  // Function to parse the raw text data into an array of recipe objects
  const parseRecipes = (rawData) => {
    const recipeRegex = /Recipe Name: (.*?)\nCooking Time: (.*?)\nIngredients: (.*?)\nInstructions: (.*?)(?=Recipe Name:|$)/gs;
    const recipes = [];
    let match;

    while ((match = recipeRegex.exec(rawData)) !== null) {
      recipes.push({
        name: match[1],
        cookingTime: match[2],
        ingredients: match[3].replace(/,\s/g, ', ').split(','),
        instructions: match[4].replace(/<ol>/g, '').replace(/<\/li>/g, '').replace(/<li>/g, '<p>').replace(/<\/ol>/g, ''),
      });
    }

    return recipes;
  };

  // Parse the recipe data from raw text
  const recipes = parseRecipes(data);

  return (
    <div>
<h1 className="centered-title">Dashboard</h1>

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Grid Container */}
      <div className="text-normal-volkorn recipe-grid">
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <h2>{recipe.name}</h2>
            <p><strong>Cooking Time:</strong> {recipe.cookingTime}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>
            <p><strong>Instructions:</strong></p>
            <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
          </div>
        ))}
      </div>

      {/* Log out button */}
      <LogoutButton class="preference-option" /> {/* This button triggers the logout */}
    </div>
  );
};

export default Dashboard;
