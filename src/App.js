import React, { useState, useEffect } from "react";
import ClusterPools from "./ClusterPools";
import ClusterCliams from "./ClusterClaims";
import DeleteAllClaims from "./DeleteAllClaims";
import httpClient from "./httpClient";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import isUserAuthenticated from "./IsUserAuthenticated";

function App() {
  const [user, setUser] = useState({ error: "Unauthorized" });

  const logoutUser = async () => {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.href = "/";
  };

  const getUser = async () => {
    const user = await isUserAuthenticated();
    setUser(user);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      <h1 align="center">Hive claim manager</h1>
      {user.error !== "Unauthorized" ? (
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
      ) : (
        <div>
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "20ch" },
            }}
            noValidate
            autoComplete="off"
            display="flex"
            justifyContent="center"
            alignItems="top"
            minHeight="100vh"
          >
            <div>
              <Button variant="contained" endIcon={<SendIcon />} href="/login">
                {" "}
                Login{" "}
              </Button>
            </div>
          </Box>
        </div>
      )}
    </div>
  );
}

export default App;
