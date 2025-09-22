import { createStore } from 'redux';

const actions = {
  SET_TOKEN: 'SET_TOKEN',
  REMOVE_TOKEN: 'REMOVE_TOKEN',
};
const initialTokens = {};

const setToken = () => ({ type: actions.SET_TOKEN });
const removeToken = () => ({ type: actions.REMOVE_TOKEN });

const tokens = (state = initialTokens, action) => {
  switch (action.type) {
    case actions.SET_TOKEN:
      return action.tokens;
    case actions.REMOVE_TOKEN:
      return initialTokens;
    default:
      return state;
  }
};

export default tokens;
