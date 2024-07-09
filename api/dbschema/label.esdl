module default {
  abstract type Labelled {
    required address: UAddress;
    required name: BoundedStr;
    required chain := as_chain(.address);

    index on (.address);
    index on (as_address(.address));
  }

  type GlobalLabel extending Labelled {
    constraint exclusive on (.address);
    index on (.name);
  }

  abstract type UserLabelled extending Labelled {}

  type Contact extending UserLabelled {
    user: User { 
      default := (<User>(global current_user).id);
      on target delete delete source;
    }

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .name));

    access policy user_all allow all using (
      .user ?= global current_user
    );
  }

  function label(address: str) -> optional str using (
    select labelForUser(address, global current_user)
  );

  # TODO: use `address: UAddress` param when fixed - https://github.com/edgedb/edgedb-js/issues/893
  # TODO: use `user: optional User` param when fixed - https://github.com/edgedb/edgedb-js/issues/894
  function labelForUser(addressParam: str, user: User) -> optional str using (
    with address := <UAddress>addressParam,
         label := assert_single((select Labelled filter .address = address order by [is UserLabelled] limit 1)).name,
         approverLabel := (select Approver filter .address = as_address(address)).details.name
    select (label ?? approverLabel)
  );
}