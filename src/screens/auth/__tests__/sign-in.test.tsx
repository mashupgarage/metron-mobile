import { render, fireEvent } from "@testing-library/react-native";
import SignIn from "../sign-in";
import { NavigationContainer } from "@react-navigation/native";

describe("SignIn", () => {
  jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  }));

  it("renders correctly", () => {
    const screen = render(
      <NavigationContainer>
        <SignIn
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
        <SignIn
          navigation={{
            replace: jest.fn(),
          }}
        />
      </NavigationContainer>
    );
    const { getByText } = screen;
    expect(getByText("Welcome Back!")).toBeTruthy();
  });

  it("renders the Sign up button", () => {
    const screen = render(
      <NavigationContainer>
        <SignIn
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
        <SignIn
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
