/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTokenPrice
// ====================================================

export interface GetTokenPrice_tokenHourDatas {
  __typename: "TokenHourData";
  periodStartUnix: number;
  priceUSD: any;
  open: any;
  close: any;
}

export interface GetTokenPrice_token {
  __typename: "Token";
  derivedETH: any;
}

export interface GetTokenPrice {
  tokenHourDatas: GetTokenPrice_tokenHourDatas[];
  token: GetTokenPrice_token | null;
}

export interface GetTokenPriceVariables {
  token: string;
  token2: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
