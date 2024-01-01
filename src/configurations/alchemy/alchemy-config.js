
//provider
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import data from '../../config.json'

// alchemy provider set-up
const alchemyKey = data.alchemy_URL
export const web3 = createAlchemyWeb3(alchemyKey);
export default web3;