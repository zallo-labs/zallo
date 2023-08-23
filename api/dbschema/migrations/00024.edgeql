CREATE MIGRATION m1zs2dzm5f4c6oqsssiuloaswnnxj3ibyzbuskxbrv4cmauyl4hjzq
    ONTO m1rr7ln4j5e2zwtbmz7jskyry2edhbfnmmaddktwwwtcm3nqli67da
{
  ALTER TYPE default::MessageProposal {
      CREATE PROPERTY typedData: std::json;
  };
};
