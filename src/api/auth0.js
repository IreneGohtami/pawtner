import axios from "axios";
import corsHandler from "./cors";

const auth0Client = axios.create({
  baseURL: `https://${process.env.GATSBY_AUTH0_DOMAIN}/api/v2/`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GATSBY_AUTH0_MANAGEMENT_API_TOKEN}`,
  },
});

export default async function handler(req, res) {
  await corsHandler(req, res);

  if (req.method === "GET") {
    const { action, userId } = req.query;
    switch (action) {
      case "get_user_role":
        try {
          const { data } = await auth0Client.get(`users/${userId}/roles`);
          console.log(data, "-->get_user_role");
          res.status(200).send("User role fetched successfully.");
        } catch (error) {
          console.log(error);
          res.status(500).send("Error fetching user role.");
        }
        break;
      case "get_user_metadata":
        try {
          const { data } = await auth0Client.get(`users/${userId}`);
          //console.log(data, "-->get_user_metadata");
          res.status(200).json(data || {});
        } catch (error) {
          console.log(error);
          res.status(500).send("Error fetching user metadata.");
        }
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
          await auth0Client.post(`users/${userId}/roles`, payload);
          res.status(200).send("User role updated successfully.");
        } catch (error) {
          console.log(error);
          res.status(500).send("Error updating user role.");
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

          await auth0Client.patch(`users/${userId}`, payload);
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
