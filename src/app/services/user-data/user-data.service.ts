import { ChessbetContractService } from './../../smart-contract/chessbet-contract/chessbet-contract.service';
import { userData } from './../../models/userData.model';
import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private userData: userData = {
    win: null,
    draw: null,
    loss: null,
    claimAmount: null,
    gameDetails: [],
  };
  private updatedUserData = new Subject<userData>();

  constructor(private chessbetContractService: ChessbetContractService) {}

  createUserData(activeUserAccount) {
    this.userData = {
      win: 0,
      draw: 0,
      loss: 0,
      claimAmount: '0',
      gameDetails: [],
    };
    let userStatsLength;

    this.chessbetContractService
      .getChessbetContract()
      .methods.getLengthOfAllGameList(activeUserAccount)
      .call()
      .then(
        async (resp) => {
          userStatsLength = resp;
          console.log(
            'Length of all game list for current user : ' + userStatsLength
          );

          let loopMax = Math.floor(userStatsLength / 15);
          let remainder = userStatsLength % 15;
          console.log('loopmax : ' + loopMax + ', remainder : ' + remainder);

          let i = 0;
          try {
            for (; i < loopMax; i++) {
              let start = i * 15;
              let end = start + 14;
              console.log('start :' + start + 'end : ' + end);

              await this.retrievePlayerStats(activeUserAccount, start, end);
            }

            if (remainder > 0) {
              await this.retrievePlayerStats(
                activeUserAccount,
                i * 15,
                userStatsLength - 1
              );
            }

            if (loopMax === 0 && remainder === 0) {
              this.updatedUserData.next(this.userData);
            }
          } catch (error) {
            console.log('Error received :' + error);
          }
        },
        (error) => {
          console.log('Length error : ' + error);
        }
      );

    // return this.userData;
  }

  getUserData() {
    return this.updatedUserData.asObservable();
  }

  retrievePlayerStats = async (activeUserAccount, startIndex, endIndex) => {
    let userDetails = await this.chessbetContractService
      .getChessbetContract()
      .methods.getPlayerStatsForAllGames(
        activeUserAccount,
        true,
        startIndex,
        endIndex
      )
      .call();

    console.log('startIndex : ' + startIndex + ' endIndex : ' + endIndex);
    console.log('user details : ' + JSON.stringify(userDetails));
    console.log('Win : ' + userDetails[0]);
    console.log('Loss : ' + userDetails[1]);

    this.userData.win = userDetails[1];
    this.userData.draw = userDetails[2];
    this.userData.loss = userDetails[3];
    this.userData.claimAmount = Web3.utils.fromWei(
      userDetails[5].toString(),
      'ether'
    );

    let gameDetails = [];
    for (let i in userDetails[6]) {
      //***********  userGameResultFromSc : Winner= 1,loss= -1, backchodi ho gya(placed bet after the game end or game result is 0 which means “all other cases”) = 0,still game active= -2     ******/

      const userGameResultFromSc = userDetails[6][i][2];
      console.log('Result : ' + userGameResultFromSc);

      let gameResult: string;
      let userResult: string;
      let status: string;
      if (userGameResultFromSc === '-2') {
        gameResult = 'Game is Active';
        userResult = '-';
        status = '-';
      } else {
        /******** gameWinnerFromSc : 1-Black, 2-White, 0-All other cases, special case-3 ********/
        let gameWinnerFromSc = userDetails[6][i][0][1];

        if (gameWinnerFromSc === '0') {
          gameResult = 'Draw';
        } else if (gameWinnerFromSc === '1') {
          gameResult = 'Black Won';
        } else if (gameWinnerFromSc === '2') {
          gameResult = 'White Won';
        } else {
          gameResult = 'Invalid Game';
        }

        let didUserClaimReward = userDetails[6][i][1][4];
        if (didUserClaimReward) {
          status = 'Claimed';
        } else {
          status = 'Not claimed';
        }

        if (userGameResultFromSc === '0') {
          if (gameWinnerFromSc === '0') {
            userResult = 'Bet Refunded';
          } else {
            userResult = 'Vote Discarded';
          }
        } else if (userGameResultFromSc === '1') {
          userResult = 'Won 🔥';
        } else {
          userResult = 'Lost ⚰️';
        }
      }

      gameDetails.push({
        slNo: parseInt(i) + 1,
        gameId: userDetails[6][i][0][0],
        amountBetted: Web3.utils.fromWei(
          userDetails[6][i][1][2].toString(),
          'ether'
        ),
        gameResult: gameResult,
        yourResult: userResult,
        status: status,
      });
    }

    for (let i in gameDetails) {
      this.userData.gameDetails.push(gameDetails[i]);
    }

    console.log('user data :' + JSON.stringify(this.userData));
    this.updatedUserData.next(this.userData);
  };
}
