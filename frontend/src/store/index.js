import { createStore,applyMiddleware,combineReducers } from 'redux';
import dashboard from './dashboard';
import user from './user';
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'

const reducers = combineReducers({
    dashboard,
    user
})

const store = createStore(reducers,composeWithDevTools(applyMiddleware(thunk)));
window.store = store;
export default store;
