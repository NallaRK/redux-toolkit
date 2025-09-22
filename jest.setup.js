import "@testing-library/jest-dom";

// Suppress React act() warnings for async state updates in hooks during testing
// These warnings are expected for async polling hooks and don't indicate test failures
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes(
      "Warning: An update to TestComponent inside a test was not wrapped in act"
    ) ||
      message.includes("was not wrapped in act"))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
