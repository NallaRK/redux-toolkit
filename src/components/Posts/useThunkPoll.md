useThunkPoll.js - Generic hook with following features

1. Make a poll to given thunk action.
2. Accepts maximum attempts to poll
3. interval in milliseconds between each poll
4. Accepts callback handler, which validates thunk response, if validator return true, it stops the poll
5. If validator returns false, poll continuous until maximum attempts
6. Hook will return all essential params and also includes below
   a) isPollingJobActive - return true, if polling is started and not completed ( completed only if validator returns true or maximum attempts reached).
   b) isPolling - returns true, when a polling XHR call is in progress, this should false, during interval time.

usePostThunkPoll.js - This is Posts specific hook, use useThunkPoll.js

1. It uses useThunkPoll.js and passes thunk action, maximum attempts, interval between each attempt and validator.
2. Default polling parameters: 3000ms interval and 5 maximum attempts
3. Posts validator logic: validates if post count > 10.
4. Hook will return all essential params back to component - to handle use experience as needed.

Posts.jsx - It uses usePostThunkPoll.js and auto starts the polling.

Please do not assume anything. Ask me if you need any further clarifications and provide me the plan before you start.

Ensure the code is easy to understand and modify by the developer, if any further tweaks needed.
