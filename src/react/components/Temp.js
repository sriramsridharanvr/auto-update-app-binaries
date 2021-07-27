import {
  Button,
  CircularProgress,
  Grid,
  makeStyles,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { channels } from "../../shared/constants";
import { Check, Close } from "@material-ui/icons";

const { ipcRenderer } = window;

const agentStatusValues = {
  running: "Running",
  starting: "Starting",
  stopped: "Stopped",
};

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

const Temp = () => {
  const classes = useStyle();

  const [agentStatus, setAgentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  ipcRenderer.on(channels.AGENT_STATUS, (event, status) => {
    setAgentStatus(status);
    if(status.agentStatus === agentStatusValues.running || status.agentStatus === agentStatusValues.stopped) {
      setLoading(false);
    }else if(status.agentStatus === agentStatusValues.starting) {
      setLoading(true);
    }
  });

  useEffect(() => {
    window.setInterval(() => {
      console.log("Pinging ", channels.AGENT_STATUS)
      ipcRenderer.send(channels.AGENT_STATUS);
    }, 1000);
  }, []);

  const startAgent = () => {
    setLoading(true);

    ipcRenderer.send(channels.AGENT_START);
  };

  const stopAgent = () => {
    setLoading(true);
    ipcRenderer.send(channels.AGENT_END);
  };

  const toggleAgentState = (e) => {
    e.preventDefault();
    if (agentStatus && agentStatus.agentStatus === agentStatusValues.running) {
      stopAgent();
    } else {
      startAgent();
    }
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

  return (
    <Grid container>
      <Grid item xs={12}>
        <div className={classes.agentStatusContainer}>
          {loading
            ? AgentStatusLoading
            : agentStatus &&
              agentStatus.agentStatus === agentStatusValues.running
            ? AgentRunning
            : AgentNotRunning}
        </div>
      </Grid>
      {!loading && (
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
              color={
                agentStatus &&
                agentStatus.agentStatus === agentStatusValues.running
                  ? "secondary"
                  : "primary"
              }
              onClick={toggleAgentState}
              disableRipple={true}
              // disableElevation={true}
            >
              {agentStatus &&
              agentStatus.agentStatus === agentStatusValues.running
                ? "Stop"
                : "Start"}
            </Button>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default Temp;
