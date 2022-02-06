"use strict";

const Web3 = require("web3");
const configs = require("./configs.json");
const contractABI = require("./../build/contracts/ChessBettor.json")["abi"];
const fs = require("fs");

const web3 = new Web3("http://127.0.0.1:7069");
const wallets = configs["wallets"];
const maxWalletCount = wallets.length;
const privateKey = configs["privateKey"];

const transaction = {
  "gas": 20000000, // 20 Million
  "gasPrice": "1000000000" // 1 GWEI
};
let contract, minBetAmount;
const initializeContract = async () => {
  const jsonObj = JSON.parse(await fs.readFileSync("./ChessBettorContractAddress.txt"));
  contract = new web3.eth.Contract(contractABI, jsonObj["address"], transaction);
  minBetAmount = "100000000000000"; // 0.0001 Eth
  await ChessBettor.setMinBetAmount(minBetAmount);
};

class ChessBettor {
  static generateBulkWallets = (numberOfWalletsToGenerate) => {
    const generatedWallets = [];

    for (let i = 0; i < numberOfWalletsToGenerate; i++) {
      const wallet = web3.eth.accounts.create();
      generatedWallets.push({
        "publicKey": wallet["address"],
        "privateKey": wallet["privateKey"]
      });
    }

    return generatedWallets;
  };
  static sendTransaction = async (encodedFunctionABI, value = 0) => {
    transaction["value"] = value;
    transaction["data"] = encodedFunctionABI;
    let signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
    return web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  };

  static setMinBetAmount = async (amount) => {
    return await contract.methods["setMinBetAmount"](amount).send({"from": wallets[0]});
  };
  static placeBet = async (walletIndex, gameId, vote, amount) => {
    try {
      await contract.methods["placeBet"](gameId, vote, amount).send({"from": wallets[walletIndex], "value": amount});
      return true;
    } catch (err) {
      return false;
    }
  };
  static endGame = async (gameIndex, gameId, winner, gameEndTimeStamp) => {
    try {
      await contract.methods["endGame"](gameIndex, gameId, winner, gameEndTimeStamp).send({"from": wallets[0]});
      return true;
    } catch (err) {
      return false;
    }
  };
  static claimRewards = async (walletIndex) => {
    try {
      await contract.methods["claimRewards"]().send({"from": wallets[walletIndex]});
      return true;
    } catch (err) {
      return false;
    }
  };
  static calculateRewards = async (address) => {
    return await contract.methods["calculateRewards"](address).call();
  };
  static getActiveGames = async () => {
    return await contract.methods["getActiveGames"]().call();
  };
  static getGameDetails = async (gameId) => {
    return await contract.methods["getGameDetails"](gameId).call();
  };
  static getMinBetAmount = async () => {
    return await contract.methods["minBetAmount"]().call();
  };


  // ------ //
  static placeBetsFromAllWallets = async (numberOfGamesToUse, numberOfWalletsToUse) => {
    if (numberOfWalletsToUse == null || numberOfWalletsToUse > maxWalletCount) {
      numberOfWalletsToUse = maxWalletCount;
    }
    if (numberOfGamesToUse == null || numberOfGamesToUse > numberOfWalletsToUse) {
      numberOfGamesToUse = numberOfWalletsToUse;
    }

    const allGames = {};
    for (let i = 0; i < numberOfGamesToUse; i++) {
      allGames[i] = {
        "id": "game-" + i,
        "votes": {
          "0": [],
          "1": [],
          "2": [],
          "3": [],
        }
      };
      for (let j = 0; j < numberOfWalletsToUse; j++) {
        try {
          let vote = Math.floor(Math.random() * 2) + 1;
          if (await ChessBettor.placeBet(j, "game-" + i, vote, minBetAmount)) {
            allGames[i]["votes"][vote].push({
              "from": wallets[j],
              "amount": minBetAmount,
              "at": Date.now()
            });
          }
        } catch (err) {
          console.log("Place Bet Error");
          console.log(err);
        }
      }
    }
    return allGames;
  };

  static endAllGames = async (numberOfGamesToUse) => {
    if (numberOfGamesToUse == null || numberOfGamesToUse > maxWalletCount) {
      numberOfGamesToUse = maxWalletCount;
    }

    for (let i = numberOfGamesToUse - 1; i >= 0; i--) {
      await ChessBettor.endGame(i, "game-" + i, Math.floor(Math.random() * 4), Math.ceil(Date.now() / 1000));
    }
  };

  static getFormattedGameDetails = async (numberOfGamesToUse) => {
    if (numberOfGamesToUse == null || numberOfGamesToUse > maxWalletCount) {
      numberOfGamesToUse = maxWalletCount;
    }

    let allGameDetails = [];
    for (let i = 0; i < numberOfGamesToUse; i++) {
      try {
        let gameDetails = await ChessBettor.getGameDetails("game-" + i);
        let formattedData = {
          "gameId": gameDetails["0"][0],
          "winner": gameDetails["0"][1],
          "gameEndTimestamp": gameDetails["0"][2],
          "isOn": gameDetails["0"][3],
          "totalAmount": gameDetails["0"][4],
          "whiteAmount": gameDetails["0"][5],
          "blackAmount": gameDetails["0"][6],
          "totalBets": gameDetails["0"][7],
          "whiteBets": gameDetails["0"][8],
          "blackBets": gameDetails["0"][9],
          "validTotalAmount": gameDetails["0"][10],
          "validAmountWhite": gameDetails["0"][11],
          "validAmountBlack": gameDetails["0"][12],
          "bettorsAndVoteData": {}
        };

        let voteList = gameDetails["1"];
        for (let i = 1; i < voteList.length - 1; i++) {
          let vote = voteList[i];
          formattedData["bettorsAndVoteData"][vote[0]] = {
            "voteFor": vote[1],
            "amount": vote[2],
            "timestamp": vote[3],
            "hasClaimed": vote[4]
          };
        }

        allGameDetails.push(formattedData);
      } catch (err) {
        console.log("Get Game Details Error");
        console.log(err);
      }
    }

    return allGameDetails;
  };
}


const mainFunction = async () => {
  // TODO : Replace below code with your code...

  let allCreatedGames = await ChessBettor.placeBetsFromAllWallets(3, 3);
  console.log(JSON.stringify(allCreatedGames));
  console.log("\n");

  console.log("List of Active Games : " + JSON.stringify(await ChessBettor.getActiveGames()));

  await ChessBettor.endAllGames(3);

  let allGameDetails = await ChessBettor.getFormattedGameDetails(3);
  console.log(JSON.stringify(allGameDetails));
  console.log("\n");
};

console.log('Running test script...\n');
initializeContract().then(() => {
  mainFunction().then(() => {
    console.log("Script Ended Successfully.");
  }).catch((err) => {
    console.log("Script Ended With Error.");
    console.log(err);
  });
}).catch((err) => {
  console.log("Unable to initialize contract");
  console.log(err);
});
