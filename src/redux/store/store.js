import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
// import { routerReducer } from 'react-router-redux';
import resetEnhancer from '../../enhancer/reset.js';
// import { reducer as loadingReducer } from '../../components/loading';
import reducers from '../../redux/reducers/index';

// const originalReducers = {
//   loading: loadingReducer,
//   routing: routerReducer
// };
// const reducer = combineReducers(originalReducers);
const win = window;
const middlewares = [thunk];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-immutable-state-invariant').default());
}

const storeEnhancers = compose(
    resetEnhancer,
    applyMiddleware(...middlewares),
    (win && win.devToolsExtension) ? win.devToolsExtension() : (f) => f
);

const initialState = {};
const store = createStore(reducers, initialState, storeEnhancers);

const handleChange = () => {
  // let cv = store.getState()
}

store.subscribe(handleChange)

// store._reducers = originalReducers;
export default store;