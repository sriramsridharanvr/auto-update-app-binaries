import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#514ca2",
      light: "#8278d4",
      dark: "#1c2473",
    },
    // background: {
    //   default: "#f4f7fc",
    // },
  },

  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    fontSize: 10,
  },

  props: {
    MuiButton: {
      variant: "contained",
      disableRipple: true,
    },
  },
});

export default theme;
