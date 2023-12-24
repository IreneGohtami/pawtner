import React from "react";
import { Box, Heading, Text, UnorderedList } from "@chakra-ui/react";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const PrivacyPolicyPage = () => {
  const company = "Pawtner";
  return (
    <>
      <Header authorizedRole="all" bg="#F2F2F2" />
      <Heading my={8} textAlign="center">
        Privacy Policy for {company}
      </Heading>
      <Box w="70%" margin="0 auto" pb={10}>
        <Text>Effective Date: 01/01/2024</Text>
        <Text>
          Thank you for using {company} ("we," "our," or "us"). This Privacy
          Policy outlines our practices regarding the collection, use, and
          disclosure of information when you use our website [pawtner.ca] (the
          "Site").
        </Text>
        <Heading size="md" mt={5} pb={2}>
          1. Information We Collect
        </Heading>
        <Text>
          1.1 Information You Provide
          <UnorderedList pl={5}>
            <li>
              When you register on our platform, we collect the information you
              provide, including but not limited to your name, email address,
              and contact details.
            </li>
          </UnorderedList>
        </Text>
        <Text>
          1.2 Communication Data
          <UnorderedList pl={5}>
            <li>
              We may collect information when you communicate with breeders
              through our messaging system, including the content of your
              messages.
            </li>
          </UnorderedList>
        </Text>
        <Text>
          1.3 Transaction Information
          <UnorderedList pl={5}>
            <li>
              We collect transaction details when you place a security deposit
              and platform fee. This may include payment information,
              transaction amounts, and dates.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          2. Use of Information
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              We use the information collected for the purpose of facilitating
              the connection between buyers and certified dog breeders.
            </li>
            <li>
              Transaction information is used for processing payments and
              maintaining transaction records.
            </li>
            <li>
              We may use your contact information to send you important
              notifications related to your account or transactions.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          3. Information Sharing
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              We share necessary information with breeders to facilitate the
              puppy reservation process.
            </li>
            <li>
              External forms and links are provided for additional information
              collection. We do not store data from these forms.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          4. Security
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              We employ industry-standard security measures to protect your
              information; however, we cannot guarantee absolute security.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          5. External Links
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              Our platform may contain links to external websites. We are not
              responsible for the privacy practices or content of these sites.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          6. Data Retention
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              We retain your information as long as necessary for the purposes
              outlined in this Privacy Policy or as required by law.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          7. Your Choices
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              You can manage your account settings and communication preferences
              through the platform.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          8. Changes to this Privacy Policy
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              We may update this Privacy Policy periodically. We will notify you
              of significant changes.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          9. Contact Us
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              If you have questions or concerns regarding this Privacy Policy,
              please contact us at support@pawtner.com.
            </li>
          </UnorderedList>
        </Text>
      </Box>
      <Footer currentPage="privacy-policy" />
    </>
  );
};

export const Head = () => <Seo title="Privacy Policy" />;

export default PrivacyPolicyPage;
