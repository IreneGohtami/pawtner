import axios from "axios";
import isEmpty from "lodash/isEmpty";
import corsHandler from "./cors";
import { getCookie, setAccessTokenCookie } from "../cookie-manager";

const getClient = async () => {
  const token = await getAccessToken();

  return axios.create({
    baseURL: `https://${process.env.GATSBY_AUTH0_DOMAIN}/api/v2/`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

const getAccessToken = async () => {
  const token = getCookie("access_token");
  if (token) {
    // FIX: currently cookie is always empty
    console.log(token, "cookie token\n\n");
    return token;
  }

  try {
    const { data } = await axios.post(
      `https://${process.env.GATSBY_AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.GATSBY_AUTH0_MANAGEMENT_CLIENT_ID,
        client_secret: process.env.GATSBY_AUTH0_MANAGEMENT_CLIENT_SECRET,
        audience: `https://${process.env.GATSBY_AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }
    );

    setAccessTokenCookie("access_token", data.access_token);
    return data.access_token;
  } catch (error) {
    //const { data } = error.response;
    //console.log(data, "getAccessToken error\n\n");
    throw error;
  }
};

export default async function handler(req, res) {
  await corsHandler(req, res);

  if (req.method === "GET") {
    const { action, userId } = req.query;
    switch (action) {
      case "get_user_role":
        try {
          const client = await getClient();
          const { data } = await client.get(`users/${userId}/roles`);
          res.status(200).json(data || {});
        } catch (error) {
          const { data } = error.response;
          res
            .status(data.statusCode || 500)
            .send(data.message || "Error fetching user role.");
        }
        break;
      case "get_user_metadata":
        try {
          const client = await getClient();
          const { data } = await client.get(`users/${userId}`);

          res.status(200).json(data || {});
        } catch (error) {
          const { data } = error.response;
          res
            .status(data.statusCode || 500)
            .send(data.message || "Error fetching user metadata.");
        }
        break;
      case "get_all_users":
        try {
          const client = await getClient();
          const usersResponse = await client.get("users");
          const users = usersResponse.data;

          // Fetch roles for each user
          const rolePromises = users.map(async (user) => {
            if (user.app_metadata && !isEmpty(user.app_metadata.roles)) {
              return user;
            }

            const userId = user.user_id;
            const rolesResponse = await client.get(`users/${userId}/roles`);

            user.app_metadata = user.app_metadata || {};
            user.app_metadata.roles = rolesResponse.data.reduce((acc, role) => {
              acc.push(role.name);
              return acc;
            }, []);
            return user;
          });
          await Promise.all(rolePromises);

          res.status(200).json(users || {});
        } catch (error) {
          const { data } = error.response;
          res
            .status(data.statusCode || 500)
            .send(data.message || "Error fetching all users.");
        }
        break;
    }
  } else if (req.method === "POST") {
    const { action, userId, role } = req.body;

    switch (action) {
      case "update_user_role":
        const roles = {
          buyer: "rol_KlqM6JGSilebnFU5",
          breeder: "rol_Rpz39wjWhJ6VFaWj",
        };
        const payload = { roles: [roles[role]] };

        try {
          const client = await getClient();
          await client.post(`users/${userId}/roles`, payload);
          res.status(200).send("User role updated successfully.");
        } catch (error) {
          const { data } = error.response;
          res
            .status(data.statusCode || 500)
            .send(data.message || "Error updating user role.");
        }
        break;
      case "update_user_metadata":
        try {
          const { connection, payload } = req.body;
          const { user_metadata } = payload;
          const { password } = user_metadata;

          // Removing root attributes from user_metadata
          user_metadata.password = null;
          user_metadata.retype_password = null;

          if (password) {
            payload.password = password;
            payload.connection = connection;
          }

          const client = await getClient();
          await client.patch(`users/${userId}`, payload);
          res.status(200).send("User metadata updated successfully.");
        } catch (error) {
          const { data } = error.response;
          res
            .status(data.statusCode || 500)
            .send(data.message || "Error updating user metadata.");
        }
        break;
    }
  } else {
    res.status(405).end();
  }
}
