insert Transaction {
  hash := <Bytes32>$hash,
  account := (select Account filter .address = <UAddress>$account),
  policy := (<Policy>(<uuid>$policy)),
  validationErrors := <array<tuple<reason: str, operation: int32>>>$validationErrors,
  label := <optional BoundedStr>$label,
  icon := <optional Url>$icon,
  timestamp := <datetime>$timestamp,
  dapp := <optional tuple<name: str, url: Url, icons: array<Url>>>$dapp,
  unorderedOperations := (
    for pair in enumerate(array_unpack(<array<json>>$operations)) union (
      insert Operation {
        to := <Address>pair.1['to'],
        value := <uint256><str>json_get(pair.1, 'value'),
        data := <Bytes>json_get(pair.1, 'data'),
        position := <uint16>pair.0
      }
    )
  ),
  gasLimit := <uint256>$gasLimit,
  feeToken := (select token(<UAddress>$feeToken)),
  maxAmount := <decimal>$maxAmount,
  paymaster := <Address>$paymaster,
  paymasterEthFees := (
    insert PaymasterFees {
      activation := <decimal>$activationFee,
    }
  )
}