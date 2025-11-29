/**
 * @format
 */

import App from '../App';

describe('App', () => {
  test('App component can be imported', () => {
    expect(App).toBeDefined();
  });

  test('App is a valid React component', () => {
    expect(typeof App).toBe('function');
  });
});
