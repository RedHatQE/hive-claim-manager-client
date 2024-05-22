async function isUserAuthenticated() {
  return fetch(process.env.REACT_APP_API_URL + "/@me")
    .then((response) => response.json())
    .then((user) => {
      return user;
    });
}

export default isUserAuthenticated;
