import React, { useState, useEffect } from "react";
import ClusterPools from "./ClusterPoolsComp";
import ClusterCliams from "./ClusterClaimsComp";
import DeleteAllClaims from "./DeleteAllClaimsComp";
import httpClient from "./httpClient";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";

function App() {
  const [user, setUser] = useState(null);

  const logoutUser = async () => {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.href = "/";
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get(
          process.env.REACT_APP_API_URL + "/@me",
        );
        setUser(resp.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  return (
    <div>
      <h1 align="center">Hive claim manager</h1>
      {user != null ? (
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
