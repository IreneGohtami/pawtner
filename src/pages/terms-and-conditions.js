import React from "react";
import { Box, Heading, Text, UnorderedList } from "@chakra-ui/react";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const TermsAndConditionsPage = () => {
  const site = "Pawtner.ca";
  return (
    <>
      <Header authorizedRole="all" bg="#F2F2F2" />
      <Heading my={8} textAlign="center">
        Terms and Conditions for {site}
      </Heading>
      <Box w="70%" margin="0 auto" pb={10}>
        <Heading size="md" mt={5} pb={2}>
          1. Acceptance of Terms
        </Heading>
        <Text>
          By accessing and using {site}, you agree to comply with and be bound
          by these terms and conditions. If you do not agree with any part of
          these terms, please do not use our platform.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          2. Platform Purpose
        </Heading>
        <Text>
          {site} acts as a platform to connect certified dog breeders with
          potential buyers seeking to reserve a puppy. We facilitate
          communication and transactions between buyers and breeders but are not
          directly involved in the sale of puppies.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          3. User Responsibilities
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              Buyers and breeders are responsible for providing accurate
              information during registration and while using the platform.
            </li>
            <li>
              Users must adhere to ethical breeding practices and comply with
              relevant laws and regulations.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          4. Communication and Transactions
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              Users communicate with each other through our messaging system.
            </li>
            <li>
              Transactions, including security deposits and platform fees, are
              conducted directly between the buyer and the breeder. {site} is
              not responsible for any financial transactions.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          5. Security Deposits
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              Buyers may be required to place a security deposit, along with a
              non-refundable platform fee, to reserve a puppy.
            </li>
            <li>
              Security deposits are held until the rehoming date. Once the
              transaction is completed, the deposit is released to the buyer.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          6. External Forms
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              Users may be directed to external forms for additional
              information. {site} is not responsible for the content or data
              collected by these external forms.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          7. Data Storage
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              {site} stores user registration data and transaction-related
              information. We do not store external form data.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          8. Disclaimers and Limitation of Liability
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              {site} does not guarantee the health, quality, or availability of
              puppies listed on the platform.
            </li>
            <li>
              We are not responsible for any issues arising between users,
              including disputes, injuries, or any other incidents related to
              the transaction or puppy rehoming.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          9. Termination of Accounts
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              {site} reserves the right to terminate or suspend user accounts
              that violate these terms and conditions.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          10. Changes to Terms
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              {site} may modify these terms at any time. Users are encouraged to
              review the terms regularly.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          11. Governing Law
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              These terms and conditions are governed by the laws of Canada.
            </li>
          </UnorderedList>
        </Text>

        <Heading size="md" mt={5} pb={2}>
          12. Contact Information
        </Heading>
        <Text>
          <UnorderedList pl={5}>
            <li>
              For questions or concerns about these terms, please contact us at
              support@pawtner.com.
            </li>
          </UnorderedList>
        </Text>
      </Box>
      <Footer currentPage="terms-and-conditions" />
    </>
  );
};

export const Head = () => <Seo title="Terms & Conditions" />;

export default TermsAndConditionsPage;
