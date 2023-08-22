import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import HomePage from "./home";

const IndexPage = () => {
  return (
    <ChakraProvider theme={theme}>
      <HomePage />
    </ChakraProvider>
  );
};

export default IndexPage;
