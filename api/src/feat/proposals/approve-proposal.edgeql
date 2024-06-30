with proposal := (select Proposal filter .id = <uuid>$proposal),
     approver := (select Approver filter .address = <Address>$approver)
    #  deletedResponse := (delete ProposalResponse filter .proposal = proposal and .approver = approver).id
select {
  approval := (
    insert Approval {
      proposal := proposal,
      approver := approver,
      signedHash := proposal.hash,
      signature := <Bytes>$signature
    }
  ).id,
  proposal := (
    id := proposal.id,
    account := { address := proposal.account.address }
  )
}