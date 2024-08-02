with tx := (select Transaction filter .id = <uuid>$transaction),
     transfers := <array<json>>$transfers,
     account := tx.account
select {
  prevSimulation := (delete tx.simulation),
  tx := (
    update tx set {
      executable := <bool>$executable,
      simulation := (insert Simulation {
        success := <bool>$success,
        responses := <array<Bytes>>$responses,
        transfers := assert_distinct((
          for transfer in array_unpack(transfers) union ( 
            insert Transfer {
              account := account,
              from := <Address>transfer['from'],
              to := <Address>transfer['to'],
              tokenAddress := <UAddress>transfer['tokenAddress'],
              amount := <decimal><str>transfer['amount'],
              incoming := <bool>transfer['incoming'],
              outgoing := <bool>transfer['outgoing'],
              block := <bigint><str>transfer['block'],
              logIndex := <uint32>transfer['logIndex']
            }
          ) if count(transfers) > 0 else {}
        ))
      })
    }
  )
}
