import { INCREMENT, DECREMENT,LOAD,UNLOAD,LOAD_COMPLETE } from '../constants'
import { HYDRATE } from 'next-redux-wrapper'

export const initialState = {
    appBridge:null,
  value: 0,
  action: null,
  from: null
}

export const counter = (state = initialState, action) => {
  switch (action.type) {
    case HYDRATE:
      return {
        ...state,
        ...action.payload
      }

    case INCREMENT:
      return {
        ...state,
        value: state.value + 1,
        action: 'increment',
        from: action.from
      }

    case DECREMENT:
      return {
        ...state,
        value: state.value - 1,
        action: 'decrement',
        from: action.from
      }
    case LOAD:
      return {
        ...state
      }
    case LOAD_COMPLETE:
      return {
        ...state
      }
    case UNLOAD:
      return {
        ...state
      }

    default:
      return {...state}
  }
}
