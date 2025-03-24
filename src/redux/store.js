import { createStore, combineReducers } from 'redux';
import authReducer from './reducers/authReducer.js';

// Combine all reducers (if you have more in the future)
const rootReducer = combineReducers({
  auth: authReducer,
});

// Load state from localStorage
const loadState = () => {
    try {
      const serializedState = localStorage.getItem('authToken');
      if (serializedState === null) {
        return undefined;
      }
      return { auth: { isAuthenticated: true, token: serializedState } };
    } catch (err) {
      return undefined;
    }
  };
  
  // Save state to localStorage
  const saveState = (state) => {
    try {
      const serializedState = state.auth.token;
      localStorage.setItem('authToken', serializedState);
    } catch {
      // Ignore write errors
    }
  };

// Create the Redux store
const store = createStore(
    rootReducer,
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() // For Redux DevTools
  );
  
  // Subscribe to store updates
  store.subscribe(() => {
    saveState(store.getState());
  });
  

export default store;