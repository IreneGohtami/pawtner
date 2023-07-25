import React from "react";
import AuthProvider from "./src/auth/auth-provider";

export const wrapRootElement = ({ element }) => {
  return <AuthProvider>{element}</AuthProvider>;
};
