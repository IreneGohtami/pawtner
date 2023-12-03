import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";

import {
  EyeOutlined,
  CloseOutlined,
  MoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
  AbsoluteCenter,
  Box,
  ChakraProvider,
  Divider,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Spacer,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useBreakpointValue } from "@chakra-ui/media-query";

import theme from "../../theme";
import Seo from "../../components/seo";
import CustomSpinner from "../../components/spinner";
import DoubleTickIcon from "../../images/icons/double-tick.inline.svg";
import SendIcon from "../../images/icons/send.inline.svg";
import {
  msgInput,
  profileImg,
  readText,
  unreadText,
  unreadMsgCount,
} from "./chat.module.css";

const ChatPage = ({ breederId, breederInfo }) => {
  const { isAuthenticated, user } = useAuth0();
  const containerRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [messageToSend, setMessageToSend] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFrom, setMessageFrom] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [displaySenderProfile, setDisplaySenderProfile] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isIndividualMessageVisible, setIsIndividualMessageVisible] =
    useState("none");
  const [isChatListVisible, setIsChatListVisible] = useState("flex");

  useEffect(() => {
    if (isMobile) {
      setIsIndividualMessageVisible("none");
      setIsChatListVisible("flex");
    } else {
      setIsIndividualMessageVisible("flex");
      setIsChatListVisible("flex");
    }
  }, [isMobile]);

  useEffect(() => {
    fetchConversation();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!selectedMessage) {
      return;
    }

    const messageFromIdx = selectedMessage.participants.user_ids.findIndex(
      (_userId) => _userId !== userId
    );
    setMessageFrom(selectedMessage.participants.user_details[messageFromIdx]);

    // Update message read status
    let shouldUpdate = false;
    const messagesObj = {
      messages: selectedMessage.messages.map((message) => {
        if (message.sender_id !== userId) {
          if (!message.read) {
            shouldUpdate = true;
          }
          return { ...message, read: true };
        }
        return message;
      }),
    };
    if (shouldUpdate) {
      updateReadStatus(messagesObj);
    }

    // Update messageList state
    const messageListIdx = messageList.findIndex(
      (_message) => _message.id === selectedMessage.id
    );
    messageList[messageListIdx] = {
      ...messageList[messageListIdx],
      ...messagesObj,
    };
    setMessageList(messageList);
  }, [selectedMessage]);

  useEffect(() => {
    // Scroll to bottom / last message
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [containerRef.current, messageToSend]);

  const fetchConversation = async (selectedMessage = null) => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      const _userId = user.sub.split("|")[1];
      setUserId(_userId);
      try {
        // Filter query based on participants user_id
        const q = query(
          collection(db, "chat_history"),
          where("participants.user_ids", "array-contains-any", [_userId])
        );
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });

        setMessageList(data);

        if (breederId && breederInfo) {
          const messageIdx = data.findIndex(
            (_message) =>
              _message.participants.user_ids.includes(breederId) &&
              _message.participants.user_ids.includes(_userId)
          );
          if (messageIdx !== -1) {
            setSelectedMessage(selectedMessage || data[messageIdx]);
          } else {
            // Start a new chat
            await startNewChat(_userId);
          }
        } else {
          setSelectedMessage(selectedMessage || (data.length ? data[0] : null));
        }
      } catch (error) {
        console.log(error, "error fetching conversation");
      }
      setIsLoading(false);
    }
  };

  const updateReadStatus = async (messagesObj) => {
    const docRef = doc(db, "chat_history", selectedMessage.id);
    await updateDoc(docRef, messagesObj).then();
  };

  const sendMessage = async () => {
    const messagesObj = {
      messages: [
        ...selectedMessage.messages,
        {
          sender_id: userId,
          text: messageToSend,
          timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
          read: false,
        },
      ],
    };
    setSelectedMessage({ ...selectedMessage, ...messagesObj });

    // Update messageList state
    const messageListIdx = messageList.findIndex(
      (_message) => _message.id === selectedMessage.id
    );
    messageList[messageListIdx] = {
      ...messageList[messageListIdx],
      ...messagesObj,
    };
    setMessageList(messageList);
    setMessageToSend("");

    // Update messages in DB
    const docRef = doc(db, "chat_history", selectedMessage.id);
    await updateDoc(docRef, messagesObj);
  };

  const startNewChat = async (_userId) => {
    const payload = {
      participants: {
        user_ids: [_userId, breederId],
        user_details: [
          {
            name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
            avatar: user.user_metadata.profile_picture,
            phone_number: user.user_metadata.phone_number,
          },
          {
            name: `${breederInfo.first_name} ${breederInfo.last_name}`,
            avatar: breederInfo.profile_picture,
            phone_number: breederInfo.phone,
          },
        ],
      },
      messages: [],
    };

    try {
      const docRef = await addDoc(collection(db, "chat_history"), payload);

      setMessageList([...messageList, { id: docRef.id, ...payload }]);
      setSelectedMessage({
        id: docRef.id,
        ...payload,
      });
    } catch (error) {
      console.log(error, "error starting new chat");
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <ModalContent>
        <ModalHeader bg="gray.200" h={45} w="100%" position="fixed" zIndex={2}>
          {isMobile && isIndividualMessageVisible !== "none" && (
            <IconButton
              icon={<ArrowBackIcon />}
              fontSize="22px"
              mt="-20px"
              colorScheme="transparent"
              color="inherit"
              onClick={() => {
                setIsIndividualMessageVisible("none");
                setIsChatListVisible("flex");
              }}
            />
          )}
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody p={0} mt="45px">
          <Flex
            w="100%"
            h="100vh"
            bg="white"
            fontFamily="Poppins !important"
            direction={{ base: "column", md: "row" }}
          >
            <VStack
              borderRight="1px solid #E2E8F0"
              gap={0}
              pt={3}
              w="383px"
              h="100vh"
              position="fixed"
              bg="white"
              display={isChatListVisible}
            >
              <Text
                fontSize={20}
                fontWeight={500}
                py={1}
                pl={5}
                alignSelf="normal"
              >
                Messages
              </Text>
              {isLoading ? (
                <CustomSpinner />
              ) : (
                messageList.map((message) => {
                  const { messages, participants } = message;
                  const messageFromIdx = participants.user_ids.findIndex(
                    (_userId) => _userId !== userId
                  );
                  const _messageFrom =
                    participants.user_details[messageFromIdx];

                  const lastMessage = messages.length
                    ? messages[messages.length - 1]
                    : null;
                  const unreadMessageCount = messages.filter(
                    (_message) =>
                      !_message.read && _message.sender_id !== userId
                  ).length;
                  const lastMessageDate = lastMessage
                    ? moment(lastMessage.timestamp).format("YYYY-MM-DD")
                    : null;
                  const todayDate = moment().format("YYYY-MM-DD");
                  const dateDisplay = !lastMessage
                    ? ""
                    : lastMessageDate ===
                      moment().subtract(1, "days").format("YYYY-MM-DD")
                    ? "Yesterday"
                    : todayDate !== lastMessageDate
                    ? moment(lastMessage.timestamp).format("MMM DD")
                    : moment(lastMessage.timestamp).format("HH:mm");

                  return (
                    <Box
                      key={message.id}
                      h="100px"
                      pl="20px"
                      mr="-2px"
                      borderBottom="1px solid #E2E8F0"
                      cursor="pointer"
                      bg={
                        message.id === selectedMessage.id ? "#f2f1f4" : "white"
                      }
                      onClick={() => {
                        setSelectedMessage(message);
                        setDisplaySenderProfile(false);
                        setIsIndividualMessageVisible("flex");
                        if (isMobile) {
                          setIsChatListVisible("none");
                        }
                      }}
                    >
                      <Flex h="100px" alignItems="center">
                        <Image
                          src={_messageFrom.avatar || "/default-user-img.png"}
                          border={
                            _messageFrom.avatar ? "none" : "1px solid #ccc"
                          }
                          p={_messageFrom.avatar ? 0 : "3px"}
                          className={profileImg}
                        />
                        <VStack alignItems="normal" p={3} w="100%">
                          <HStack>
                            <Text fontSize={18} fontWeight={500}>
                              {_messageFrom.name}
                            </Text>
                            {unreadMessageCount && (
                              <>
                                <Spacer />
                                <Text className={unreadMsgCount}>
                                  {unreadMessageCount}
                                </Text>
                              </>
                            )}
                          </HStack>
                          <HStack w="280px" gap={0}>
                            {lastMessage ? (
                              <>
                                <Text
                                  className={
                                    lastMessage.read ? readText : unreadText
                                  }
                                >
                                  {lastMessage.read && (
                                    <Icon as={DoubleTickIcon} />
                                  )}{" "}
                                  {lastMessage.text}
                                </Text>
                                <Text
                                  fontSize={14}
                                  opacity={0.6}
                                  w="100%"
                                  textAlign="right"
                                >
                                  {dateDisplay}
                                </Text>
                              </>
                            ) : (
                              <Text
                                fontSize={14}
                                opacity={0.6}
                                w="100%"
                                textAlign="right"
                              >
                                No messages yet
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                      </Flex>
                    </Box>
                  );
                })
              )}
            </VStack>

            <VStack
              flex="1"
              alignItems="normal"
              w="100%"
              ml={isMobile ? 0 : "383px"}
              display={isIndividualMessageVisible}
            >
              <HStack
                pl={10}
                py={4}
                borderBottom="1px solid #E2E8F0"
                position="fixed !important"
                w="100%"
                bg="white"
                zIndex={1}
              >
                <Image
                  src={messageFrom.avatar || "/default-user-img.png"}
                  border={messageFrom.avatar ? "none" : "1px solid #ccc"}
                  p={messageFrom.avatar ? 0 : "3px"}
                  className={profileImg}
                />
                <Text fontSize={20} fontWeight={500} pl={1} alignSelf="normal">
                  {messageFrom.name}
                </Text>
                <Spacer />
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<MoreOutlined />}
                    variant="ghost"
                    fontSize={24}
                    mr={8}
                    pos="fixed"
                    right={0}
                  />
                  <MenuList>
                    <MenuItem
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setDisplaySenderProfile(true);
                        if (isMobile) {
                          setIsIndividualMessageVisible("none");
                        }
                      }}
                    >
                      View Contact
                    </MenuItem>
                    <MenuItem
                      icon={<ReloadOutlined />}
                      onClick={() => fetchConversation(selectedMessage)}
                    >
                      Refresh
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
              <VStack
                w="100%"
                h="100vh"
                bg="#f2f1f4"
                mt="88px"
                p={5}
                overflowY="scroll"
              >
                {selectedMessage && (
                  <>
                    {selectedMessage.messages.map((message, idx) => {
                      const isSender = message.sender_id === userId;
                      const isToday = moment(message.timestamp).isSame(
                        moment(),
                        "day"
                      );
                      const isLastWeek = moment(message.timestamp).isBefore(
                        moment().subtract(7, "days")
                      );
                      let dateDisplay = isLastWeek
                        ? moment(message.timestamp).format("DD/MM/YYYY")
                        : isToday
                        ? "Today"
                        : moment(message.timestamp).format("dddd");
                      const lastMessageIdx =
                        selectedMessage.messages.length - 1;

                      return (
                        <>
                          <VStack
                            key={message.id}
                            w="100%"
                            pl={isSender ? 0 : "auto"}
                            pr={isSender ? "auto" : 0}
                            alignItems={isSender ? "end" : "start"}
                          >
                            <Box position="relative" padding="10px" w="100%">
                              <Divider borderColor="#d3dbde" />
                              <AbsoluteCenter px="4" bg="#f2f1f4" color="gray">
                                {dateDisplay}
                              </AbsoluteCenter>
                            </Box>

                            <Box
                              w="auto"
                              p={3}
                              borderRadius={
                                isSender
                                  ? "16px 16px 0 16px"
                                  : "16px 16px 16px 0px"
                              }
                              bg={isSender ? "#FBBC05" : "white"}
                            >
                              <Text
                                ref={
                                  idx === lastMessageIdx ? containerRef : null
                                }
                                fontSize={16}
                                color={isSender ? "white" : "#180A29"}
                              >
                                {message.text}
                              </Text>
                            </Box>
                          </VStack>
                          <Text
                            fontSize={12}
                            opacity={0.6}
                            mt="-3px"
                            alignSelf={isSender ? "end" : "start"}
                          >
                            {moment(message.timestamp).format("HH:mm")}
                          </Text>
                        </>
                      );
                    })}
                  </>
                )}
              </VStack>
              <HStack h={63} mt="-8px" bg="white">
                <InputGroup mt="-8px" marginRight={15}>
                  <Input
                    placeholder="Write a message ..."
                    className={msgInput}
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <InputRightElement
                    children={
                      <Icon
                        as={SendIcon}
                        cursor="pointer"
                        onClick={sendMessage}
                      />
                    }
                  />
                </InputGroup>
              </HStack>
            </VStack>

            {displaySenderProfile && (
              <VStack
                w="300px"
                h="100vh"
                bg="white"
                p={4}
                borderLeft="1px solid #E2E8F0"
              >
                <Icon
                  as={CloseOutlined}
                  style={{
                    fontSize: 18,
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                  onClick={() => {
                    setDisplaySenderProfile(false);
                    if (isMobile) {
                      setIsIndividualMessageVisible("flex");
                    }
                  }}
                />
                <Image
                  src={messageFrom.avatar || "/default-user-img.png"}
                  border={messageFrom.avatar ? "none" : "1px solid #ccc"}
                  p={messageFrom.avatar ? 0 : "3px"}
                  className={profileImg}
                  h="140px !important"
                  w="140px !important"
                />
                <Text fontSize={24} fontWeight={500}>
                  {messageFrom.name}
                </Text>
                <Text fontSize={18} opacity={0.6}>
                  {messageFrom.phone_number}
                </Text>
                <br />
                <Divider />
                <br />
              </VStack>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </ChakraProvider>
  );
};

export const Head = () => <Seo title="Chat" />;

export default withAuthenticationRequired(ChatPage);
