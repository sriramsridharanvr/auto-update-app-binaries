import { Grid, makeStyles, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { channels } from "../../shared/constants";

const { ipcRenderer } = window;

const useStyle = makeStyles((theme) => ({
  centerAlignContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const AppDetails = () => {
  const [version, setVersion] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [startDir, setStartDir] = useState(null);
  const [resourcesPath, setResourcesPath] = useState(null);

  const classes = useStyle();

  useEffect(() => {
    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, appDetails) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      setVersion(appDetails.appVersion);
      setPlatform(appDetails.platform);
      setStartDir(appDetails.jarPath);
      setResourcesPath(appDetails.resourcesDir);
    });
  }, []);

  return (
    <Grid container alignItems="center" alignContent="center" justify="center">
      <Grid item xs={12}>
        <div className={classes.centerAlignContainer}>
          <Typography variant="h4">Tenjin Agent</Typography>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.centerAlignContainer}>
          <Typography variant="body1" color="textSecondary">
            Version {version}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.centerAlignContainer}>
          <Typography variant="body1" color="textSecondary">
            {platform}
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

export default AppDetails;
