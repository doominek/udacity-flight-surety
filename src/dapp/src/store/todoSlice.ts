import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Todo } from '../todos/types';

const initialState : Todo[] = [];

const todoSlice = createSlice({
                                  name: 'todos',
                                  initialState,
                                  reducers: {
                                      addTodo(state, action: PayloadAction<Todo>) {
                                          state.push(action.payload);
                                      },
                                      toggleTodo(state, action: PayloadAction<string>) {
                                          let todo = state.find(todo => todo.id === action.payload);

                                          if (todo) {
                                              todo.completed = !todo.completed;
                                          }
                                      },
                                  }
                              });

export const { addTodo, toggleTodo } = todoSlice.actions;
export default todoSlice.reducer;
