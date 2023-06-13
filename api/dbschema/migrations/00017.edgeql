CREATE MIGRATION m1dwo2pvuynlfac35hpnvhvv7bjn5wbv5yax57asylx3adptpbwu5a
    ONTO m15fedj5dkqu7f76dlpnowitht67a4tgcmxzrldsnh4gc567bxklfq
{
  ALTER TYPE default::Proposal {
      CREATE PROPERTY label -> std::str {
          CREATE CONSTRAINT std::max_len_value(50);
          CREATE CONSTRAINT std::min_len_value(1);
      };
  };
};
