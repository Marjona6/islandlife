// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock NativeAnimatedHelper to avoid animation issues in tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock SettingsManager (iOS) and DevSettings (RN 0.71+)
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  SettingsManager: {
    settings: {},
    setValues: jest.fn(),
  },
  getConstants: () => ({}),
}));

jest.mock('react-native/Libraries/Utilities/DevSettings', () => ({
  addMenuItem: jest.fn(),
}));

// Mock React Native components that might be undefined in test environment
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Create mock components for commonly used RN components
  const mockComponent = name => {
    const Component = function (props) {
      return props.children || null;
    };
    Component.displayName = name;
    return Component;
  };

  return {
    ...RN,
    // Ensure these components are properly mocked
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    SafeAreaView: mockComponent('SafeAreaView'),
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: styles => styles,
      flatten: jest.fn(style => style),
    },
    Animated: {
      ...RN.Animated,
      View: mockComponent('Animated.View'),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
  };
});
