import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import web3 from "../configurations/alchemy/alchemy-config";
import jsonData from "../config.json";
import CF_Factory_ABI from "../contract_abis/CF_Factory_ABI.json";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import bg from "../assets/view.svg";
import im from "../assets/im.svg";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea } from "@mui/material";
import { NavLink } from "react-router-dom";

const ViewCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoad(true);
      try {
        const i = new web3.eth.Contract(
          CF_Factory_ABI,
          jsonData.CF_Factory_Contract
        );

        let ar = [];
        let r = [];
        const getCFDeployedArray = await i.methods.getCFDeployedArray().call();
        const count = await i.methods.cf_Count().call();
        for (let i = 0; i < count; i++) {
          r.push(i);
        }
        for await (let item of r) {
          const fundDetails = await i.methods.fundingDetails(item).call();
          ar.push({
            contractAddr: getCFDeployedArray[item],
            fundData: fundDetails,
          });
        }
        setCampaigns(ar);
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    };
    fetchData();
  }, []);
  return (
    <Layout maxWidth="xl">
      <Box
        sx={{
          minHeight: "84vh",
          color: "white",
          // backgroundImage: `url(${bg})`,
          backgroundColor: "black",
        }}
      >
        <Container
          sx={{
            width: "100%",
            height: "100%",
            backdropFilter: "blur(5px)",
            color: "white",
            p: 2,
            pb: 4,
          }}
        >
          <Typography variant="h5" textAlign={"center"} p={2}>
            {" "}
            Campaigns
          </Typography>

          <Stack pt={2}>
            <Grid
              container
              columnGap={2}
              rowGap={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!load ? (
                campaigns.length > 0 ? (
                  campaigns.map((item, index) => {
                    return (
                      <NavLink
                        key={index + 1}
                        to={`/view/${index}/${item.contractAddr}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Grid item>
                          <Card sx={{ maxWidth: 345, minWidth:345 }}>
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                height="200"
                                image={im}
                                alt="green iguana"
                              />
                              <CardContent
                                sx={
                                  {
                                    backgroundImage: `url(${bg})`,
                                    color: "white",
                                    // backgroundColor:'bla'
                                  }
                                }
                              >
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                  }}
                                >
                                  <Stack
                                    direction={"row"}
                                    justifyContent={"space-between"}
                                  >
                                    <Typography
                                      gutterBottom
                                      variant="h6"
                                      component="div"
                                    >
                                      {item.fundData.cf_name}
                                    </Typography>
                                    <Stack direction={"column"}>
                                      <Stack
                                        direction={"row"}
                                        gap={1}
                                        justifyContent={"space-between"}
                                      >
                                        <Typography gutterBottom fontSize={10}>
                                          Owner
                                        </Typography>
                                        <Typography gutterBottom fontSize={10}>
                                          {String(
                                            item.fundData.cf_Owner
                                          ).substring(0, 5) +
                                            "..." +
                                            String(
                                              item.fundData.cf_Owner
                                            ).substring(39)}
                                        </Typography>
                                      </Stack>
                                      <Stack
                                        direction={"row"}
                                        gap={1}
                                        justifyContent={"space-between"}
                                      >
                                        <Typography gutterBottom fontSize={10}>
                                          Contribution
                                        </Typography>
                                        <Typography gutterBottom fontSize={10}>
                                          {web3.utils.fromWei(
                                            item.fundData
                                              .minimumContributorAmout
                                          )}{" "}
                                          ETH
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  </Stack>
                                  {/* <Divider
                                    sx={{
                                      color: "white",
                                      border: "1px solid gray",
                                      mb: 1,
                                    }}
                                  /> */}
                                  {/* <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={
                                      {
                                        color: "white",
                                      }
                                    }
                                  >
                                    Lizards are a widespread group of squamate
                                    reptiles, with over 6,000 species, ranging
                                    across all continents except Antarctica
                                  </Typography> */}
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      </NavLink>
                    );
                  })
                ) : (
                  <Typography>
                    -----------------No Campaigns there-----------------
                  </Typography>
                )
              ) : (
                <Box height={400}>
                  <CircularProgress />
                </Box>
              )}
            </Grid>
          </Stack>
        </Container>
      </Box>
    </Layout>
  );
};

export default ViewCampaigns;
