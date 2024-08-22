CREATE MIGRATION m15qj3htiny7zuqceuvj46wrm7yza5xyqmfuadsywsbc6tvh6vb34a
    ONTO m13y2dtmcrd7yvmorrgn62mp2cakpvrcbz7p7g2rr4wk34b6ow7m7q
{
  ALTER TYPE default::Transferlike {
      ALTER PROPERTY isFeeTransfer {
          RENAME TO fee;
      };
  };
};
