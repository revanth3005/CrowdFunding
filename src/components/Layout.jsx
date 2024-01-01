import { Box, Container } from "@mui/material";
const Layout = (props) => {
  return (
    <Box
      sx={
        {
          // marginTop: "100px",
        }
      }
    >
      {props.children}
    </Box>
  );
};

export default Layout;
