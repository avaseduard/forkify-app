import * as model from './model.js';
import 'core-js/stable'; // polyfilling everything
import 'regenerator-runtime/runtime'; // polyfilling async await
import recipeView from './views/recipeView.js';
import RecipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import SearchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); // getting the id of the recipe from the url's hash

    if (!id) return; // guard clause in case there's no id in the url

    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // Loading recipe
    await model.loadRecipe(id); // calling an async function which returns a promise, so we need to await

    // Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //  Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResults(query);

    // Rendering results
    resultsView.render(model.getSearchResultsPage());

    // Rendering initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};
controlSearchResults();

const controlPagination = function (goToPage) {
  // Rendering results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Rendering initial pagination buttons
  paginationView.render(model.state.search);
};

// controlServings updateServings
const controlServings = function (updateServings) {
  // Updating the servings (in the state)
  model.updateServings(updateServings);

  // Rendering the recipe with updated servings
  RecipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/ remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // Update recipe view
  recipeView.update(model.state.recipe);
  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loadding spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render the new recipe
    recipeView.render(model.state.recipe);

    // Succes message
    addRecipeView.renderMessage();

    // Show the recipe in the bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // Changing the ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Closing the form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('💥', error.message);
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome to the forkify app!');
};
init();
