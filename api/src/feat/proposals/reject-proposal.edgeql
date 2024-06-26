with proposal := (select Proposal filter .id = <uuid>$proposal),
     deletedResponse := (delete ProposalResponse filter .proposal = proposal and .approver = global current_approver)

select {
  rejection := (
    insert Rejection {
      proposal := proposal
    }
  ),
  proposal := (
    id := proposal.id,
    account := { address := proposal.account.address }
  )
}