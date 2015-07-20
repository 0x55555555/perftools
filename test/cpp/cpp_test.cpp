#include "perf.hpp"
#include "perf_io.hpp"

#include <jsoncons/json.hpp>

#define CATCH_CONFIG_MAIN
#include <catch.hpp>

TEST_CASE( "config", "[config]" ) {

  SECTION("construction") {
    perf::config cfg1;
    perf::config cfg2;
    
    perf::string desc1(cfg1.allocator());
    perf::string desc2(cfg1.allocator());
    
    cfg1.get_identity().json_description(desc1);
    cfg2.get_identity().json_description(desc2);

    REQUIRE(desc1 == desc2);
  }
}

TEST_CASE("context", "[context]") {

  SECTION("expects valid input") {
    perf::config cfg;
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, nullptr), std::runtime_error);
    REQUIRE_THROWS_AS(perf::context ctx(&cfg, nullptr), std::runtime_error);
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, "test"), std::runtime_error);
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
  
  perf::config cfg;
  
  SECTION("generates quick time points") {
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
  }

  SECTION("generates time points") {
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
    
  }
  
}

TEST_CASE("json output", "[json]") {
  
  SECTION("parsable output") {
    perf::config cfg;
    perf::string output(cfg.allocator());
  
    {
      perf::context ctx(cfg, "test");
      perf::json_writer writer;
      output = writer.dump(ctx);
    }
  
  
    std::cout << output << std::endl;
    auto obj = jsoncons::json::parse_string(output.data());
    
    REQUIRE(obj.is_object());
    REQUIRE(obj["name"].to_string() == "test");
    REQUIRE(obj["machine_identity"].is_object());
    REQUIRE(obj["results"].is_array());
  }
}