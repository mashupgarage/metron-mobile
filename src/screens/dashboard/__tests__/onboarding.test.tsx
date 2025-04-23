import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Onboarding from "../onboarding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

jest.mock("@/src/store");
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

describe("Onboarding Screen", () => {
  jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  }));

  beforeEach(() => {
    (useSafeAreaInsets as jest.Mock).mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it("renders the onboarding form", () => {
    const { getByText } = render(<Onboarding />);
    expect(getByText("Tell us more about You")).toBeTruthy();
  });

  it("updates state when form inputs change", () => {
    const { getByTestId } = render(<Onboarding />);
    const phoneInput = getByTestId("onboarding-phone-field");
    const branchInput = getByTestId("onboarding-branch-field");
    const optionInput = getByTestId("onboarding-option-field");

    fireEvent.changeText(phoneInput, "+639954561349");
    fireEvent.changeText(optionInput, "Pickup");
    fireEvent.changeText(branchInput, "Main Branch");
  });
});
