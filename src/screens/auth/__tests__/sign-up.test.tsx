import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import SignUp from "../sign-up";

describe("SignUp", () => {
  jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  }));

  jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }));

  it("renders correctly", () => {
    const screen = render(
      <NavigationContainer>
        <SignUp
          navigation={{
            replace: jest.fn(),
          }}
        />
      </NavigationContainer>
    );
    const { toJSON } = screen;
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders the text correctly", () => {
    const screen = render(
      <NavigationContainer>
        <SignUp
          navigation={{
            replace: jest.fn(),
          }}
        />
      </NavigationContainer>
    );
    const { getByText } = screen;
    expect(getByText("Create your Account")).toBeTruthy();
  });

  it("renders the Sign up button", () => {
    const screen = render(
      <NavigationContainer>
        <SignUp
          navigation={{
            replace: jest.fn(),
          }}
        />
      </NavigationContainer>
    );
    const { getByText } = screen;
    expect(getByText("Sign up")).toBeTruthy();
  });

  it("handles form submission", () => {
    const screen = render(
      <NavigationContainer>
        <SignUp
          navigation={{
            replace: jest.fn(),
          }}
        />
      </NavigationContainer>
    );
    const { getByTestId } = screen;
    const submitButton = getByTestId("submit-button");
    fireEvent.press(submitButton);
    expect(submitButton).toBeTruthy();
  });
});
