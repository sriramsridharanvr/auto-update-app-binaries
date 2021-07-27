// const request = require("request");
const path = require("path");

module.exports = {
  agentStatus: {
    running: "Running",
    starting: "Starting",
    stopped: "Stopped",
  },

  agentResult: {
    success: "success",
    error: "error",
  },
  //   doHealthCheck: (url, timeout) => {
  //     let promise = new Promise((resolve, reject) => {
  //       let counter = 0;
  //       const interval = setInterval(() => {
  //         if (counter > timeout) {
  //           clearInterval(interval);
  //           console.error("Health check failed for URL ", url);
  //           console.error(
  //             "Did not get success response after waiting " + timeout + " seconds"
  //           );
  //           reject(new Error("Health check failed for URL " + url));
  //         }

  //         counter++;
  //         request(url, (error, response) => {
  //           if (response && response.statusCode === 200) {
  //             clearInterval(interval);
  //             //console.log("Health check succeeded: ", url);
  //             resolve(true);
  //           }
  //         });
  //       }, 1000);
  //     });

  //     return promise;
  //   },

  isDev: () => {
    return process.mainModule.filename.indexOf("app.asar") === -1;
  },
};
