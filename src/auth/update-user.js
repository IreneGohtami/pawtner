import axios from "axios";

export const updateUserRole = async (userId, role) => {
  const roles = {
    buyer: "rol_KlqM6JGSilebnFU5",
    breeder: "rol_Rpz39wjWhJ6VFaWj",
  };

  const options = {
    method: "POST",
    url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}/roles`,
    headers: {
      authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
      "cache-control": "no-cache",
      "content-type": "application/json",
    },
    data: { roles: [roles[role]] },
  };

  try {
    const data = await axios.request(options);
    console.log(data, "data");
  } catch (error) {
    console.log(error);
  }
};
