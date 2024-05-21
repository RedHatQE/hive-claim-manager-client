import React, { useState, useEffect } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import httpClient from "./httpClient";
import isUserAuthenticated from "./IsUserAuthenticated";

function Row(props) {
  const { row: claim } = props;
  const { user } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        key={claim.name}
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {claim.name}
        </TableCell>
        <TableCell align="center">{claim.pool}</TableCell>
        <TableCell align="center">{claim.namespace}</TableCell>

        <TableCell align="center">
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (claim.name.includes(user.name)) {
                httpClient.post(
                  process.env.REACT_APP_API_URL +
                    "/delete-claim?name=" +
                    claim.name +
                    "&user=" +
                    user.name,
                );
                window.location.reload();
              } else {
                alert("You can only delete your own claims");
              }
            }}
          >
            {" "}
            Delete{" "}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
              ></Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claim.info.map((info) => (
                    <TableRow key={info.name}>
                      <TableCell>
                        <a
                          href={info.console}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Console
                        </a>
                      </TableCell>
                      <TableCell align="center">
                        <p>
                          {info.creds.split(":")[0]} <br />
                          {info.creds.split(":")[1]}
                        </p>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          endIcon={<DownloadIcon />}
                          href={info.kubeconfig}
                        >
                          Kubeconfig
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  row: PropTypes.shape({
    name: PropTypes.string.isRequired,
    pool: PropTypes.string.isRequired,
    namespace: PropTypes.string.isRequired,
    info: PropTypes.arrayOf(
      PropTypes.shape({
        console: PropTypes.string.isRequired,
        creds: PropTypes.string.isRequired,
        kubeconfig: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

function ClusterClaims() {
  const [user, setUser] = useState(null);
  const [clusterClaims, setClusterClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUser = async () => {
    const user = await isUserAuthenticated();
    setUser(user);
  };

  const getClusterClaims = async () => {
    setLoading(true);
    await fetch(process.env.REACT_APP_API_URL + "/cluster-claims")
      .then((res) => res.json())
      .then((res) => setClusterClaims(res))
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    getUser();
    getClusterClaims();
  }, []);

  return (
    <div>
      {loading ? (
        <Box sx={{ display: "flex" }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <>
          <h3>Active Claims</h3>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Poll</TableCell>
                  <TableCell align="center">Namespace</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {clusterClaims.map((claim) => (
                  <Row key={claim.name} row={claim} user={user} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
}

export default ClusterClaims;
