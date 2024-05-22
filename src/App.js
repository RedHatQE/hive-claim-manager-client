import React, { useState, useEffect } from "react";
import ClusterPools from "./ClusterPools";
import ClusterCliams from "./ClusterClaims";
import DeleteAllClaims from "./DeleteAllClaims";
import httpClient from "./httpClient";
import Button from "@mui/material/Button";
import isUserAuthenticated from "./IsUserAuthenticated";

class AppWrapper extends React.Component {
  constructor() {
    super();
    this.user = isUserAuthenticated();
  }

  async logoutUser() {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.href = "/login";
  }

  render() {
    return (
      <div>
        <h1 align="center">Hive claim manager</h1>
        {this.user.error === "Unauthorized" ? (
          (window.location.href = "/login")
        ) : (
          <div>
            <h3 align="center">Welcome {this.user.name}</h3>
            <ClusterPools />
            <ClusterCliams />
            <DeleteAllClaims />
            <br />
            <Button
              color="error"
              variant="contained"
              size="small"
              onClick={this.logoutUser}
            >
              {" "}
              Logout{" "}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default function App() {
  return <AppWrapper />;
}
