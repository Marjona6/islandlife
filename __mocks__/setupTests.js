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

// Mock Firebase modules
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = () => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(callback => {
      // Simulate anonymous user
      callback({
        uid: 'test-user-id',
        email: null,
        isAnonymous: true,
        displayName: null,
      });
      return jest.fn(); // Return unsubscribe function
    }),
    signInAnonymously: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-user-id',
        email: null,
        isAnonymous: true,
        displayName: null,
      },
    }),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        isAnonymous: false,
        displayName: null,
      },
    }),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        isAnonymous: false,
        displayName: null,
      },
    }),
    signOut: jest.fn().mockResolvedValue(),
    EmailAuthProvider: {
      credential: jest.fn().mockReturnValue({}),
    },
  });

  return mockAuth;
});

jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestore = () => ({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
          data: () => null,
        }),
        set: jest.fn().mockResolvedValue(),
        update: jest.fn().mockResolvedValue(),
      }),
    }),
  });

  return mockFirestore;
});

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

// Mock react-native-animatable
jest.mock('react-native-animatable', () => {
  const React = require('react');
  const { View } = require('react-native');

  const mockComponent = name => {
    const Component = React.forwardRef((props, ref) => {
      // Create a mock component that has the animate method
      const mockRef = {
        current: {
          animate: jest.fn(() => Promise.resolve()),
          ...props,
        },
      };

      // If ref is a function, call it with the mock ref
      if (typeof ref === 'function') {
        ref(mockRef.current);
      } else if (ref) {
        ref.current = mockRef.current;
      }

      return React.createElement(View, {
        ...props,
        ref: mockRef,
        testID: props.testID || name,
      });
    });
    Component.displayName = name;
    return Component;
  };

  return {
    View: mockComponent('Animatable.View'),
    Text: mockComponent('Animatable.Text'),
    Image: mockComponent('Animatable.Image'),
    createAnimatableComponent: component =>
      mockComponent(`Animatable.${component.displayName || 'Component'}`),
  };
});

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
  const React = require('react');
  const RN = jest.requireActual('react-native');

  // Create mock components for commonly used RN components
  const mockComponent = name => {
    const Component = React.forwardRef((props, ref) => {
      return React.createElement(
        'div',
        {
          ...props,
          ref,
          'data-testid': props.testID,
        },
        props.children,
      );
    });
    Component.displayName = name;
    return Component;
  };

  return {
    ...RN,
    // Suppress deprecated PropTypes warnings
    ColorPropType: () => {},
    EdgeInsetsPropType: () => {},
    PointPropType: () => {},
    ViewPropTypes: {},
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

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  const LinearGradient = React.forwardRef((props, ref) => {
    return React.createElement(View, {
      ...props,
      ref,
      testID: props.testID || 'LinearGradient',
    });
  });

  LinearGradient.displayName = 'LinearGradient';
  return LinearGradient;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createSvgMock = name => {
    const Component = React.forwardRef((props, ref) => {
      return React.createElement(View, {
        ...props,
        ref,
        testID: props.testID || name,
      });
    });
    Component.displayName = name;
    return Component;
  };

  const Svg = createSvgMock('Svg');
  const Path = createSvgMock('Path');
  const Circle = createSvgMock('Circle');
  const Rect = createSvgMock('Rect');
  const G = createSvgMock('G');
  const Defs = createSvgMock('Defs');
  const LinearGradient = createSvgMock('LinearGradient');
  const RadialGradient = createSvgMock('RadialGradient');
  const Stop = createSvgMock('Stop');
  const Ellipse = createSvgMock('Ellipse');

  // Export both as default and named exports
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Path,
    Circle,
    Rect,
    G,
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    Ellipse,
  };
});
