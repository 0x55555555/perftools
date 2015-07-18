#include "perf.hpp"
#include "perf_io.hpp"

#define CATCH_CONFIG_MAIN
#include <catch.hpp>

TEST_CASE( "config", "[config]" ) {

  SECTION("construction") {
    perf::config cfg1;
    perf::config cfg2;
    
    perf::string desc1(cfg1.allocator());
    perf::string desc2(cfg1.allocator());
    
    cfg1.identity().json_description(desc1);
    cfg2.identity().json_description(desc2);

    REQUIRE(desc1 == desc2);
  }
}

TEST_CASE("context", "[context]") {

  SECTION("expects valid input") {
    perf::config cfg;
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, nullptr), std::invalid_argument);
    REQUIRE_THROWS_AS(perf::context ctx(&cfg, nullptr), std::invalid_argument);
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, "test"), std::invalid_argument);
  }

  SECTION("can dump contents") {
    perf::config cfg;
    perf::context ctx(cfg, "name");

    perf::json_writer writer;
    
    // This is tested more aggressively by other bindings.
    auto dumped = writer.dump(ctx);
    REQUIRE(dumped.size() > 100);
  }
}

TEST_CASE("time points", "[timing]") {
    // todo: error checking

  SECTION("generates quick time points") {
    perf::config cfg;
    perf::context ctx(&cfg, "test");

    {
    perf::single_fire_event blk(ctx, "busyloop");

    for (uint8_t i = 0; i < (uint8_t)-1; ++i)
      {
      perf::single_fire_event blk2(blk, "inner");
      for (uint8_t j = 0; j < (uint8_t)-1; ++j)
        {
        }
      }
    }

    {
    perf::single_fire_event blk(ctx, "process");

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }

    blk.fire("mid");

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }
    }

    perf::json_writer writer;
    
    writer.write(ctx, "data/cpp1.json");
  }

  SECTION("generates time points") {
    perf::config cfg;
    perf::context ctx(&cfg, "test");

    perf::meta_event blk_m(ctx, "busyloop");
    perf::meta_event blk2_m(blk_m, "inner");
    perf::meta_event process_m(ctx, "process");
    perf::meta_event mid_m(process_m, "mid");

    {
    perf::event blk(blk_m);

    for (uint8_t i = 0; i < (uint8_t)-1; ++i)
      {
      perf::event blk2(blk2_m);
      for (uint8_t j = 0; j < (uint8_t)-1; ++j)
        {
        }
      }
    }

    {
    perf::event process(process_m);

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }

    mid_m.fire();

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }
    }
    
    perf::json_writer writer;
    
    writer.write(ctx, "data/cpp2.json");
  }
}
