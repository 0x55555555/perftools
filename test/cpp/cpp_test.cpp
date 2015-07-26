#include "perf.hpp"

#include <jsoncons/json.hpp>

#define CATCH_CONFIG_MAIN
#include <catch.hpp>

void dummy_fill(perf::context &ctx)
{
  
  perf::meta_event blk_m(ctx, "busyloop");
  perf::meta_event blk2_m(blk_m, "inner");
  perf::meta_event process_m(ctx, "process");
  perf::meta_event mid_m(process_m, "mid");
  
  {
  auto blk = ctx.fire(blk_m);
  
  for (uint8_t i = 0; i < (uint8_t)-1; ++i)
    {
    blk.fire(blk2_m);
    for (uint8_t j = 0; j < (uint8_t)-1; ++j)
      {
      }
    }
  }
  
  {
  auto p = ctx.fire(process_m);
  perf::event process(ctx.root_event(), process_m);
  
  for (uint16_t i = 0; i < (uint16_t)-1; ++i)
    {
    }
  
  p.fire(mid_m);
  
  for (uint16_t i = 0; i < (uint16_t)-1; ++i)
    {
    }
  }
}

void dummy_fill_single_events(perf::context &ctx)
{
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

    dummy_fill_single_events(ctx);
  }

  SECTION("generates time points") {
    perf::context ctx(&cfg, "test");
    
    dummy_fill(ctx);
  }
  
}

TEST_CASE("json output", "[json]") {

  auto verify_identity = [](const jsoncons::json &obj) {
    REQUIRE(obj.is_object());
    REQUIRE(obj["arch"].is_string());
    REQUIRE(obj["os"].is_string());
    REQUIRE(obj["cpu"].is_string());
    REQUIRE(obj["cpu_count"].is_ulonglong());
    REQUIRE(obj["cpu_speed"].is_ulonglong());
    REQUIRE(obj["extra"].is_string());
    REQUIRE(obj["memory_bytes"].is_ulonglong());
    REQUIRE(obj["binding"].as_string() == "cpp");
  };
  
  SECTION("parsable output") {
    perf::config cfg;
    
    perf::string identity_str(cfg.allocator());
    cfg.get_identity().json_description(identity_str);
    auto identity_object = jsoncons::json::parse_string(identity_str.data());
    
    perf::string output(cfg.allocator());
  
    {
      perf::context ctx(cfg, "test");
      dummy_fill(ctx);
      perf::json_writer writer;
      output = writer.dump(ctx);
    }
  
    std::cout << output << std::endl;
    auto obj = jsoncons::json::parse_string(output.data());
    
    REQUIRE(obj.is_object());
    REQUIRE(obj["name"].as_string() == "test");
    verify_identity(obj["machine_identity"]);
    REQUIRE(identity_object == obj["machine_identity"]);
    REQUIRE(obj["results"].is_array());
  }
}