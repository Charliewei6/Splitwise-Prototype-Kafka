
import { SET_DASHBOARD } from './actionTypes';
function dashboard(state={},action) {
    switch(action.type) { 
        case SET_DASHBOARD:
         state = action.data
         return { ...state }
        default :
         return state
    }
}

export default dashboard;