import { Box } from "@/src/components/ui/box";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useBoundStore } from "@/src/store";
import DashboardLayout from "./_layout";
import { HStack } from "@/src/components/ui/hstack";
import OnboardingForm from "@/src/components/forms/onboarding";
import { useState } from "react";

export default function Onboarding() {
  const store = useBoundStore();

  const [phone, setPhone] = useState(store.user?.contact_number || "");
  const [option, setOption] = useState(store.user?.default_fulfillment || "");
  const [branch, setBranch] = useState(store.user?.branch_name || "");

  return (
    <DashboardLayout>
      <Box className="flex flex-col h-full w-full pl-4 pr-4">
        <HStack className="justify-between">
          <Box />
          <Button
            variant="link"
            className="end-0 mt-[-8px]"
            onPress={() => {
              // Navigate to the actual dashboard
              store.setOnboardingDone(true);
            }}
          >
            <ButtonText>Skip ahead</ButtonText>
          </Button>
        </HStack>
        <Text bold size="3xl">
          Tell us more about You
        </Text>
        <OnboardingForm
          phone={phone}
          branch={branch}
          fulfillmentOption={option}
          setPhoneValue={setPhone}
          setFulfillmentOption={setOption}
          setBranch={setBranch}
        />
        <Box className="mt-auto">
          <Button
            className="mt-8"
            onPress={() => {
              // Navigate to the actual dashboard
              store.setOnboardingDone(true);
            }}
          >
            <ButtonText>All Set. Let's explore!</ButtonText>
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
