module default {
  function as_chain(address: UAddress) -> str
    using (str_split(address, ':')[0]);

  function as_adddress(address: UAddress) -> Address
    using (str_split(address, ':')[1]);
}