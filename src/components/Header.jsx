import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { toast } from "react-toastify";
import { useWeb3Modal } from "@web3modal/react";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { useNavigate } from "react-router-dom";

const pages = [];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function Header() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  //web3Modal hook
  const { open } = useWeb3Modal();

  //disconnect hook from wagmi
  const { disconnect } = useDisconnect();
  //wagmi hook for network switch
  const { switchNetwork } = useSwitchNetwork();
  const navigate = useNavigate();
  const { chain } = useNetwork();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  //wagmi hook for accounts
  const { address, isConnected } = useAccount({
    onConnect({ address }) {
      //goerli
      if (chain?.id !== 5) {
        switchNetwork?.(5);
      }

    },

    onDisconnect() {
      navigate("/");
    },
  });
  //chian
  React.useEffect(() => {
    if (chain?.id !== 5) {
      switchNetwork?.(5);
    }
  }, [chain, switchNetwork]);

  //balances
  const balance = useBalance({
    address: address,
  });

  //handling accounts changed
  React.useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      disconnect();
    };
    window.ethereum &&
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    // window.ethereum &&
    //   window.ethereum.on("chainChanged", handleAccountsChanged);

    return () => {
      window.ethereum &&
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      // window.ethereum &&
      //   window.ethereum.removeListener("chainChanged", handleAccountsChanged);
    };
  }, [chain?.id, disconnect]);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "brown",
        // backgroundColor: "#092635",
        height: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 400,
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                cursor: "pointer",
              },
            }}
            onClick={() => navigate("/")}
          >
            CrowdFunding
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{
                    textTransform: "capitalize",
                  }}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              "&:hover": {
                cursor: "pointer",
              },
            }}
            onClick={() => navigate("/")}
          >
            CF
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  textTransform: "capitalize",
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Button
            // className="connectBt"
            size="large"
            onClick={() => {
              open();
            }}
            // disabled={connectDisable}
            color="inherit"
            variant="outlined"
            sx={{
              mr: 2,
            }}
          >
            {isConnected
              ? `${balance.data?.formatted.slice(0, 5)} ${
                  balance.data?.symbol
                }  ` +
                String(address).substring(0, 5) +
                "..." +
                String(address).substring(38)
              : "Connect wallet"}
          </Button>
          {/* <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
