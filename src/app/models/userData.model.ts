export interface userData {
  win: number;
  loss: number;
  draw: number;
  claimAmount: string;
  gameDetails:
    {
      slNo: number;
      gameId: string;
      amountBetted: number;
      gameResult: string;
      yourResult: string;
      status: string;
    }[];


}
