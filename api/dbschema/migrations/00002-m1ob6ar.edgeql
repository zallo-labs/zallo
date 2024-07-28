CREATE MIGRATION m1ob6arfwyamzcpgk2hgzhby3iwv3moewthqacorsw2mtyjkopdoaq
    ONTO m13qxppnkqofigih7dxkipm2lh6k3ahrqerachqhdzihw76nb6i3aa
{
  ALTER TYPE default::PolicyState {
      ALTER PROPERTY isDraft {
          USING ((__source__ ?= .draft));
      };
  };
};
