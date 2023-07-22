import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import Seo from "../components/seo";
import { isCookieSet, setCookie } from "../cookie-manager";
import theme from "../theme";
import HomePage from "./home";
import SelectOptionPage from "./select-option";

const IndexPage = () => {
  const visited = isCookieSet();

  if (visited) {
    return (
      <ChakraProvider theme={theme}>
        <HomePage />
      </ChakraProvider>
    );
  } else {
    setCookie();
    return <SelectOptionPage />;
  }
};

export const Head = () => <Seo title="Home Page" />;

export default IndexPage;
