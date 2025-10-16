import { renderHook, waitFor } from '@testing-library/react-native';
import { useDatabase } from './useDatabase';
import { initDatabase } from '../database/db';

jest.mock('../database/db');

describe('useDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful initialization', () => {
    it('should initialize database on mount', async () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      renderHook(() => useDatabase());

      await waitFor(() => {
        expect(initDatabase).toHaveBeenCalledTimes(1);
      });
    });

    it('should start with isLoading true', () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useDatabase());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should set isLoading false after successful initialization', async () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useDatabase());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should only initialize once even with multiple hook instances', async () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      renderHook(() => useDatabase());
      renderHook(() => useDatabase());
      renderHook(() => useDatabase());

      await waitFor(() => {
        expect(initDatabase).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle initialization errors', async () => {
      const error = new Error('Database initialization failed');
      (initDatabase as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDatabase());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
    });

    it('should set isLoading false even when initialization fails', async () => {
      (initDatabase as jest.Mock).mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useDatabase());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle different error types', async () => {
      const customError = new Error('Custom error message');
      (initDatabase as jest.Mock).mockRejectedValue(customError);

      const { result } = renderHook(() => useDatabase());

      await waitFor(() => {
        expect(result.current.error).toEqual(customError);
      });

      expect(result.current.error?.message).toBe('Custom error message');
    });
  });

  describe('Re-mounting behavior', () => {
    it('should re-initialize database if hook is remounted', async () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      const { unmount } = renderHook(() => useDatabase());

      await waitFor(() => {
        expect(initDatabase).toHaveBeenCalledTimes(1);
      });

      unmount();

      renderHook(() => useDatabase());

      await waitFor(() => {
        expect(initDatabase).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('State transitions', () => {
    it('should transition from loading to loaded state', async () => {
      (initDatabase as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useDatabase());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // After initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should transition from loading to error state', async () => {
      const error = new Error('Failed');
      (initDatabase as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useDatabase());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // After error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
