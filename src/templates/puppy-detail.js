import React from "react";
import { graphql } from "gatsby";
import Seo from "../components/seo";

const PuppyPage = ({ data }) => {
  const { puppy } = data; // Access puppy data here
  //console.log(puppy, "!");

  return <pre>{JSON.stringify(puppy, null, 2)}</pre>;
};

export const query = graphql`
  query ($id: String!) {
    puppy(id: { eq: $id }) {
      id
      name
      breed
      gender
      price
      color
      picture {
        url
        reference
      }
      owner_id
    }
  }
`;

export const Head = () => <Seo title="Puppy" />;

export default PuppyPage;
