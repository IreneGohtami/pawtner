import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";

const Toast = ({ description, status, setAlert }) => {
  const toast = useToast();

  useEffect(() => {
    if (description) {
      toast({
        description,
        status,
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      setAlert(null);
    }
  }, [description, status, toast, setAlert]);

  return null;
};

export default Toast;
