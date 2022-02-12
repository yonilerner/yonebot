CREATE MIGRATION m17l5jniwk3as4sp5mk47k62n7j2lwzikwl5yfmyfgio6yorvy2p6q
    ONTO initial
{
  CREATE TYPE default::StarboardMessage {
      CREATE REQUIRED PROPERTY insertTimestamp -> std::datetime;
      CREATE REQUIRED PROPERTY starboardMessageId -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY starredMessageId -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
