update Transaction
filter .id = <uuid>$transaction
set {
  paymasterEthFees := (
    insert PaymasterFees {
      activation := <decimal>$activation,
    }
  )
}