const ChessBettor = artifacts.require("ChessBettor");
const fs = require('fs');

module.exports = function (deployer) {
  deployer.deploy(ChessBettor).then((data) => {
    fs.writeFileSync("./test/ChessBettorContractAddress.txt", "{\"address\": \"" + data["address"] + "\"}\n",
      (err) => {
        if (err) {
          console.log("Error while trying to write contract address to file.");
          console.log(err);
        }
      });
  });
};
