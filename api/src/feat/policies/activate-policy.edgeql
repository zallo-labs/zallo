with account := (select Account filter .address = <UAddress>$account),
     proposal := (select SystemTx filter .hash = <Bytes32>$systxHash).proposal,
     key := <uint16>$key,
     new := assert_single((select PolicyState filter .account = account and .key = key and (.proposal ?= proposal or .initState))),
     old := assert_single((select PolicyState filter .account = account and key = .key and .isLatest and .id != new.id)),
     activationBlock := <bigint>$activationBlock,
     isLater := (activationBlock > (old.activationBlock ?? -1n)),
     updatedOldLatest := (update old filter isLater set { isLatest := false })
select {
  old := old.id,
  new := (
    update new set {
      activationBlock := activationBlock,
      isLatest := isLater
    }
  ).id,
  pendingTransactions := (
    (select Transaction filter (.policy ?= old or .policy ?= new) and .status = TransactionStatus.Pending).id
    if (new is Policy) else <uuid>{}
  )
};