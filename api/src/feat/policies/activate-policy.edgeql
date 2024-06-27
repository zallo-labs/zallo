with account := (select Account filter .address = <UAddress>$account),
     key := <uint16>$key,
     proposal := (select SystemTx filter .hash = <Bytes32>$systxHash).proposal,
     pol := assert_single((select PolicyState filter .account = account and .key = key and (.proposal ?= proposal or .initState))),
     oldLatest := assert_single((select PolicyState filter .account = account and key = .key and .isLatest and .id != pol.id)),
     activationBlock := <bigint>$activationBlock,
     isLater := (activationBlock > (oldLatest.activationBlock ?? -1n)),
     updatedOldLatest := (update oldLatest filter isLater set { isLatest := false })
select {
  old := oldLatest.id,
  new := (
    update pol set {
      activationBlock := activationBlock,
      isLatest := isLater
    }
  ).id
};