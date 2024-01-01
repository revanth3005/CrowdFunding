import React, { useEffect, useState } from "react";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import web3 from "../configurations/alchemy/alchemy-config";
import CF_Factory_ABI from "../contract_abis/CF_Factory_ABI.json";
import jsonData from "../config.json";
import bg from "../assets/home.svg";
import { NavLink } from "react-router-dom";
const CampaignHome = () => {
  const [campaigns, setCampaigns] = useState();
  const types = [
    {
      id: 1,
      name: "View Campings",
      to: "/view",
    },
    {
      id: 2,
      name: "Create Camping",
      to: "/create",
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      const i = new web3.eth.Contract(
        CF_Factory_ABI,
        jsonData.CF_Factory_Contract
      );

      const count = await i.methods.cf_Count().call();
      console.log("array data", count);
      setCampaigns(count);
    };
    fetchData();
  }, []);
  return (
    <Box
      sx={{
        minHeight: "84vh",
        color: "white",
        backgroundImage: `url(${bg})`,
      }}
    >
      <Container
        sx={{
          width: "100%",
          minHeight: "84vh",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography variant="h5" textAlign={"center"} p={2} fontWeight={600}>
          Welcome to the Platform for Crowdfunding.
        </Typography>
        <Divider
          sx={{
            width: "100%",
            borderColor: "gray",
            pt: 3,
          }}
        />
        <Stack display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Box
            sx={{
              width: 200,
              height: 100,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" fontWeight={400}>
              Created Campaigns
            </Typography>
            <Typography>{campaigns}</Typography>
          </Box>
          <Divider
            sx={{
              width: "100%",
              borderColor: "gray",
            }}
          />
        </Stack>

        <Stack
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"row"}
          gap={8}
          p={10}
        >
          {types.map((item, index) => {
            return (
              <NavLink
                key={item.id}
                to={item.to}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    border: "1px solid gray",
                    width: 300,
                    height: 150,
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 1,
                    "&:hover": {
                      cursor: "pointer",
                    },
                    // backgroundColor: "#9EC8B9",
                    backgroundImage:
                      index % 2 === 0
                        ? "radial-gradient( circle 337px at 0% 2.1%,  rgba(0,226,192,1) 0.3%, rgba(149,0,248,1) 100% )"
                        : "linear-gradient( 180.4deg,  rgba(188,120,236,1) -2.2%, rgba(29,133,163,1) 83.5% )",

                    borderColor: "#092635",
                  }}
                >
                  <Typography
                    fontWeight={500}
                    textAlign={"center"}
                    color={"white"}
                  >
                    {item.name}
                  </Typography>
                </Box>
              </NavLink>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default CampaignHome;
