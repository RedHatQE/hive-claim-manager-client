import React, { useState, useEffect } from "react";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import FormControl from "@mui/material/FormControl";
import httpClient from "./httpClient";

function DeleteAllClaims() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const onClickHandler = async () => {
    setLoading(true);
    const res = await fetch(
      process.env.HIVE_CLAIM_MANAGER_SERVER_API_URL +
        "/all-user-claims-names?user=" +
        user.name,
    );
    const data = await res.json();
    setLoading(false);
    console.log(data);
    if (data.length === 0) {
      alert("No claims found for user: " + user.name);
    } else if (
      window.confirm(
        data.map((claim) => claim).join("\n") +
          "\n\nAre you sure you want to delete all claims for user " +
          user.name +
          "?",
      )
    ) {
      await httpClient.post(
        process.env.HIVE_CLAIM_MANAGER_SERVER_API_URL +
          "/delete-all-claims?user=" +
          user.name,
      );
      window.location.reload();
    }
  };

  const getUser = async () => {
    setLoading(true);
    const resp = await httpClient.get(
      process.env.HIVE_CLAIM_MANAGER_SERVER_API_URL + "/@me",
    );
    setUser(resp.data);
    setLoading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      {loading ? (
        <Box sx={{ display: "flex" }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <Stack direction="row" spacing={2}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onClickHandler}
              >
                {" "}
                Delete All Claims{" "}
              </Button>
            </Stack>
          </FormControl>
        </Box>
      )}
    </div>
  );
}

export default DeleteAllClaims;
