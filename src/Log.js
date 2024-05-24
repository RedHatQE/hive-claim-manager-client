function Log(msg) {
  if (process.env.REACT_APP_DEBUG) {
    console.log(msg);
  }
}

export default Log;
