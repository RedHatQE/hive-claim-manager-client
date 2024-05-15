import React, { useState, useEffect } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import SendIcon from "@mui/icons-material/Send";
import httpClient from "./httpClient";

function ClusterPools() {
  const [clusterPools, setClusterPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const onClickHandler = async (pool) => {
    setLoading(true);
    await httpClient.post(
      process.env.REACT_APP_API_URL +
        "/claim-cluster?name=" +
        pool.name +
        "&user=" +
        user.name,
    );
    setLoading(false);
    window.location.reload();
  };
  const getUser = async () => {
    setLoading(true);
    const resp = await httpClient.get(process.env.REACT_APP_API_URL + "/@me");
    setUser(resp.data);
    setLoading(false);
  };

  const getClusterPools = async () => {
    setLoading(true);
    const res = await fetch(process.env.REACT_APP_API_URL + "/cluster-pools");
    const data = await res.json();
    setClusterPools(data);
    setLoading(false);
  };

  useEffect(() => {
    getClusterPools();
    getUser();
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
                          endIcon={<SendIcon />}
                          onClick={onClickHandler.bind(this, pool)}
                        >
                          Claim
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
