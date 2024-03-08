CREATE MIGRATION m1wxigzvqt6fozw4qtr3jkhcarzg3teox7zvmv3t4ehedw7n4yqf4q
    ONTO m15qa7xcj2axpg5klzflagyeamffbaffuv5ncuskfef5fpozakc5ra
{
  ALTER TYPE default::Policy {
      DROP CONSTRAINT std::exclusive ON ((.account, .name));
  };
};
