module default {
  function as_chain(address: UAddress) -> str using (
    str_split(address, ':')[0]
  );

  function as_address(address: UAddress) -> Address using (
    str_split(address, ':')[1]
  );

  function as_decimal(value: bigint, decimals: uint16) -> decimal using (
    <decimal>value / (<decimal>10 ^ decimals)
  );

  function as_fixed(value: decimal, decimals: uint16) -> bigint using (
    <bigint>round(value * (10n ^ decimals))
  );

  function is_member_by_id(account: uuid) -> bool using (
    contains(global current_accounts, account) ?? false
  );

  function is_member(account: Account) -> bool using (
    contains(global current_accounts, account.id) ?? false
  );
}