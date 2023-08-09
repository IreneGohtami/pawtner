import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { authConfig } from "./auth-config";

const AuthProvider = ({ children }) => (
  <Auth0Provider
    domain={authConfig.domain}
    clientId={authConfig.clientId}
    redirectUri={window.location.origin}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    {children}
  </Auth0Provider>
);

export default AuthProvider;
