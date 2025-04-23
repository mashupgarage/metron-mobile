const gestureHandlerMock = {
  Swipeable: jest.fn(),
  DrawerLayout: jest.fn(),
  State: {},
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: jest.fn(),
  BaseButton: jest.fn(),
  RectButton: jest.fn(),
  BorderlessButton: jest.fn(),
  TouchableHighlight: jest.fn(),
  TouchableNativeFeedback: jest.fn(),
  TouchableOpacity: jest.fn(),
  TouchableWithoutFeedback: jest.fn(),
  createNativeWrapper: jest.fn(),
  Directions: {},
};

module.exports = gestureHandlerMock;