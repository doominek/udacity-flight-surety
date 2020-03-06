import { combineReducers } from 'redux'
import { ADD_TODO, SET_VISIBILITY_FILTER, TOGGLE_TODO, VisibilityFilters } from './actions';

const { SHOW_ALL } = VisibilityFilters;

function visibilityFilter(state = SHOW_ALL, action) {
    switch (action.type) {
        case SET_VISIBILITY_FILTER:
            return action.filter;
        default:
            return state
    }
}

function todos(state = [ { text: "First", completed: false }], action) {
    switch (action.type) {
        case ADD_TODO:
            return [
                ...state,
                {
                    text: action.text,
                    completed: false
                }
            ];
        case TOGGLE_TODO:
            return state.map((todo, index) => {
                if (index === action.index) {
                    return Object.assign({}, todo, {
                        completed: !todo.completed
                    })
                }
                return todo
            });
        default:
            return state
    }
}

const rootReducer = combineReducers({
    visibilityFilter,
    todos
});

export default rootReducer
