import { isEmpty } from "lodash";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import CustomSpinner from "../../../components/spinner";
import { tableRow, actionIcon } from "./breeder-profile.module.css";

const ListPuppyTable = ({
  userId,
  db,
  storage,
  refreshTable,
  openModal,
  setModalAction,
  setModalData,
  setSuccessAlert,
  setErrorAlert,
}) => {
  const theme = useTheme();
  const [puppyList, setPuppyList] = useState([]);
  const [deletePuppy, setDeletePuppy] = useState({
    id: null,
    name: "",
    breed: "",
    picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function listPuppy() {
      setIsLoading(true);
      try {
        // Create a query that filters the "puppy" collection by "owner_id"
        const q = query(
          collection(db, "puppy"),
          where("owner_id", "==", userId),
          orderBy("created_at", "asc")
        );
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        setPuppyList(data);
      } catch (e) {
        setErrorAlert("Failed to fetch puppy list. Please try again.");
        console.log(e, "Failed to fetch puppy list");
      }
      setIsLoading(false);
    }
    listPuppy();
  }, [refreshTable]);

  const handleDeletePuppy = async () => {
    setIsDeleting(true);
    try {
      // Delete puppy record from database
      await deleteDoc(doc(db, "puppy", deletePuppy.id));

      // Delete puppy picture from storage
      if (!isEmpty(deletePuppy.picture)) {
        const imageRef = ref(
          storage,
          `users/${userId.split("|")[1]}/puppies/${
            deletePuppy.picture.reference
          }.png`
        );
        await deleteObject(imageRef);
      }

      setSuccessAlert("Puppy deleted successfully!");
      onClose();
    } catch (e) {
      setErrorAlert("Failed to delete puppy. Please try again.");
      console.log(e, "Failed to delete puppy");
    }
    setIsDeleting(false);
  };

  return isLoading ? (
    <CustomSpinner />
  ) : (
    <TableContainer>
      <Table size="md" variant="simple">
        {!puppyList.length && (
          <TableCaption>You don't have any puppies yet!</TableCaption>
        )}
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Breed</Th>
            <Th>Photo</Th>
            <Th>Gender</Th>
            <Th>Color</Th>
            <Th isNumeric>Price</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody className={tableRow}>
          {puppyList.map((puppy) => (
            <Tr key={puppy.id}>
              <Td>{puppy.name}</Td>
              <Td>
                {puppy.breed.charAt(0).toUpperCase() + puppy.breed.slice(1)}
              </Td>
              <Td>
                {!isEmpty(puppy.picture) ? (
                  <Image
                    src={puppy.picture.url}
                    alt="puppy picture"
                    w="40px"
                    h="40px"
                  />
                ) : (
                  <PictureOutlined style={{ fontSize: "20px" }} />
                )}
              </Td>
              <Td>{puppy.gender}</Td>
              <Td>{puppy.color}</Td>
              <Td isNumeric>{puppy.price.toLocaleString()}</Td>
              <Td>
                <EyeOutlined
                  className={actionIcon}
                  style={{ marginRight: "15px" }}
                  onClick={() => {
                    setModalAction("view");
                    setModalData(puppy);
                    openModal();
                  }}
                />
                <EditOutlined
                  className={actionIcon}
                  style={{ marginRight: "15px" }}
                  onClick={() => {
                    setModalAction("edit");
                    setModalData(puppy);
                    openModal();
                  }}
                />
                <DeleteOutlined
                  className={actionIcon}
                  onClick={() => {
                    setDeletePuppy(puppy);
                    onOpen();
                  }}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure you want to delete this puppy?</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            Name: {deletePuppy.name} <br />
            Breed:{" "}
            {deletePuppy.breed.charAt(0).toUpperCase() +
              deletePuppy.breed.slice(1)}{" "}
            <br />
          </ModalBody>
          <ModalFooter>
            <Button
              bg={theme.colors.primary}
              colorScheme="yellow"
              mr={3}
              onClick={handleDeletePuppy}
              isLoading={isDeleting}
            >
              Delete
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TableContainer>
  );
};

export default ListPuppyTable;
