import Button from "@mui/joy/Button";
import httpClient from "./httpClient";

function Logout() {
  const logoutUser = async () => {
    await httpClient.post(process.env.REACT_APP_API_URL + "/logout");
    window.location.replace("/login");
  };
  return (
    <Button color="danger" variant="plain" onClick={logoutUser}>
      LOGOUT
    </Button>
  );
}

export default Logout;
