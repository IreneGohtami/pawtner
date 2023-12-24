import React from "react";
import { Box, Heading, ListItem, OrderedList, Text } from "@chakra-ui/react";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const AboutUsPage = () => {
  const company = "Pawtner";
  return (
    <>
      <Header authorizedRole="all" bg="#F2F2F2" />
      <Heading my={8} textAlign="center">
        About {company}
      </Heading>
      <Box w="70%" margin="0 auto" pb={10}>
        <Text>
          Welcome to {company}, your go-to platform for connecting certified dog
          breeders with passionate and responsible puppy seekers. At {company},
          we understand the challenges of finding the perfect furry companion,
          and we've crafted a platform to simplify and streamline the process.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          Our Mission
        </Heading>
        <Text>
          Our mission is simple: to facilitate a seamless connection between
          certified dog breeders and individuals or families searching for their
          ideal puppy companion. We strive to create a platform that promotes
          responsible and ethical breeding practices while ensuring a positive
          and transparent experience for both breeders and buyers.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          How It Works
        </Heading>
        <Text>
          At {company}, we operate as a puppy reservation platform. Buyers can
          browse through our curated list of available puppies, connect with
          certified breeders through our secure messaging system, and initiate
          the reservation process. Here's a step-by-step guide:
          <OrderedList mt={1} pl={5}>
            <ListItem>
              <b>Browse and Connect:</b> Explore a diverse range of certified
              breeders and their available puppies. Use our user-friendly
              platform to find the perfect match for your lifestyle and
              preferences.
            </ListItem>
            <ListItem>
              <b>Secure Messaging System:</b> Communicate directly with breeders
              through our secure messaging system. Discuss details, ask
              questions, and get to know the breeder to ensure a comfortable and
              informed decision.
            </ListItem>
            <ListItem>
              <b>Reservation Process:</b> Once you've found the right fit,
              initiate the reservation process. Complete external forms provided
              by the breeder, and if both parties agree, proceed to place a
              security deposit along with a non-refundable platform fee.
            </ListItem>
            <ListItem>
              <b>Rehoming Meeting:</b> On the agreed-upon rehoming date, meet
              the breeder in person to finalize the transaction. Pay the breeder
              directly, and once the process is complete, the breeder releases
              the security deposit.
            </ListItem>
            <ListItem>
              <b>Transparent Transactions:</b> {company} does not handle the
              actual transaction; it is conducted directly between the buyer and
              the breeder. We prioritize transparency and open communication
              throughout the process.
            </ListItem>
          </OrderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          Our Commitment
        </Heading>
        <Text>
          While we provide a platform for connecting breeders and buyers, it's
          essential to note that {company} does not guarantee any specific
          outcomes, and we take no responsibility for the transaction or any
          subsequent matters. We operate with a commitment to ethical breeding
          practices and a dedication to fostering a trustworthy community.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          Data Security
        </Heading>
        <Text>
          Rest assured that at {company}, we prioritize your privacy. We only
          store essential registration data and additional transaction
          information. External forms are used for specific details, and we do
          not retain any unnecessary personal information.
          <br />
          <br />
          Thank you for choosing {company} on your journey to find the perfect
          puppy companion. Together, let's create lasting connections between
          responsible breeders and loving homes.
        </Text>
      </Box>
      <Footer currentPage="about-us" />
    </>
  );
};

export const Head = () => <Seo title="About Us" />;

export default AboutUsPage;
