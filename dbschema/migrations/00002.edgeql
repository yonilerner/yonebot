CREATE MIGRATION m1xjpvtbgjlnuqlp2vh2lbggcpqxrjoffpw3s4unw6pz3qzyuhq2cq
    ONTO m17l5jniwk3as4sp5mk47k62n7j2lwzikwl5yfmyfgio6yorvy2p6q
{
  ALTER TYPE default::StarboardMessage {
      ALTER PROPERTY insertTimestamp {
          SET default := (std::datetime_current());
      };
  };
};
