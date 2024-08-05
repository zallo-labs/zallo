insert SimulatedFailure {
  transaction := <Transaction><uuid>$transaction,
  response := <Bytes>$response,
  gasUsed := <bigint>$gasUsed,
  reason := <str>$reason
}
