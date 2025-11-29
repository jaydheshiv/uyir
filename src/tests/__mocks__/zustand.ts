// Mock for zustand - pass through to actual implementation
const actualZustand = jest.requireActual('zustand');

export const { create } = actualZustand;
export default actualZustand;
