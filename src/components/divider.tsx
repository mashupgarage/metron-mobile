import { FC } from "react";
import { Box } from "./ui/box";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

interface DividerProps {
  text?: string;
  withText?: boolean;
}
const Divider: FC<DividerProps> = ({ text = "", withText = true }) => {
  return withText === true ? (
    <HStack className="w-full p-4 justify-center items-center gap-4">
      <Box className="flex flex-col items-center border-b-[1px] border-gray-300 w-[48%]" />
      <Text>{text}</Text>
      <Box className="flex flex-col items-center border-b-[1px] border-gray-300 w-[48%]" />
    </HStack>
  ) : (
    <Box className="w-full p-4 border-b-[1px] h-1 mb-4 border-gray-300" />
  );
};

export default Divider;
