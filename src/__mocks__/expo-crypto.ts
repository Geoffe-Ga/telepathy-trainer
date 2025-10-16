export const getRandomBytesAsync = jest.fn(async (byteCount: number) => {
  return new Uint8Array(byteCount);
});
