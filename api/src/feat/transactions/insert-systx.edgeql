with transaction := (select Transaction filter .id = <uuid>$proposal),
     systx := (
       insert SystemTx {
         hash := <Bytes32>$hash,
         proposal := transaction,
         maxEthFeePerGas := <decimal>$maxEthFeePerGas,
         ethPerFeeToken := <decimal>$ethPerFeeToken,
         usdPerFeeToken := <decimal>$usdPerFeeToken
       }
     )
insert OptimisticSuccess {
  transaction := transaction,
  systx := systx
  # response := <Bytes>$response    # transaction.result[is Simulation].response
}