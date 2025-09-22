import { renderHook, act } from "@testing-library/react";
import usePostThunkPoll from "./usePostThunkPoll";
import useThunkPoll from "../../../hooks/useThunkPoll";
import { fetchPosts } from "../postSlice";

// Mock the generic useThunkPoll hook
jest.mock("../../../hooks/useThunkPoll");

// Mock the fetchPosts action
jest.mock("../postSlice", () => ({
  fetchPosts: jest.fn(),
}));

describe("usePostThunkPoll", () => {
  let mockUseThunkPoll;
  let mockFetchPosts;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFetchPosts = fetchPosts;
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
    it("should use default parameters when none provided", () => {
      renderHook(() => usePostThunkPoll());

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        mockFetchPosts,
        5, // default maxAttempts
        3000, // default interval
        expect.any(Function) // postsValidator
      );
    });
  });

  describe("Custom Parameters", () => {
    it("should use custom parameters when provided", () => {
      const customMaxAttempts = 10;
      const customInterval = 5000;

      renderHook(() => usePostThunkPoll(customMaxAttempts, customInterval));

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        mockFetchPosts,
        customMaxAttempts,
        customInterval,
        expect.any(Function)
      );
    });

    it("should handle partial parameter overrides", () => {
      renderHook(() => usePostThunkPoll(7)); // Only maxAttempts

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        mockFetchPosts,
        7,
        3000, // default interval
        expect.any(Function)
      );
    });
  });

  describe("Posts Validator Logic", () => {
    it("should return false for payload with length <= 101", () => {
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

      renderHook(() => usePostThunkPoll());

      // Test with array of length 101 (should return false)
      const posts101 = Array(101).fill({ id: 1, title: "test" });
      expect(capturedValidator(posts101)).toBe(false);

      // Test with array of length 50 (should return false)
      const posts50 = Array(50).fill({ id: 1, title: "test" });
      expect(capturedValidator(posts50)).toBe(false);

      // Test with empty array (should return false)
      expect(capturedValidator([])).toBe(false);
    });

    it("should return true for payload with length > 101", () => {
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

      renderHook(() => usePostThunkPoll());

      // Test with array of length 102 (should return true)
      const posts102 = Array(102).fill({ id: 1, title: "test" });
      expect(capturedValidator(posts102)).toBe(true);

      // Test with array of length 200 (should return true)
      const posts200 = Array(200).fill({ id: 1, title: "test" });
      expect(capturedValidator(posts200)).toBe(true);
    });

    it("should return false for invalid payload types", () => {
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

      renderHook(() => usePostThunkPoll());

      // Test with null payload
      expect(capturedValidator(null)).toBe(false);

      // Test with undefined payload
      expect(capturedValidator(undefined)).toBe(false);

      // Test with non-array payload
      expect(capturedValidator({ length: 200 })).toBe(false);
      expect(capturedValidator("string")).toBe(false);
      expect(capturedValidator(123)).toBe(false);
    });
  });

  describe("Return Values", () => {
    it("should return all useThunkPoll properties plus postsCount", () => {
      const mockPollingState = {
        isPollingJobActive: true,
        isPolling: false,
        attemptCount: 2,
        lastResult: { payload: Array(50).fill({ id: 1 }) },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      };

      mockUseThunkPoll.mockReturnValue(mockPollingState);

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current).toEqual({
        ...mockPollingState,
        postsCount: 50, // Should calculate from lastResult payload length
      });
    });

    it("should calculate postsCount from lastResult payload", () => {
      const posts = Array(75).fill({ id: 1, title: "test" });
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 1,
        lastResult: { payload: posts },
        validationStatus: "success",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(75);
    });

    it("should return postsCount as 0 when no lastResult", () => {
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 0,
        lastResult: null,
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(0);
    });

    it("should return postsCount as 0 when payload is not an array", () => {
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 1,
        lastResult: { payload: { error: "Network error" } },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(0);
    });
  });

  describe("Integration with useThunkPoll", () => {
    it("should pass correct parameters to useThunkPoll", () => {
      renderHook(() => usePostThunkPoll(3, 2000));

      expect(mockUseThunkPoll).toHaveBeenCalledWith(
        mockFetchPosts,
        3,
        2000,
        expect.any(Function)
      );
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

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.startPolling).toBe(mockStartPolling);
      expect(result.current.stopPolling).toBe(mockStopPolling);
    });
  });

  describe("Validator Stability", () => {
    it("should maintain stable validator reference across re-renders", () => {
      const calls = [];
      mockUseThunkPoll.mockImplementation((...args) => {
        calls.push(args[3]); // Capture validator function
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

      const { rerender } = renderHook(() => usePostThunkPoll());
      rerender();
      rerender();

      // All validator references should be the same (stable callback)
      expect(calls).toHaveLength(3);
      expect(calls[0]).toBe(calls[1]);
      expect(calls[1]).toBe(calls[2]);
    });
  });

  describe("Realistic Polling Scenarios", () => {
    it("should handle successful validation with > 101 posts", () => {
      const posts = Array(150).fill({ id: 1, title: "post" });
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 3,
        lastResult: { payload: posts },
        validationStatus: "success",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(150);
      expect(result.current.validationStatus).toBe("success");
      expect(result.current.attemptCount).toBe(3);
    });

    it("should handle max attempts reached with insufficient posts", () => {
      const posts = Array(50).fill({ id: 1, title: "post" });
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 5,
        lastResult: { payload: posts },
        validationStatus: "max_attempts_reached",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(50);
      expect(result.current.validationStatus).toBe("max_attempts_reached");
      expect(result.current.attemptCount).toBe(5);
    });

    it("should handle polling in progress state", () => {
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: true,
        isPolling: true,
        attemptCount: 2,
        lastResult: { payload: Array(75).fill({ id: 1 }) },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.isPollingJobActive).toBe(true);
      expect(result.current.isPolling).toBe(true);
      expect(result.current.postsCount).toBe(75);
      expect(result.current.validationStatus).toBe(null);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty posts array", () => {
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 1,
        lastResult: { payload: [] },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(0);
    });

    it("should handle exactly 101 posts (boundary case)", () => {
      const posts = Array(101).fill({ id: 1, title: "post" });
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 1,
        lastResult: { payload: posts },
        validationStatus: null,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(101);
    });

    it("should handle exactly 102 posts (boundary case)", () => {
      const posts = Array(102).fill({ id: 1, title: "post" });
      mockUseThunkPoll.mockReturnValue({
        isPollingJobActive: false,
        isPolling: false,
        attemptCount: 1,
        lastResult: { payload: posts },
        validationStatus: "success",
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
      });

      const { result } = renderHook(() => usePostThunkPoll());

      expect(result.current.postsCount).toBe(102);
    });
  });
});
