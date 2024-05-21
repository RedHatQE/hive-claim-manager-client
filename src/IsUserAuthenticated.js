const isUserAuthenticated = async () => {
  try {
    const resp = await fetch(process.env.REACT_APP_API_URL + "/@me");
    const data = await resp.json();
    return data;
  } catch (error) {
    console.log("Not authenticated");
  }
};

export default isUserAuthenticated;
