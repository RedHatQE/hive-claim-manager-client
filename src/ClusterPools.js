import React, { useState, useEffect } from "react";

import Button from "@mui/joy/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import httpClient from "./httpClient";
import isUserAuthenticated from "./UserAuthentication";
import consoleLog from "./ConsoleLog";
import eventBus from "./EventBus";

function ClusterPools() {
  const [clusterPools, setClusterPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [claimStatus, setClaimStatus] = useState("CLAIM");

  const onClickHandler = async (pool) => {
    if (claimStatus === "CLAIMING") {
      alert("Cluster claiming in progress");
      return;
    }
    setClaimStatus("CLAIMING");
    await httpClient.post(
      process.env.REACT_APP_API_URL +
        "/claim-cluster?name=" +
        pool.name +
        "&user=" +
        user.name,
    );
    setClaimStatus("CLAIM");
    eventBus.dispatch("claimDone", {
      message: pool.name,
    });
  };
  const getUser = async () => {
    const user = await isUserAuthenticated();
    setUser(user);
  };

  const getClusterPools = async (loading) => {
    try {
      if (loading) {
        setLoading(true);
      }
      consoleLog("fetching cluster pools");

      const res = await fetch(process.env.REACT_APP_API_URL + "/cluster-pools");
      const data = await res.json();
      setClusterPools(data);
      if (loading) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      if (loading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getClusterPools(true);
    getUser();
    const interval = setInterval(() => {
      getClusterPools();
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section">
      <h3>Cluster Pools</h3>
      <div>
        {loading ? (
          <Box sx={{ display: "flex" }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 350 }}
                size="small"
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Size</TableCell>
                    <TableCell align="center">Claimed</TableCell>
                    <TableCell align="center">Available</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clusterPools.map((pool) => (
                    <TableRow
                      key={pool.name}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {pool.name}
                      </TableCell>
                      <TableCell align="center">{pool.size}</TableCell>
                      <TableCell align="center">{pool.claimed}</TableCell>
                      <TableCell align="center">{pool.available}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="plain"
                          loading={claimStatus === "CLAIMING"}
                          onClick={onClickHandler.bind(this, pool)}
                        >
                          {claimStatus}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>
    </section>
  );
}

export default ClusterPools;
