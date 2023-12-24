import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import Header from "../components/header";
import Footer from "../components/footer";
import Seo from "../components/seo";

const FAQPage = () => {
  return (
    <>
      <Header authorizedRole="all" bg="#F2F2F2" />
      <Heading my={8} textAlign="center">
        Frequently Asked Questions
      </Heading>
      <Box w="70%" margin="0 auto" pb={10}>
        <Heading size="md" mt={5} pb={2}>
          1. How does the platform work?
        </Heading>
        <Text>
          Our platform connects certified dog breeders with potential puppy
          buyers. Buyers can search for available puppies, contact breeders, and
          place a security deposit plus a non-refundable platform fee to reserve
          a puppy.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          2. What happens after I place a reservation?
        </Heading>
        <Text>
          After placing a reservation, you'll need to complete any additional
          forms provided by the breeder. Once the rehoming date arrives, you'll
          meet the breeder to finalize the transaction and pay them directly.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          3. What is the purpose of the security deposit?
        </Heading>
        <Text>
          The security deposit is a commitment to reserve the puppy. It helps
          ensure that both buyers and breeders are serious about the
          transaction. The deposit is refunded once the puppy is officially
          sold.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          4. Is the platform involved in the transaction?
        </Heading>
        <Text>
          No, we are not involved in the financial transaction between buyers
          and breeders. We act solely as a platform for connecting parties. The
          payment is made directly to the breeder.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          5. Do you guarantee the health or quality of the puppies?
        </Heading>
        <Text>
          We do not guarantee anything related to the puppies, health, or
          quality. It is the responsibility of the buyer to discuss all details
          directly with the breeder.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          6. What if I have issues with the breeder or the transaction?
        </Heading>
        <Text>
          We are not responsible for any issues arising from transactions or
          interactions between buyers and breeders. Please resolve any concerns
          directly with the breeder.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          7. Can I get a refund of the platform fee?
        </Heading>
        <Text>
          The platform fee is non-refundable. It covers the cost of maintaining
          and operating the platform to facilitate connections between breeders
          and buyers.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          8. How do I mark the puppy as sold on the platform?
        </Heading>
        <Text>
          Once the transaction is complete, the breeder can release the security
          deposit, and the puppy will be automatically marked as sold on our
          platform.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          9. Can I trust the breeders on this platform?
        </Heading>
        <Text>
          We work with certified dog breeders, but it's essential for buyers to
          conduct their own research and due diligence. Read reviews, ask
          questions, and ensure you are comfortable with the breeder before
          making any commitments.
        </Text>

        <Heading size="md" mt={5} pb={2}>
          10. I have more questions. How can I contact you?
        </Heading>
        <Text>
          For additional inquiries or support, you can reach out to our customer
          service team at support@pawtner.com.
        </Text>
      </Box>
      <Footer currentPage="faq" />
    </>
  );
};

export const Head = () => <Seo title="FAQ" />;

export default FAQPage;
