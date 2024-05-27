import React, { useEffect, useState } from "react";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";

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
    const dataMap = data.map((claim) => claim).join("\n");
    if (
      window.confirm(
        dataMap + "\n\nAre you sure you want to delete the following claims ?",
      )
    ) {
      await httpClient.post(
        process.env.REACT_APP_API_URL + "/delete-all-claims?user=" + user.name,
      );
      eventBus.dispatch("deleteAllDone", {
        message: dataMap,
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
            <Button color="danger" variant="plain" onClick={onClickHandler}>
              {"DELETE ALL " + userText.toUpperCase() + " CLAIMS"}
            </Button>
          </Stack>
        </FormControl>
      </Box>
    </div>
  );
}

export default DeleteAllClaims;
