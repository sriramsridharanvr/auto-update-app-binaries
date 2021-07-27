import { makeStyles } from "@material-ui/core";
import React from "react";
import logo from "../assets/tenjin_logo_original.png";
const useStyle = makeStyles((theme) => ({
  logoContainer: {
    width: "100%",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "5px 0",
  },

  logo: {
    width: "100px",
    display: "block",
  },
}));

const ProductLogo = () => {
  const classes = useStyle();
  return (
    <div className={classes.logoContainer}>
      <img className={classes.logo} src={logo} alt="Tenjin Logo" />
    </div>
  );
};

export default ProductLogo;
