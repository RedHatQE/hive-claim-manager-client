import React from "react";
import ClusterPools from "./ClusterPools";
import ClusterCliams from "./ClusterClaims";
import DeleteAllClaims from "./DeleteAllClaims";
import httpClient from "./httpClient";
import Button from "@mui/material/Button";
import isUserAuthenticated from "./UserAuthentication";

const user = await isUserAuthenticated();
const { waitingWorker, showReload, reloadPage } = useServiceWorker();

class AppWrapper extends React.Component {
  async logoutUser() {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.replace("/login");
  }

  render() {
    return (
      <div>
        <h1 align="center">Hive claim manager</h1>
        {user.error === "Unauthorized" ? (
          window.location.replace("/login")
        ) : (
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
              onClick={this.logoutUser}
            >
              {" "}
              Logout{" "}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default function App() {
  return <AppWrapper />;
}
