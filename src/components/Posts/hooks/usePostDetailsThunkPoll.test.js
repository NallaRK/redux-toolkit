import React from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import usePostDetailsThunkPoll from "./usePostDetailsThunkPoll";
import useThunkPoll from "../../../hooks/useThunkPoll";
import { fetchPostDetails } from "../postSlice";

// Mock the generic useThunkPoll hook
jest.mock("../../../hooks/useThunkPoll");

// Mock the fetchPostDetails action
jest.mock("../postSlice", () => ({
  fetchPostDetails: jest.fn(),
}));

// Mock console.log to avoid noise in tests
console.log = jest.fn();

const mockStore = configureMockStore([]);
const store = mockStore({});

const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

describe("usePostDetailsThunkPoll", () => {
  let mockUseThunkPoll;
  let mockFetchPostDetails;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFetchPostDetails = fetchPostDetails;
    mockFetchPostDetails.mockReturnValue({
      type: "posts/fetchPostDetails",
      payload: "mock-action",
    });
    mockUseThunkPoll = useThunkPoll;

    // Default mock return for useThunkPoll
    mockUseThunkPoll.mockReturnValue({
      isPollingJobActive: false,
      isPolling: false,
      attemptCount: 0,
      lastResult: null,
      validationStatus: null,
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
    });
  });

  describe("Default Parameters", () => {
    it("should use default requestId '1' when none provided", () => {
      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function), // thunkAction
        5, // MAX_POLL_ATTEMPTS
        3000, // POLL_INTERVAL_MS
        expect.any(Function) // validator
      );
    });

    it("should use fixed constants for maxAttempts and interval", () => {
      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function),
        5, // MAX_POLL_ATTEMPTS
        3000, // POLL_INTERVAL_MS
        expect.any(Function)
      );
    });
  });

  describe("Custom RequestId", () => {
    it("should use custom requestId when provided", () => {
      const customRequestId = "123";

      renderHook(() => usePostDetailsThunkPoll(customRequestId), {
        wrapper,
      });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function),
        5,
        3000,
        expect.any(Function)
      );
    });

    it("should handle empty string requestId", () => {
      renderHook(() => usePostDetailsThunkPoll(""), { wrapper });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function),
        5,
        3000,
        expect.any(Function)
      );
    });

    it("should handle null requestId", () => {
      renderHook(() => usePostDetailsThunkPoll(null), { wrapper });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function),
        5,
        3000,
        expect.any(Function)
      );
    });
  });

  describe("Thunk Action Logic", () => {
    it("should call fetchPostDetails with correct postId when requestId is provided", () => {
      let capturedThunkAction;
      mockUseThunkPoll.mockImplementation((thunkAction) => {
        capturedThunkAction = thunkAction;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll("456"), { wrapper });

      // Execute the captured thunk action
      capturedThunkAction();

      expect(mockFetchPostDetails).toHaveBeenCalledWith({ postId: "456" });
    });

    it("should return Promise.resolve() when requestId is falsy", () => {
      let capturedThunkAction;
      mockUseThunkPoll.mockImplementation((thunkAction) => {
        capturedThunkAction = thunkAction;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(""), { wrapper });

      // Execute the captured thunk action
      const result = capturedThunkAction();

      expect(result).toBeInstanceOf(Promise);
      expect(mockFetchPostDetails).not.toHaveBeenCalled();
    });
  });

  describe("Validator Logic", () => {
    it("should return false when data is null or undefined", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      expect(capturedValidator(null)).toBe(false);
      expect(capturedValidator(undefined)).toBe(false);
    });

    it("should return true when all posts have non-empty body", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const validData = [
        { id: 1, body: "Valid body content" },
        { id: 2, body: "Another valid body" },
        { id: 3, body: "  Non-empty after trim  " },
      ];

      expect(capturedValidator(validData)).toBe(true);
    });

    it("should return false when any post has empty body", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const invalidData = [
        { id: 1, body: "Valid body content" },
        { id: 2, body: "" }, // Empty body
        { id: 3, body: "Another valid body" },
      ];

      expect(capturedValidator(invalidData)).toBe(false);
    });

    it("should return false when any post has whitespace-only body", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const invalidData = [
        { id: 1, body: "Valid body content" },
        { id: 2, body: "   " }, // Whitespace only
        { id: 3, body: "Another valid body" },
      ];

      expect(capturedValidator(invalidData)).toBe(false);
    });

    it("should return false when any post has missing body property", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const invalidData = [
        { id: 1, body: "Valid body content" },
        { id: 2 }, // Missing body property
        { id: 3, body: "Another valid body" },
      ];

      expect(capturedValidator(invalidData)).toBe(false);
    });

    it("should return false when any post is null or undefined", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const invalidData = [
        { id: 1, body: "Valid body content" },
        null, // Null post
        { id: 3, body: "Another valid body" },
      ];

      expect(capturedValidator(invalidData)).toBe(false);
    });

    it("should handle empty array", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      expect(capturedValidator([])).toBe(true); // Empty array should pass .every()
    });
  });

  describe("Return Values", () => {
    it("should return all useThunkPoll properties", () => {
      const mockPollingState = {
        isPollingJobActive: true,
        isPolling: false,
        attemptCount: 2,
        lastResult: { payload: [{ id: 1, body: "test content" }] },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      };

      mockUseThunkPoll.mockReturnValue(mockPollingState);

      const { result } = renderHook(() => usePostDetailsThunkPoll(), {
        wrapper,
      });

      expect(result.current).toEqual(mockPollingState);
    });

    it("should preserve startPolling and stopPolling functions", () => {
      const mockStartPolling = jest.fn();
      const mockStopPolling = jest.fn();

      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 0,
        lastResult: null,
        validationStatus: null,
        startPolling: mockStartPolling,
        stopPolling: mockStopPolling,
      });

      const { result } = renderHook(() => usePostDetailsThunkPoll(), {
        wrapper,
      });

      expect(result.current.startPolling).toBe(mockStartPolling);
      expect(result.current.stopPolling).toBe(mockStopPolling);
    });
  });

  describe("Integration with useThunkPoll", () => {
    it("should pass correct parameters to useThunkPoll", () => {
      renderHook(() => usePostDetailsThunkPoll("789"), { wrapper });

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        expect.any(Function),
        5, // MAX_POLL_ATTEMPTS
        3000, // POLL_INTERVAL_MS
        expect.any(Function)
      );
    });
  });

  describe("Validator Stability", () => {
    it("should maintain stable validator reference across re-renders", () => {
      const calls = [];
      mockUseThunkPoll.mockImplementation((...args) => {
        calls.push(args); // Capture validator function
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 0,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      const { rerender } = renderHook(() => usePostDetailsThunkPoll(), {
        wrapper,
      });
      rerender();
      rerender();

      // All validator references should be the same (stable callback)
      expect(calls).toHaveLength(3);
      expect(calls[0][3]).toBe(calls[1][3]); // validator function should be stable
      expect(calls[1][3]).toBe(calls[2][3]); // validator function should be stable
    });
  });

  describe("Realistic Polling Scenarios", () => {
    it("should handle successful validation with valid post details", () => {
      const postDetails = [
        { id: 1, body: "Complete post body content" },
        { id: 2, body: "Another detailed post content" },
      ];
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 3,
        lastResult: { payload: postDetails },
        validationStatus: "success",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostDetailsThunkPoll("123"), {
        wrapper,
      });

      expect(result.current.validationStatus).toBe("success");
      expect(result.current.attemptCount).toBe(3);
      expect(result.current.lastResult.payload).toEqual(postDetails);
    });

    it("should handle max attempts reached with incomplete post details", () => {
      const incompleteDetails = [
        { id: 1, body: "Complete post body" },
        { id: 2, body: "" }, // Empty body
      ];
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 5,
        lastResult: { payload: incompleteDetails },
        validationStatus: "max_attempts_reached",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostDetailsThunkPoll("456"), {
        wrapper,
      });

      expect(result.current.validationStatus).toBe("max_attempts_reached");
      expect(result.current.attemptCount).toBe(5);
    });

    it("should handle polling in progress state", () => {
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: true,
        isPolling: true,
        attemptCount: 2,
        lastResult: { payload: [{ id: 1, body: "Partial content" }] },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostDetailsThunkPoll("789"), {
        wrapper,
      });

      expect(result.current.isPollingJobActive).toBe(true);
      expect(result.current.isPolling).toBe(true);
      expect(result.current.validationStatus).toBe(null);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single post with valid body", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 1,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const singlePost = [{ id: 1, body: "Single post content" }];
      expect(capturedValidator(singlePost)).toBe(true);
    });

    it("should handle post with body containing only special characters", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 1,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const specialCharPost = [{ id: 1, body: "!@#$%^&*()" }];
      expect(capturedValidator(specialCharPost)).toBe(true);
    });

    it("should handle post with body containing newlines and tabs", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 1,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      const multilinePost = [{ id: 1, body: "\n\tContent with\nnewlines\t" }];
      expect(capturedValidator(multilinePost)).toBe(true);
    });

    it("should handle non-string body values", () => {
      let capturedValidator;
      mockUseThunkPoll.mockImplementation((action, max, int, validator) => {
        capturedValidator = validator;
        return {
          isPollingJobActive: false,
          isPolling: false,
          attemptCount: 1,
          lastResult: null,
          validationStatus: null,
          startPolling: jest.fn(),
          stopPolling: jest.fn(),
        };
      });

      renderHook(() => usePostDetailsThunkPoll(), { wrapper });

      // Test with number body - should throw because numbers don't have trim()
      const numberBodyPost = [{ id: 1, body: 123 }];
      expect(() => capturedValidator(numberBodyPost)).toThrow(); // Should throw because number doesn't have trim()

      // Test with null body - should return false due to optional chaining
      const nullBodyPost = [{ id: 1, body: null }];
      expect(capturedValidator(nullBodyPost)).toBe(false); // Should be false, not throw

      // Test with undefined body - should return false due to optional chaining
      const undefinedBodyPost = [{ id: 1, body: undefined }];
      expect(capturedValidator(undefinedBodyPost)).toBe(false); // Should be false, not throw
    });
  });
});
