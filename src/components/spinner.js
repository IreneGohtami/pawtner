import React from "react";
const { Center, Spinner } = require("@chakra-ui/react");

const CustomSpinner = (props) => {
  return (
    <Center minH={props.height}>
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
