CREATE MIGRATION m1zwncj7mrhfhphosci4ujc67hsbingvjgvgiugpjbcq4djoyb2x5q
    ONTO m1uccugc4h6k2bppctf34toayrn2gmmvfn22f77mvpzrudrzcirj7q
{
  ALTER GLOBAL default::current_user_accounts_array RENAME TO default::current_account_ids_array;
  ALTER GLOBAL default::current_user_accounts RENAME TO default::current_account_ids;
};
