
import { SET_USER } from './actionTypes';

let currencyArr=['$','KWD','BD','£','EUR','$'];

let userInfo = (localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo'))) || {};

if(userInfo) {
     userInfo.currencyStr = currencyArr[userInfo.Currency]
}


function user(state=userInfo,action) {
    switch(action.type) { 
        case SET_USER:
         state = action.data
         state.currencyStr = currencyArr[state.Currency]
         return { ...state }
        default :
         return state
    }
}

export default user;