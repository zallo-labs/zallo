CREATE MIGRATION m1gvb4a2b72qjurc6l6zrj5qghz6hhbpbitzl4qoazkqxnwqo2d3ta
    ONTO m15rh47g4ckwprxkkbs52zvvj3au4zuripm3kilh3ybficalcz6pva
{
  ALTER TYPE default::Transfer {
      CREATE REQUIRED PROPERTY logIndex -> std::int32 {
          SET REQUIRED USING (SELECT
              <std::int32>(std::random() * 100000000)
          );
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE CONSTRAINT std::exclusive ON ((.block, .logIndex));
  };
};
