import '@testing-library/jest-dom'
if (!global.crypto) {
  global.crypto = {
    subtle: {
      digest: async () => new ArrayBuffer(32),
      importKey: async () => ({}),
      sign: async () => new ArrayBuffer(32)
    }
  }
}
