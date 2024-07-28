with account := (select Account filter .address = <UAddress>$account),
     latest := (select Policy filter .account = account and .key = <uint16>$key and .isLatest)
update (latest union latest.draft[is Policy]) set {
  name := <str>$name
}
