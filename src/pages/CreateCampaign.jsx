/* eslint-disable no-use-before-define */
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
  Button,
  TextField,
  Paper,
} from "@mui/material";
import bg from "../assets/view.svg";
import im from "../assets/im.svg";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { CardActionArea } from "@mui/material";
import { useFormik } from "formik";
import { number, object, string } from "yup";
import { toast } from "react-toastify";
import { useAccount, useContractWrite } from "wagmi";

const CreateCampaign = () => {
  const [btState, setBtState] = useState(false);
  const { address } = useAccount();

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

          //setter
          createFormik.resetForm();

          return true;
        } else {
          console.log("transactionRecipet Transaction failed.");

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
    address: jsonData.CF_Factory_Contract,
    abi: CF_Factory_ABI,
    functionName: "createCrowdFunding",
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

      toast.error("Purchase Failed", {
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
  const createFormik = useFormik({
    initialValues: {
      name: "",
      minPrice: "",
    },
    validationSchema: object({
      name: string("").required("Service Required!"),
      minPrice: number().required().positive(),
    }),
    onSubmit: async (values) => {
      console.log("Formik values", values);
      const w = web3.utils.toWei(values.minPrice);
      //bt state
      setBtState(true);
      //   sending transaction
      write({
        args: [values.name, w],
        from: address,
      });
    },
  });

  return (
    <Layout maxWidth="xl">
      <Box
        sx={{
          minHeight: "84vh",
          color: "black",
          backgroundImage: `url(${bg})`,
        }}
      >
        <Container
          sx={{
            width: "100%",
            height: "84vh",
            backdropFilter: "blur(5px)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" textAlign={"center"} p={2}>
            {" "}
            Create Campaign
          </Typography>
          <Container maxWidth="sm">
            <Box
              sx={{
                display: "grid",
                placeContent: "center",
              }}
              component={Paper}
              pb={2}
              px={4}
            >
              <Grid container spacing={3} marginTop={"5px"}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <TextField
                    variant="outlined"
                    autoComplete="given-name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label="Campaign Name"
                    value={createFormik.values.name}
                    onChange={createFormik.handleChange}
                    helperText={createFormik.errors.name}
                    error={createFormik.errors.name ? true : false}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <TextField
                    variant="outlined"
                    autoComplete="given-name"
                    name="minPrice"
                    required
                    fullWidth
                    id="minPrice"
                    label="Min Contribution Price MATIC"
                    value={createFormik.values.minPrice}
                    onChange={createFormik.handleChange}
                    helperText={createFormik.errors.minPrice}
                    error={createFormik.errors.minPrice ? true : false}
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
                    onClick={createFormik.handleSubmit}
                    disabled={
                      !(createFormik.isValid && createFormik.dirty) || btState
                    }
                  >
                    {btState ? "Creating..." : "Create"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Container>
      </Box>
    </Layout>
  );
};

export default CreateCampaign;
