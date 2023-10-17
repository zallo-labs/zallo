import { FragmentType, gql } from '@api';

const Token = gql(/* GraphQL */ `
  fragment TokenAddressItem_Token on Token {
    id
  }
`);

export interface TokenAddressItemProps {
  token: FragmentType<typeof Token>;
}

export function TokenAddressItem(props: TokenAddressItemProps) {
  return null;
}
