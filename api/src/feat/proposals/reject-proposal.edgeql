with proposal := (select Proposal filter .id = <uuid>$proposal),
     approver := (select Approver filter .address = <Address>$approver)
    #  deletedResponse := (delete ProposalResponse filter .proposal = proposal and .approver = approver)
select {
  rejection := (
    insert Rejection { 
      proposal := proposal,
      approver := approver
    }
  ).id,
  proposal := (
    id := proposal.id,
    account := { address := proposal.account.address }
  )
}