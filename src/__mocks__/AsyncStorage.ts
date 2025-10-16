const storage: Record<string, string> = {};

export default {
  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
  }),
  getItem: jest.fn(async (key: string) => {
    return storage[key] || null;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  }),
  getAllKeys: jest.fn(async () => {
    return Object.keys(storage);
  }),
};
