import { CssBaseline, Grid, ThemeProvider } from "@material-ui/core";
import React from "react";
import ProductLogo from "./components/ProductLogo";
import AppDetails from "./components/AppDetails";
import theme from "./themes/default";
import AgentInfo from "./components/AgentInfo";
import Temp from "./components/Temp";

const App = () => {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Grid container alignItems="center" justify="center">
          <Grid item xs={10}>
            <ProductLogo />
          </Grid>
          <Grid item xs={10}>
            <AppDetails />
          </Grid>
          <Grid item xs={10}>
            {/* <AgentInfo /> */}
            <Temp />
          </Grid>
        </Grid>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
