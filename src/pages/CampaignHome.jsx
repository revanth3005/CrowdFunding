import React, { useEffect, useState } from "react";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import web3 from "../configurations/alchemy/alchemy-config";
import CF_Factory_ABI from "../contract_abis/CF_Factory_ABI.json";
import CF_ABI from "../contract_abis/CF_ABI.json";
import jsonData from "../config.json";
import bg from "../assets/home.svg";
import bg1 from "../assets/view.svg";
import { NavLink } from "react-router-dom";
const CampaignHome = () => {
  const [campaigns, setCampaigns] = useState(null);
  const [contributors, setContributors] = useState(null);
  const [fundsRaised, setFundsRaised] = useState(null);
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
      try {
        const CF_Factory = new web3.eth.Contract(
          CF_Factory_ABI,
          jsonData.CF_Factory_Contract
        );

        const count = await CF_Factory.methods.cf_Count().call();
        setCampaigns(count);

        let ar = [];
        let r = [];
        const getCFDeployedArray = await CF_Factory.methods
          .getCFDeployedArray()
          .call();
        for (let i = 0; i < count; i++) {
          r.push(i);
        }
        let contributorsCount = 0;
        let fundsRaise = 0;
        for await (let item of getCFDeployedArray) {
          const CF = new web3.eth.Contract(CF_ABI, item);
          const approversCount = await CF.methods.approversCount().call();

          contributorsCount += +approversCount;
          const minContributionAmount = await CF.methods
            .minimumContributorAmout()
            .call();

          if (approversCount > 0) {
            //creating an dummy array for loop
            let approvalCountArray = [];
            for (let v = 0; v < +approversCount; v++) {
              approvalCountArray.push(v + 1);
            }
            console.log("approvalCountArray", approvalCountArray);
            for await (let counter of approvalCountArray) {
              console.log("-------------", counter, approversCount);
              fundsRaise = fundsRaise + +minContributionAmount;
              console.log("-------------", counter, fundsRaise);
            }
          }
          console.log(
            "approvers count",
            item,
            approversCount,
            minContributionAmount,
            fundsRaise
          );
        }
        setFundsRaised(web3.utils.fromWei(String(fundsRaise)));
        setContributors(contributorsCount);
        console.log("fundsRaise", typeof String(fundsRaise));
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "84vh",
        color: "white",
        backgroundImage: `url(${bg})`,
        //  backdropFilter: "blur(80px)",
        // backgroundColor: "black",
      }}
    >
      <Container
        sx={{
          width: "100%",
          minHeight: "84vh",
          // backdropFilter: "blur(80px)",
          // background: "rgba(0, 0, 0, 0.5 )",
          boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
          backdropFilter: "blur( 10px )",
          // -webkit-backdropFilter: blur( 3px );
          // border-radius: 10px;
        }}
      >
        <Typography variant="h5" textAlign={"center"} p={2} fontWeight={600}>
          Welcome to the Crowdfunding Platform.
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
              width: 1200,
              height: 100,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <Stack
              justifyContent={"center"}
              direction={"row"}
              alignItems={"center"}
              gap={2}
            >
              <Box
                sx={{
                  border: "1px solid gray",
                  p: 1,
                  width: 250,
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight={400}>
                  Total Campaigns
                </Typography>
                <Typography textAlign={"center"}>{campaigns}</Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid gray",
                  p: 1,
                  width: 250,
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight={400}>
                  Total Contributors
                </Typography>
                <Typography textAlign={"center"}>{contributors}</Typography>
              </Box>
              <Box
                sx={{
                  border: "1px solid gray",
                  p: 1,
                  width: 250,
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight={400}>
                  Total Contributions
                </Typography>
                <Typography textAlign={"center"}>{fundsRaised} ETH</Typography>
              </Box>
            </Stack>
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
                    width: 320,
                    height: 150,
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: 1,
                    "&:hover": {
                      cursor: "pointer",
                    },
                    //backgroundColor: "brown",
                    //borderColor: "brown",
                  }}
                >
                  <Typography textAlign={"center"} variant="h5" color={"white"}>
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
