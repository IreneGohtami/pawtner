import React from "react";
import { Center, Spinner } from "@chakra-ui/react";

const CustomSpinner = (props) => {
  return (
    <Center minH={props.height} minW={props.width} m="0 auto">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Center>
  );
};

export default CustomSpinner;
