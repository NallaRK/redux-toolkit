import { useReducer, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";

const initialState = {
  isPollingJobActive: false,
  isPolling: false,
  attemptCount: 0,
  lastResult: null,
  validationStatus: null, // 'success', 'max_attempts_reached', null
};

function pollingReducer(state, action) {
  switch (action.type) {
    case "START_POLLING":
      return {
        ...initialState,
        isPollingJobActive: true,
      };
    case "STOP_POLLING":
      return {
        ...state,
        isPollingJobActive: false,
        isPolling: false,
      };
    case "POLL_INIT":
      return { ...state, isPolling: true };
    case "POLL_RESULT":
      return {
        ...state,
        isPolling: false,
        lastResult: action.payload,
        attemptCount: state.attemptCount + 1,
      };
    case "VALIDATION_SUCCESS":
      return {
        ...state,
        isPollingJobActive: false,
        validationStatus: "success",
      };
    case "MAX_ATTEMPTS_REACHED":
      return {
        ...state,
        isPollingJobActive: false,
        validationStatus: "max_attempts_reached",
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

/**
 * Generic polling hook for Redux thunk actions
 * @param {Function} thunkAction - The thunk action to dispatch
 * @param {number} maxAttempts - Maximum number of polling attempts
 * @param {number} interval - Interval between polls in milliseconds
 * @param {Function} validator - Function that validates the thunk response (receives full payload)
 * @returns {Object} Polling state and control functions
 */
const useThunkPoll = (thunkAction, maxAttempts, interval, validator) => {
  const dispatch = useDispatch();
  const [state, dispatchAction] = useReducer(pollingReducer, initialState);

  // Use refs to hold values that can change over time but shouldn't trigger re-renders
  const thunkActionRef = useRef(thunkAction);
  const validatorRef = useRef(validator);
  const intervalRef = useRef(interval);
  const maxAttemptsRef = useRef(maxAttempts);
  const timeoutRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef updated with the latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Keep other refs updated with the latest values from props
  useEffect(() => {
    thunkActionRef.current = thunkAction;
    validatorRef.current = validator;
    intervalRef.current = interval;
    maxAttemptsRef.current = maxAttempts;
  }, [thunkAction, validator, interval, maxAttempts]);

  const performPoll = useCallback(() => {
    const currentState = stateRef.current;
    if (!currentState.isPollingJobActive) return;

    dispatchAction({ type: "POLL_INIT" });

    dispatch(thunkActionRef.current())
      .then((result) => {
        dispatchAction({ type: "POLL_RESULT", payload: result });
        const nextState = {
          ...stateRef.current,
          attemptCount: stateRef.current.attemptCount + 1,
        };

        const isValid = validatorRef.current(result.payload);
        if (isValid) {
          dispatchAction({ type: "VALIDATION_SUCCESS" });
          return;
        }

        if (nextState.attemptCount >= maxAttemptsRef.current) {
          dispatchAction({ type: "MAX_ATTEMPTS_REACHED" });
          return;
        }

        timeoutRef.current = setTimeout(performPoll, intervalRef.current);
      })
      .catch((error) => {
        console.error("Error during polling:", error);
        dispatchAction({ type: "POLL_RESULT", payload: { error } });
        const nextState = {
          ...stateRef.current,
          attemptCount: stateRef.current.attemptCount + 1,
        };

        if (nextState.attemptCount >= maxAttemptsRef.current) {
          dispatchAction({ type: "MAX_ATTEMPTS_REACHED" });
          return;
        }

        timeoutRef.current = setTimeout(performPoll, intervalRef.current);
      });
  }, [dispatch]);

  const startPolling = useCallback(() => {
    dispatchAction({ type: "START_POLLING" });
    // Use a timeout to ensure the state update from START_POLLING is applied before the first poll
    setTimeout(performPoll, 0);
  }, [performPoll]);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    dispatchAction({ type: "STOP_POLLING" });
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startPolling,
    stopPolling,
  };
};

export default useThunkPoll;
