CREATE MIGRATION m13ngazbt3dkkbegsr7e2te4y7j4jltf56szjupnmb3ngzd6yq33zq
    ONTO m15qj3htiny7zuqceuvj46wrm7yza5xyqmfuadsywsbc6tvh6vb34a
{
  ALTER SCALAR TYPE default::BoundedStr {
      DROP CONSTRAINT std::regexp(r'^(?![0oO][xX])[^\n\t]{3,50}$');
  };
  ALTER SCALAR TYPE default::BoundedStr {
      CREATE CONSTRAINT std::regexp(r'^(?![0oO][xX])[^\n\t]{2,70}$');
  };
};
