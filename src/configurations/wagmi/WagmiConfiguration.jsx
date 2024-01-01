import React from "react";
//third-party imports
import { Box } from "@mui/material";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  arbitrum,
  mainnet,
  polygon,
  polygonMumbai,
  goerli,
} from "wagmi/chains";

import jsonData from "../../config.json";

const WagmiConfiguration = (props) => {
  // network chainas
  const chains = [arbitrum, mainnet, polygon, polygonMumbai, goerli];
  // wallet connect cloud ID
  const projectId = jsonData.wagmiProject_ID;

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  //wagmi Configuration
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ version: 2, projectId, chains }),
    publicClient,
  });
  // ethereum client
  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <React.Fragment>
      <>
        <WagmiConfig config={wagmiConfig}>{props.children}</WagmiConfig>
        <Box
          style={{
            position: "absolute",
            zIndex: 2000000,
            top: 0,
          }}
        >
          <Web3Modal
            // explorerRecommendedWalletIds={[
            //   "0x2845B72FDd60f2fa76470069d05a4D8dfCCDBFE7",
            // ]}
            // explorerExcludedWalletIds="ALL"
            projectId={projectId}
            ethereumClient={ethereumClient}
            themeVariables={{
              "--w3m-font-family": "Roboto, sans-serif",
              "--w3m-accent-color": "#1976d2", // color
              "--w3m-overlay-backdrop-filter": "blur(8px)", // overlay filter
              "--w3m-background-color": "blue", // bg color
              "--w3m-background-image-url": "", // background image url
              //  "--w3m-logo-image-url": walletLogo,
              //"https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/220px-Bitcoin.svg.png", // logo image url
              //   "--w3m-accent-fill-color": "blue", // font color
            }}
          />
        </Box>
      </>
    </React.Fragment>
  );
};

export default WagmiConfiguration;
