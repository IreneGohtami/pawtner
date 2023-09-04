import React /*, { useEffect, useState }*/ from "react";
import { graphql } from "gatsby";
//import { collection, getDoc, query, where, orderBy } from "firebase/firestore";
import Seo from "../components/seo";
//import { db } from "../firebase";

const PuppyDetail = ({ data }) => {
  const { puppy } = data;
  /*const { id } = pageContext;
  const [puppy, setPuppy] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState("");

  useEffect(() => {
    async function getPuppy() {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "puppy"),
          //where("status", "==", "available"),
          orderBy("created_at", "asc")
        );
        const querySnapshot = await getDoc(q);
        if (querySnapshot.exists()) {
          setPuppy(querySnapshot.data());
        }
      } catch (e) {
        setErrorAlert("Failed to fetch puppy info. Please try again.");
        console.log(e, "Failed to fetch puppy info");
      }
      setIsLoading(false);
    }
    getPuppy();
  }, []);*/

  //const { puppy } = data; // Access puppy data here
  //console.log(id, "!");

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

export default PuppyDetail;
