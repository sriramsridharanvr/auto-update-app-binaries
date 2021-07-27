import {
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";

import React, { useState, useEffect } from "react";
import { channels } from "../../shared/constants";
import { Check, Close } from "@material-ui/icons";
const { ipcRenderer } = window;

const useStyle = makeStyles((theme) => ({
  agentStatusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: "24px",
  },

  agentStatusLabel: {
    display: "flex",
    flexFlow: "row wrap",
    alignItems: "center",
    padding: "5px",
    border: "1px solid",
    borderRadius: "3px",
  },

  agentRunning: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },

  agentNotRunning: {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
  },

  agentStatusIcon: {
    marginRight: "5px",
    display: "flex",
    alignItems: "center",
  },

  agentStatusText: {
    fontWeight: "bold",
    fontSize: "0.8rem",
    flexGrow: 1,
  },
}));

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const AgentInfo = () => {
  const classes = useStyle();
  const [agentRunning, setAgentRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInterval(getAgentStatus, 1000);
  }, []);

  useEffect(() => {
    ipcRenderer.on(channels.AGENT_ERROR, (event, error) => {
      setLoading(false);
      setError(error.message);
    });
  }, []);

  const getAgentStatus = () => {
    if (ipcRenderer) {
      ipcRenderer.send(channels.AGENT_CHECK);
      ipcRenderer.on(channels.AGENT_CHECK, (event, agentStatus) => {
        //console.log("Agent Status: ", agentStatus);
        setAgentRunning(agentStatus.status === "Running" ? true : false);
        setLoading(agentStatus.status === "Starting" ? true : false);
      });
    } else {
      console.error("ipcRenderer is not available");
    }
  };

  const handleAgentStateToggle = () => {
    if (agentRunning) {
      alert("agentRunning is true. So calling stopAgent()");
      stopAgent();
    } else {
      alert("agentRunning is false. So calling startAgent()");
      startAgent();
    }
  };

  const stopAgent = () => {
    setLoading(true);
    //console.log("Sending stop message to channel: ", channels.AGENT_END);
    ipcRenderer.send(channels.AGENT_END);
    ipcRenderer.on(channels.AGENT_END, (event, result) => {
      //console.log("Message recd in channel ", channels.AGENT_START);
      //console.log("Start result: ", result);
      setLoading(false);
      ipcRenderer.removeAllListeners(channels.AGENT_END);
      if (result.status !== "success") {
        setError(
          "Could not stop agent. Please check the logs. Contact support if necessary"
        );
      } else {
        setAgentRunning(false);
      }
    });
  };

  const startAgent = () => {
    setLoading(true);
    ipcRenderer.send(channels.AGENT_START);
    ipcRenderer.on(channels.AGENT_START, (event, result) => {
      setLoading(false);
      ipcRenderer.removeAllListeners(channels.AGENT_START);
      if (result.status !== "success") {
        setError(
          "Could not start agent. Please check the logs. Contact support if necessary"
        );
        setAgentRunning(false);
      } else {
        setAgentRunning(true);
      }
    });
  };

  const AgentStatusLoading = (
    <div className={classes.agentStatusLabel}>
      <div className={classes.agentStatusIcon}>
        <CircularProgress size="0.8rem" />
      </div>
      <div className={classes.agentStatusText}>Please Wait...</div>
    </div>
  );

  const AgentNotRunning = (
    <div className={`${classes.agentStatusLabel} ${classes.agentNotRunning}`}>
      <div className={classes.agentStatusIcon}>
        <Close />
      </div>
      <div className={classes.agentStatusText}>Agent is Stopped</div>
    </div>
  );
  const AgentRunning = (
    <div className={`${classes.agentStatusLabel} ${classes.agentRunning}`}>
      <div className={classes.agentStatusIcon}>
        <Check />
      </div>
      <div className={classes.agentStatusText}>Agent is Running</div>
    </div>
  );

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setError(null);
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        {loading ? "Please wait" : "Agent running: " + agentRunning}
      </Grid>
      {/* <Grid item xs={12}>
        <div className={classes.agentStatusContainer}>
          {loading
            ? AgentStatusLoading
            : agentRunning
            ? AgentRunning
            : AgentNotRunning}
        </div>
      </Grid> */}
      {/* {!loading && (
        <Grid item xs={12}>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Button
              color={agentRunning ? "secondary" : "primary"}
              onClick={handleAgentStateToggle}
              disableRipple={true}
              // disableElevation={true}
            >
              {agentRunning ? "Stop" : "Start"}
            </Button>
          </div>
        </Grid>
      )} */}

      <Snackbar
        open={error ? true : false}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default AgentInfo;
