import React, { useEffect, useState } from "react";
import httpClient from "./httpClient";
import { Input, Button, Box, Alert, Typography, Grid } from "@mui/joy";
import { LoginRounded } from "@mui/icons-material";

import ReportIcon from "@mui/icons-material/Report";

const Login = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [userErrorState, setUserErrorState] = useState(true);
  const [passwordErrorState, setPasswordErrorState] = useState(true);
  const [loginError, setLoginError] = useState("");

  const buttonSx = () => {
    return {
      m: 1,
      width: "20ch",
      height: "5ch",
      "--Input-radius": "0px",
      borderBottom: "2px solid",
      borderColor: "neutral.outlinedBorder",
      "&:hover": {
        borderColor: "neutral.outlinedHoverBorder",
      },
      "&::before": {
        border: "1px solid var(--Input-focusedHighlight)",
        transform: "scaleX(0)",
        left: 0,
        right: 0,
        bottom: "-2px",
        top: "unset",
        transition: "transform .15s cubic-bezier(0.1,0.9,0.2,1)",
        borderRadius: 0,
      },
      "&:focus-within::before": {
        transform: "scaleX(1)",
      },
    };
  };

  const onUserKeyUp = (e) => {
    if (e.keyCode === 8) {
      setUser(e.target.value);
    }
  };

  const onPasswordKeyUp = (e) => {
    if (e.keyCode === 8) {
      setPassword(e.target.value);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    logInUser();
  };

  const logInUser = async () => {
    try {
      await httpClient.post(process.env.REACT_APP_API_URL + "/login", {
        name: user,
        password,
      });
      window.location.replace("/");
    } catch (error) {
      if (error.response.status === 401) {
        setLoginError("Invalid credentials");
        // alert("Invalid credentials");
      }
    }
  };

  useEffect(() => {
    if (user !== "") {
      setUserErrorState(false);
    } else {
      setUserErrorState(true);
    }
    if (password !== "") {
      setPasswordErrorState(false);
    } else {
      setPasswordErrorState(true);
    }
  }, [user, password]);

  return (
    <>
      <h1 align="center">Log Into Your Account</h1>
      <Grid container justifyContent="center" alignItems="center">
        <form onSubmit={onFormSubmit}>
          <Box
            sx={{
              "& .MuiTextField-root": { m: 1, width: "20ch" },
              "& .MuiButton-root": {
                m: 1,
                width: "12ch",
                height: "5ch",
              },
            }}
            autoComplete="off"
            display="flex"
            justifyContent="center"
            alignItems="top"
          >
            <Input
              sx={buttonSx}
              error={userErrorState}
              placeholder="Username"
              required
              autoFocus
              color="primary"
              variant="soft"
              onChange={(e) => setUser(e.target.value)}
              onKeyUp={onUserKeyUp}
            />
            <Input
              sx={buttonSx}
              error={passwordErrorState}
              placeholder="Password"
              type="password"
              required
              color="primary"
              variant="soft"
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPasswordKeyUp}
            />
            <Button type="submit" endDecorator={<LoginRounded />}>
              Login
            </Button>
          </Box>
          {loginError ? (
            <Alert
              sx={{
                width: "28ch",
                height: "3ch",
                m: 1,
                ml: 17,
              }}
              startDecorator=<ReportIcon />
              variant="soft"
              color="danger"
            >
              <div>
                <Typography level="body-sm" color="danger">
                  Login failed: Invalid credentials.
                </Typography>
              </div>
            </Alert>
          ) : null}
        </form>
      </Grid>
    </>
  );
};

export default Login;
