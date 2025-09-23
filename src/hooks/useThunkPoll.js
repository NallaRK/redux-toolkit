import { useReducer, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";

const ActionTypes = {
  START_POLLING: "START_POLLING",
  STOP_POLLING: "STOP_POLLING",
  POLL_INIT: "POLL_INIT",
  POLL_RESULT: "POLL_RESULT",
  VALIDATION_SUCCESS: "VALIDATION_SUCCESS",
  MAX_ATTEMPTS_REACHED: "MAX_ATTEMPTS_REACHED",
};
const initialState = {
  isPollingJobActive: false,
  isPolling: false,
  attemptCount: 0,
  lastResult: null,
  validationStatus: null, // 'success', 'max_attempts_reached', null
};

function pollingReducer(state, action) {
  switch (action.type) {
    case ActionTypes.START_POLLING:
      return {
        ...initialState,
        isPollingJobActive: true,
      };
    case ActionTypes.STOP_POLLING:
      return {
        ...state,
        isPollingJobActive: false,
        isPolling: false,
      };
    case ActionTypes.POLL_INIT:
      return { ...state, isPolling: true };
    case ActionTypes.POLL_RESULT:
      return {
        ...state,
        isPolling: false,
        lastResult: action.payload,
        attemptCount: state.attemptCount + 1,
      };
    case ActionTypes.VALIDATION_SUCCESS:
      return {
        ...state,
        isPollingJobActive: false,
        validationStatus: "success",
      };
    case ActionTypes.MAX_ATTEMPTS_REACHED:
      return {
        ...state,
        isPollingJobActive: false,
        validationStatus: "max_attempts_reached",
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const useThunkPoll = (thunkAction, maxAttempts, interval, validator) => {
  const dispatch = useDispatch();
  const [state, dispatchAction] = useReducer(pollingReducer, initialState);

  const thunkActionRef = useRef(thunkAction);
  const validatorRef = useRef(validator);
  const intervalRef = useRef(interval);
  const maxAttemptsRef = useRef(maxAttempts);
  const timeoutRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    thunkActionRef.current = thunkAction;
    validatorRef.current = validator;
    intervalRef.current = interval;
    maxAttemptsRef.current = maxAttempts;
  }, [thunkAction, validator, interval, maxAttempts]);

  const performPoll = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.isPollingJobActive) return;

    const handleNextPoll = () => {
      if (
        maxAttemptsRef.current != null &&
        stateRef.current.attemptCount + 1 >= maxAttemptsRef.current
      ) {
        dispatchAction({ type: ActionTypes.MAX_ATTEMPTS_REACHED });
      } else {
        timeoutRef.current = setTimeout(performPoll, intervalRef.current);
      }
    };

    dispatchAction({ type: ActionTypes.POLL_INIT });

    dispatch(thunkActionRef.current)
      .then((result) => {
        dispatchAction({ type: ActionTypes.POLL_RESULT, payload: result });
        if (validatorRef?.current(result.payload)) {
          dispatchAction({ type: ActionTypes.VALIDATION_SUCCESS });
        } else {
          handleNextPoll();
        }
      })
      .catch((error) => {
        dispatchAction({ type: ActionTypes.POLL_RESULT, payload: { error } });
        handleNextPoll();
      });
  }, [dispatch]);

  useEffect(() => {
    if (state.isPollingJobActive) {
      performPoll();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isPollingJobActive, performPoll]);

  const startPolling = useCallback(() => {
    dispatchAction({ type: ActionTypes.START_POLLING });
  }, []);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    dispatchAction({ type: ActionTypes.STOP_POLLING });
  }, []);

  return {
    ...state,
    startPolling,
    stopPolling,
  };
};

export default useThunkPoll;
