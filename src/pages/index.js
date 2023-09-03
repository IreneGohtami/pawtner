import { graphql } from "gatsby";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import HomePage from "./home";

const IndexPage = ({ data }) => {
  return (
    <ChakraProvider theme={theme}>
      <HomePage puppyList={data.allPuppy.nodes} />
    </ChakraProvider>
  );
};

export const query = graphql`
  query {
    allPuppy(sort: { created_at: ASC }) {
      nodes {
        id
        name
        breed
        picture {
          url
        }
      }
    }
  }
`;

export default IndexPage;
