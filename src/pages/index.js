import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import Seo from "../components/seo";
import theme from "../theme";
import HomePage from "./home";

const IndexPage = () => {
  return (
    <ChakraProvider theme={theme}>
      <HomePage />
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Home Page" />;

export default IndexPage;
