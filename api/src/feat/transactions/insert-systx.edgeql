insert SystemTx {
  hash := <Bytes32>$hash,
  proposal := (select Transaction filter .id = <uuid>$proposal),
  maxEthFeePerGas := <decimal>$maxEthFeePerGas,
  ethPerFeeToken := <decimal>$ethPerFeeToken,
  usdPerFeeToken := <decimal>$usdPerFeeToken
}