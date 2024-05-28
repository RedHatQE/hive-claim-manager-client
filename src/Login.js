import React, { useState } from "react";
import httpClient from "./httpClient";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import Button from "@mui/material/Button";

const Login = () => {
  const [name, setUser] = useState("");
  const [password, setPassword] = useState("");

  const onFormSubmit = (e) => {
    e.preventDefault();
    logInUser();
  };

  const logInUser = async () => {
    try {
      await httpClient.post(process.env.REACT_APP_API_URL + "/login", {
        name,
        password,
      });
      window.location.replace("/");
    } catch (error) {
      if (error.response.status === 401) {
        alert("Invalid credentials");
      }
    }
  };

  return (
    <div>
      <h1 align="center">Log Into Your Account</h1>
      <Box
        component="form"
        sx={{
          "& .MuiTextField-root": { m: 1, width: "20ch" },
          "& .MuiButton-root": {
            m: 1,
            width: "12ch",
            height: "7ch",
          },
        }}
        noValidate
        autoComplete="off"
        display="flex"
        justifyContent="center"
        alignItems="top"
        minHeight="100vh"
      >
        <div>
          <TextField
            id="name"
            label="Username"
            defaultValue=""
            variant="filled"
            color="success"
            focused
            onChange={(e) => setUser(e.target.value)}
          />

          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            variant="filled"
            color="success"
            focused
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onFormSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            variant="outlined"
            style={{ fontWeight: "bold" }}
            endIcon={<SendIcon />}
            color="success"
            focused
            onClick={onFormSubmit}
          >
            {" "}
            Login{" "}
          </Button>
        </div>
      </Box>
    </div>
  );
};

export default Login;
