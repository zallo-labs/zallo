with proposal := (select Proposal filter .id = <uuid>$proposal),
     approver := (select Approver filter .address = <UAddress>$approver),
     deletedResponse := (delete ProposalResponse filter .proposal = proposal and .approver = approver)
select {
  approval := (
    insert Approval {
      proposal := proposal,
      approver := approver,
      signedHash := proposal.hash,
      signature := <Bytes>$signature
    }
  ),
  proposal := (
    id := proposal.id,
    account := { address := proposal.account.address }
  )
}