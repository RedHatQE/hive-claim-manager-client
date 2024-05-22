import React, { useState, useEffect } from "react";
import ClusterPools from "./ClusterPools";
import ClusterCliams from "./ClusterClaims";
import DeleteAllClaims from "./DeleteAllClaims";
import httpClient from "./httpClient";
import Button from "@mui/material/Button";
import isUserAuthenticated from "./IsUserAuthenticated";

function App() {
  const [user, setUser] = useState({ error: "Unauthorized" });

  const logoutUser = async () => {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.href = "/login";
  };

  const getUser = async () => {
    console.log("Getting user");
    const user = await isUserAuthenticated();
    console.log(user);
    // setUser(user);
    return user;
  };

  // useEffect(() => {
  //   getUser();
  // }, []);

  return (
    <div>
      <h1 align="center">Hive claim manager</h1>
      {getUser().error === "Unauthorized" ? (
        (window.location.href = "/login")
      ) : (
        <div>
          <h3 align="center">Welcome {user.name}</h3>
          <ClusterPools />
          <ClusterCliams />
          <DeleteAllClaims />
          <br />
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={logoutUser}
          >
            {" "}
            Logout{" "}
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
