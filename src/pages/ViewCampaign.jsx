/* eslint-disable no-use-before-define */
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import bg from "../assets/home.svg";
import web3 from "../configurations/alchemy/alchemy-config";
import CF_ABI from "../contract_abis/CF_ABI.json";
import CF_Factory_ABI from "../contract_abis/CF_Factory_ABI.json";
import jsonData from "../config.json";
import im from "../assets/im.svg";
import { useAccount, useContractWrite } from "wagmi";
import { useFormik } from "formik";
import { number, object, string } from "yup";
import { toast } from "react-toastify";

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
  const [approversCount, setApproversCount] = useState(null);
  const [createRequestDialog, setCreateRequestDialog] = useState(false);
  const [viewApproversDialog, setViewApproversDialog] = useState(null);
  const [btState, setBtState] = useState(null);
  const [approveBtState, setApproveBtState] = useState(false);
  const [reFetchData, setReFetchData] = useState(false);
  const [contributorDialog, setContributorDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(null);
  const [donateBt, setDonateBt] = useState(false);
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
        const count = await CF.methods.approversCount().call();
        const minAmount = await CF.methods.minimumContributorAmout().call();

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
        setCreatedRequestsArray(ar);
        setApproversCount(count);
        setContributionAmount(minAmount);
        setLoad(false);
      } catch (error) {
        console.log(error);
        setLoad(false);
      }
    };
    fetchData();
  }, [address, contract, index, reFetchData]);
  const requestsHeaders = [
    "No.",
    "Description",
    "Recipient Address",
    "Amount (MATIC)",
    "Approval Count",
    "Actions / Status",
  ];

  const transactionRecipet = async (txHash) => {
    try {
      //checking for recipe using alchemy
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        console.log("transaction receipt", receipt);
        if (receipt.status) {
          console.log("transactionRecipet Transaction was successful!");
          toast.success("😍 Transaction Succesful...", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });

          //button state
          setBtState(false);
          setApproveBtState(false);
          setReFetchData(true);
          setDonateBt(false);

          //setter
          createRequestFormik.resetForm();
          setCreateRequestDialog(false);
          setContributorDialog(false);

          return true;
        } else {
          console.log("transactionRecipet Transaction failed.");
          setDonateBt(false);
          toast.error("Transaction Failed...", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          //button state
          setBtState(false);
          setApproveBtState(false);
          return false;
        }
      } else {
        console.log(
          "Transaction receipt not found. The transaction may not be mined yet."
        );
        // calling again if there is no recipet
        transactionRecipet(txHash);
      }
    } catch (error) {
      setApproveBtState(false);
      setBtState(false);
      setDonateBt(false);
      toast.error(
        `"Error occurred while checking transaction receipt:",
          ${error.message}`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      console.error(
        "Error occurred while checking transaction receipt:",
        error.message
      );
      // Handle errors appropriately in your application.
    }
  };
  const { write } = useContractWrite({
    address: contract,
    abi: CF_ABI,
    functionName: "createRequest",
    onSuccess(data) {
      console.log("wait for confirmation", data);
      toast("Tx Initiated...", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
    onError(error) {
      console.log("admin mint Error", error);

      toast.error("Failed", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      //button state
      setBtState(false);
    },
    onSettled(data, error) {
      if (error) {
        const errorStringify = JSON.stringify(error);
        const errorParse = JSON.parse(errorStringify);
        console.log("admin mint error from settlement", errorParse);
        toast.error(errorParse?.shortMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setBtState(false);
      } else {
        console.log("placeBidTransaction data hash", data.hash);
        toast("Tx settled wait for confirmation", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        transactionRecipet(data.hash);
      }
    },
  });
  const createRequestFormik = useFormik({
    initialValues: {
      description: "",
      recipientAddress: "",
      amount: "",
    },
    validationSchema: object({
      description: string("").required("Service Required!"),
      amount: number().required().positive(),
      recipientAddress: string()
        .matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Metamask address")
        .required("Metamask is required"),
    }),
    onSubmit: async (values) => {
      const w = web3.utils.toWei(values.amount);
      console.log("Formik values", values, w);
      //bt state
      setBtState(true);
      //   sending transaction
      write({
        args: [values.description, values.recipientAddress, w],
        from: address,
      });
    },
  });

  const approveRequest = async (index) => {
    console.log("approveRequest", index);
    setApproveBtState(true);
    approveRequestWrite.write({
      args: [index],
      from: address,
    });
  };
  const approveRequestWrite = useContractWrite({
    address: contract,
    abi: CF_ABI,
    functionName: "approveRequest",
    onSuccess(data) {
      console.log("wait for confirmation", data);
      toast("Tx Initiated...", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
    onError(error) {
      console.log("admin mint Error", error);

      toast.error(" Failed", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      //button state
      setApproveBtState(false);
    },
    onSettled(data, error) {
      if (error) {
        const errorStringify = JSON.stringify(error);
        const errorParse = JSON.parse(errorStringify);
        console.log("admin mint error from settlement", errorParse);
        toast.error(errorParse?.shortMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setApproveBtState(false);
      } else {
        console.log("placeBidTransaction data hash", data.hash);
        toast("Tx settled wait for confirmation", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        transactionRecipet(data.hash);
      }
    },
  });
  const contributionWrite = useContractWrite({
    address: contract,
    abi: CF_ABI,
    functionName: "Contribute",
    value: contributionAmount,
    onSuccess(data) {
      console.log("wait for confirmation", data);
      toast("Tx Initiated...", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
    onError(error) {
      console.log("admin mint Error", error);

      toast.error(" Failed", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      //button state
      setDonateBt(false);
    },
    onSettled(data, error) {
      if (error) {
        const errorStringify = JSON.stringify(error);
        const errorParse = JSON.parse(errorStringify);
        console.log("admin mint error from settlement", errorParse);
        toast.error(errorParse?.shortMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setDonateBt(false);
      } else {
        console.log("placeBidTransaction data hash", data.hash);
        toast("Tx settled wait for confirmation", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        transactionRecipet(data.hash);
      }
    },
  });
  const transferRequestAmount = async (index) => {
    console.log("transferRequestAmount", index);
    transferRequestAmountWrite.write({
      args: [index],
      from: address,
    });
  };
  const transferRequestAmountWrite = useContractWrite({
    address: contract,
    abi: CF_ABI,
    functionName: "finalizeRequest",
    onSuccess(data) {
      console.log("wait for confirmation", data);
      toast("Tx Initiated...", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    },
    onError(error) {
      console.log("admin mint Error", error);

      toast.error(" Failed", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      //button state
      setApproveBtState(false);
    },
    onSettled(data, error) {
      if (error) {
        const errorStringify = JSON.stringify(error);
        const errorParse = JSON.parse(errorStringify);
        console.log("admin mint error from settlement", errorParse);
        toast.error(errorParse?.shortMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        setApproveBtState(false);
      } else {
        console.log("placeBidTransaction data hash", data.hash);
        toast("Tx settled wait for confirmation", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        transactionRecipet(data.hash);
      }
    },
  });
  return (
    <Layout maxWidth="xl">
      <Box
        sx={{
          minHeight: "84vh",
          // backgroundImage: `url(${bg})`,
          backgroundColor: "black",
          color: "white",
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
              color: "white",
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
                  gap={1}
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
                    onClick={() => setViewApproversDialog(true)}
                  >
                    view approvers
                  </Button>
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
                    onClick={() => setCreateRequestDialog(true)}
                  >
                    create request
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
                <Box height={430}>
                  <img
                    src={im}
                    alt="test picture"
                    width={"100%"}
                    height={"100%"}
                  />
                </Box>
              </Grid>
              <Grid xs={12} sm={6} md={6} lg={7} xl={7} pt={14}>
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
                      To become a contributor, please{" "}
                      <Link
                        sx={{
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => setContributorDialog(true)}
                      >
                        CLICK HERE
                      </Link>
                    </Typography>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>

      {/* created Request Details Dialog  */}
      <Dialog
        open={requestsDialog}
        //onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 450 } }}
        maxWidth="xl"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Created Requests
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TableContainer component={Paper} elevation={5}>
            <Table
              sx={{ minWidth: 700 }}
              aria-label="simple table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  {requestsHeaders.map((item) => {
                    return (
                      <TableCell
                        sx={{
                          fontWeight: 600,
                        }}
                        key={item}
                      >
                        {item}
                      </TableCell>
                    );
                  })}
                  {CF_Manager === address && (
                    <TableCell
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Transaction / Status
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {createdRequestsArray.map((row, index) => (
                  <TableRow
                    key={index + 1}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {index + 1}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.description}
                    </TableCell>
                    <TableCell>
                      {String(row.recepient).substring(0, 11) +
                        "..." +
                        String(row.recepient).substring(38)}
                    </TableCell>
                    <TableCell>
                      {row.value && web3.utils.fromWei(row.value)} MATIC
                    </TableCell>
                    <TableCell
                      sx={{
                        pl: 5,
                      }}
                    >
                      {row.approvalsCount}/ {approversCount}{" "}
                    </TableCell>
                    <TableCell>
                      {row.complete ? (
                        <Typography>Completed</Typography>
                      ) : (
                        <Stack direction={"row"} gap={1}>
                          <Button
                            variant="contained"
                            onClick={() => approveRequest(index)}
                            disabled={approveBtState}
                          >
                            Approve
                          </Button>
                          {/* <Button variant="outlined" color="error">
                            Cancel
                          </Button> */}
                        </Stack>
                      )}
                    </TableCell>
                    {CF_Manager === address &&
                      (!row.complete && CF_Manager === address ? (
                        <TableCell
                          sx={{
                            pl: 5,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => transferRequestAmount(index)}
                          >
                            Transfer
                          </Button>
                        </TableCell>
                      ) : (
                        <TableCell
                          sx={{
                            pl: 6,
                          }}
                        >
                          <Typography>Completed</Typography>
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
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
      {/* view Approvers dialog */}
      <Dialog
        open={viewApproversDialog}
        //onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 450 } }}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Approvers
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TableContainer
            component={Paper}
            elevation={5}
            sx={{ maxHeight: 650 }}
          >
            <Table aria-label="simple table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    No.
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Wallet (Web3) Address
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approversArray?.map((row, index) => (
                  <TableRow
                    key={index + 1}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {index + 1}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewApproversDialog(false)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {/* create new Request Dialog  */}
      <Dialog
        open={createRequestDialog}
        //onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 450 } }}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Create new Request
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <TextField
                variant="outlined"
                autoComplete="given-name"
                name="description"
                required
                fullWidth
                id="description"
                label="Description"
                value={createRequestFormik.values.description}
                onChange={createRequestFormik.handleChange}
                helperText={createRequestFormik.errors.description}
                error={createRequestFormik.errors.description ? true : false}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <TextField
                variant="outlined"
                autoComplete="given-name"
                name="recipientAddress"
                required
                fullWidth
                id="recipientAddress"
                label="Recipient (Web3) Address"
                value={createRequestFormik.values.recipientAddress}
                onChange={createRequestFormik.handleChange}
                helperText={createRequestFormik.errors.recipientAddress}
                error={
                  createRequestFormik.errors.recipientAddress ? true : false
                }
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <TextField
                variant="outlined"
                autoComplete="given-name"
                name="amount"
                required
                fullWidth
                id="amount"
                label="Amount"
                value={createRequestFormik.values.amount}
                onChange={createRequestFormik.handleChange}
                helperText={createRequestFormik.errors.amount}
                error={createRequestFormik.errors.amount ? true : false}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={createRequestFormik.handleSubmit}
                disabled={
                  !(createRequestFormik.isValid && createRequestFormik.dirty) ||
                  btState
                }
              >
                create
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateRequestDialog(false)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>{" "}
      </Dialog>
      {/* Contributor Dialog  */}
      <Dialog
        open={contributorDialog}
        //onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 450 } }}
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
          }}
        >
          Become a Contributor
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <TextField
                variant="outlined"
                autoComplete="given-name"
                required
                fullWidth
                label="Contribution Amount"
                value={
                  contributionAmount &&
                  web3.utils.fromWei(contributionAmount) + " MATIC"
                }
                disabled
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  contributionWrite.write({ from: address });
                  setDonateBt(true);
                }}
                disabled={donateBt}
              >
                {donateBt ? "Contributing..." : "Contribute"}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setContributorDialog(false)}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>{" "}
      </Dialog>
    </Layout>
  );
};

export default ViewCampaign;
