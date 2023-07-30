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

  // Handle the update-user-role logic
  if (req.method === "POST") {
    const { userId, role } = req.body;

    const roles = {
      buyer: "rol_KlqM6JGSilebnFU5",
      breeder: "rol_Rpz39wjWhJ6VFaWj",
    };
    const payload = { roles: [roles[role]] };

    try {
      await auth0Client.post(`users/${userId}/roles`, payload);
      res.status(200).send("User role updated successfully.");
    } catch (error) {
      res.status(500).send("Error updating user role.");
    }
  } else {
    res.status(405).end();
  }
}
