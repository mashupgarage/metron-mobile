import { FC, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "../ui/checkbox";
import { FormControl } from "../ui/form-control";
import { VStack } from "../ui/vstack";
import { Text } from "../ui/text";
import { CheckIcon } from "lucide-react-native";

interface FilterModalProps {
  byTypeOptions: { label: string; value: string }[];
  byPublisherOptions: { label: string; value: string }[];
}

export const FilterModal: FC<FilterModalProps> = ({
  byTypeOptions = [],
  byPublisherOptions = [],
}) => {
  const [selectedByType, setSelectedByType] = useState<string[]>([]);
  const [selectedByPublisher, setSelectedByPublisher] = useState<string[]>([]);
  return (
    <FormControl>
      <VStack space="sm">
        <Text size="sm" bold>
          By Type
        </Text>
        <CheckboxGroup value={selectedByType} onChange={setSelectedByType}>
          {byTypeOptions.map((option) => (
            <Checkbox className="mb-1" key={option.value} value={option.value}>
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>{option.label}</CheckboxLabel>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </VStack>
      <VStack className="mt-4" space="sm">
        <Text size="sm" bold>
          By Publisher
        </Text>
        <CheckboxGroup
          value={selectedByPublisher}
          onChange={setSelectedByPublisher}
        >
          {byPublisherOptions.map((option) => (
            <Checkbox className="mb-1" key={option.value} value={option.value}>
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>{option.label}</CheckboxLabel>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </VStack>
    </FormControl>
  );
};
