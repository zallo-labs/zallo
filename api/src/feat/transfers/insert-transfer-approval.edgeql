with accountAddress := <UAddress>$account,
     localAccount := as_address(accountAddress),
     account := (select Account filter .address = accountAddress),
     resultId := <optional uuid>$result,
     result := assert_single((select Result filter .id = resultId and .transaction.account = account) if exists resultId else {}),
     from := <Address>$from,
     to := <Address>$to,
     transfer := (
       insert TransferApproval {
         account := account,
         systxHash := <optional Bytes32>$systxHash,
         result := result,
         block := <bigint>$block,
         logIndex := <uint32>$logIndex,
         timestamp := <datetime>$timestamp,
         confirmed := (result is Confirmed ?? true),
         from := from,
         to := to,
         tokenAddress := <UAddress>$token,
         amount := <decimal>$amount,
         incoming := (to = localAccount),
         outgoing := (from = localAccount),
         fee := ((result.transaction.paymaster in {from, to}) ?? false)
       } unless conflict
     )
select transfer;