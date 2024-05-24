import React, { useEffect, useState } from "react";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";

import FormControl from "@mui/material/FormControl";
import httpClient from "./httpClient";
import isUserAuthenticated from "./UserAuthentication";
import eventBus from "./EventBus";

const user = await isUserAuthenticated();

function DeleteAllClaims() {
  const [userText, setUserText] = useState(user.name);

  const getUserText = async () => {
    if (user.admin) {
      setUserText("");
    }
  };

  const onClickHandler = async () => {
    const res = await fetch(
      process.env.REACT_APP_API_URL +
        "/all-user-claims-names?user=" +
        user.name,
    );
    const data = await res.json();
    if (data.length === 0) {
      alert("No claims found for user: " + userText);
      return;
    }
    if (
      window.confirm(
        data.map((claim) => claim).join("\n") +
          "\n\nAre you sure you want to delete the following claims ?",
      )
    ) {
      await httpClient.post(
        process.env.REACT_APP_API_URL + "/delete-all-claims?user=" + user.name,
      );
      eventBus.dispatch("deletedClaims", {
        message: data.map((claim) => claim),
      });
    }
  };

  useEffect(() => {
    getUserText();
  }, []);

  return (
    <div>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <Stack direction="row" spacing={2}>
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onClickHandler}
            >
              {" "}
              {"Delete All " + userText + " Claims"}{" "}
            </Button>
          </Stack>
        </FormControl>
      </Box>
    </div>
  );
}

export default DeleteAllClaims;
