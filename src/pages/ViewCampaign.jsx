import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import bg from "../assets/home.svg";
import web3 from "../configurations/alchemy/alchemy-config";
import CF_ABI from "../contract_abis/CF_ABI.json";
import CF_Factory_ABI from "../contract_abis/CF_Factory_ABI.json";
import jsonData from "../config.json";
import im from "../assets/im.svg";
import { useAccount } from "wagmi";

const ViewCampaign = () => {
  const { index, contract } = useParams();
  const [load, setLoad] = useState(false);
  const [requestsDialog, setRequestsDialog] = useState(false);
  //cf-factory-data0
  const [factoryData, setFactoryData] = useState();
  //CF-data
  const [cf_balance, setCF_balance] = useState();
  const [approverStatus, setApproverStatus] = useState(null);
  const [createdRequestsCount, setCreatedRequestsCount] = useState(null);
  const [createdRequestsArray, setCreatedRequestsArray] = useState([]);
  const [approversArray, setApproversArray] = useState(null);
  const [CF_Manager, setCF_Manager] = useState(null);
  const { address } = useAccount();
  //factory and CF data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoad(true);
        const i = new web3.eth.Contract(
          CF_Factory_ABI,
          jsonData.CF_Factory_Contract
        );
        const factoryDetails = await i.methods.fundingDetails(index).call();
        console.log("array data", factoryDetails);
        setFactoryData(factoryDetails);

        //crowd funding
        const CF = new web3.eth.Contract(CF_ABI, contract);
        const balance = await CF.methods.getContributionAmount().call();
        const approverStatus = await CF.methods.approvers(address).call();
        const numberOfRequests = await CF.methods.numRequests().call();
        const approversArray = await CF.methods.getApproversArray().call();
        const manager = await CF.methods.campaignManager().call();

        //looping on created requests
        let ar = [];
        let r = [];
        for (let i = 0; i < numberOfRequests; i++) {
          r.push(i);
        }
        for await (const item of r) {
          const approversData = await CF.methods.requestsArray(item).call();
          ar.push(approversData);
        }
        console.log("requestsArray", ar);

        console.log(
          "CF",
          balance,
          approverStatus,
          numberOfRequests,
          approversArray,
          manager
        );
        setCF_Manager(manager);
        setApproversArray(approversArray);
        setCreatedRequestsCount(numberOfRequests);
        setApproverStatus(approverStatus);
        setCF_balance(balance);
        setLoad(false);
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    };
    fetchData();
  }, [address, contract, index]);

  return (
    <Layout maxWidth="xl">
      <Box
        sx={{
          minHeight: "84vh",
          backgroundImage: `url(${bg})`,
        }}
      >
        {load ? (
          <Container
            sx={{
              width: "100%",
              minHeight: "84vh",
              backdropFilter: "blur(5px)",
              color: "",
              pt: 2,
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
            <Typography>Fetching...</Typography>
          </Container>
        ) : (
          <Container
            sx={{
              width: "100%",
              minHeight: "84vh",
              backdropFilter: "blur(5px)",
              color: "",
              pt: 2,
            }}
          >
            {CF_Manager === address ? (
              <Stack direction={"row"} justifyContent={"center"} pb={1}>
                <Stack width={"100%"}>
                  <Typography textAlign={"end"} variant="h5" gutterBottom>
                    {factoryData?.cf_name}
                  </Typography>
                </Stack>

                <Stack
                  direction={"row"}
                  justifyContent={"right"}
                  width={"100%"}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundImage: `url(${bg})`,
                      color: "yellow",
                      borderColor: "lemonchiffon",
                      "&:hover": {
                        color: "white",
                        borderColor: "white",
                      },
                    }}
                  >
                    view approvers
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack width={"100%"}>
                <Typography textAlign={"center"} variant="h5" gutterBottom>
                  {factoryData?.cf_name}
                </Typography>
              </Stack>
            )}
            <Divider sx={{ borderColor: "white" }} />
            <Grid
              container
              pt={1}
              columnGap={4}
              sx={{
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <Grid xs={12} sm={6} md={6} lg={4} xl={4}>
                <Box height={400}>
                  <img
                    src={im}
                    alt="test picture"
                    width={"100%"}
                    height={"100%"}
                  />
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={6} lg={7} xl={7}>
                <Stack>
                  <Stack
                    direction={"row"}
                    gap={2}
                    justifyContent={"space-between"}
                  >
                    <Typography textAlign={"center"}>Owner</Typography>
                    <Typography textAlign={"center"}>
                      {String(factoryData?.cf_Owner).substring(0, 5) +
                        "..." +
                        String(factoryData?.cf_Owner).substring(38)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction={"row"}
                    gap={2}
                    justifyContent={"space-between"}
                  >
                    <Typography textAlign={"center"}>
                      Minimum Contribution
                    </Typography>
                    <Typography textAlign={"center"}>
                      {factoryData?.minimumContributorAmout &&
                        web3.utils.fromWei(
                          factoryData?.minimumContributorAmout
                        )}{" "}
                      ETH
                    </Typography>
                  </Stack>
                  <Stack
                    direction={"row"}
                    gap={1}
                    justifyContent={"space-between"}
                  >
                    <Typography textAlign={"center"}>Funds raised</Typography>
                    <Typography textAlign={"center"}>
                      {cf_balance && web3.utils.fromWei(cf_balance)} ETH
                    </Typography>
                  </Stack>
                </Stack>
                <Typography pt={2}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Dicta quaerat ad nemo eius, consectetur illo corporis
                  perspiciatis asperiores iusto nam atque suscipit tempora
                  voluptatum in vel fugiat fugit veritatis reiciendis.
                </Typography>

                {approverStatus || CF_Manager === address ? (
                  <Stack
                    pt={1}
                    direction={"row"}
                    alignItems={"center"}
                    gap={2}
                    justifyContent={"space-between"}
                  >
                    <Typography fontStyle={"italic"}>
                      {createdRequestsCount && createdRequestsCount} requests
                      were made in order to see them{" "}
                      <Link
                        sx={{
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => setRequestsDialog(true)}
                      >
                        CLICK HERE
                      </Link>
                    </Typography>
                  </Stack>
                ) : (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    gap={2}
                    justifyContent={"space-between"}
                  >
                    <Typography fontStyle={"italic"}>
                      To become a contributor, please <Link>CLICK HERE</Link>
                    </Typography>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>

      {/* Request Details  */}
      <Dialog
        open={requestsDialog}
        //onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 450 } }}
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Created Requests
        </DialogTitle>
        <Divider />
        <DialogContent>test</DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRequestsDialog(false)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ViewCampaign;
