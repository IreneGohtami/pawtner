import moment from "moment";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import CustomSpinner from "../../../components/spinner";
import { tableRow } from "./breeder-profile.module.css";

const ListPaymentTable = ({ userId, db, setErrorAlert }) => {
  const [paymentList, setPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function listPayment() {
      setIsLoading(true);
      try {
        // Create a query that filters the "puppy" collection by "owner_id"
        const q = query(
          collection(db, "payment"),
          where("user_id", "==", userId),
          orderBy("created", "desc")
        );
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setPaymentList(data);
      } catch (e) {
        setErrorAlert("Failed to fetch payment. Please reload the page.");
      }
      setIsLoading(false);
    }
    listPayment();
  }, []);

  return isLoading ? (
    <CustomSpinner />
  ) : (
    <TableContainer bg="white" borderRadius={20} p="25px">
      <Table size="md" variant="simple">
        {!paymentList.length && (
          <TableCaption>You don't have any transactions yet.</TableCaption>
        )}
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Description</Th>
            <Th isNumeric>Amount</Th>
            <Th>Payment Status</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody className={tableRow}>
          {paymentList.map((payment) => (
            <Tr key={payment.id}>
              <Td>{payment.type}</Td>
              <Td>
                payment for{" "}
                <Link
                  color="blue"
                  href={`/puppy/${payment.animal_id}`}
                  isExternal
                >
                  {payment.animal_id}
                </Link>
              </Td>
              <Td isNumeric>
                {payment.currency.toUpperCase() +
                  " " +
                  payment.amount.toLocaleString()}
              </Td>
              <Td>{payment.payment_status}</Td>
              <Td>
                {moment.unix(payment.created).format("YYYY-MM-DD HH:mm:ss")}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default ListPaymentTable;
