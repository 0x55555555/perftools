#include "perf.hpp"
#include "perf.h"

#include <jsoncons/json.hpp>

#define CATCH_CONFIG_MAIN
#include <catch.hpp>

void dummy_fill(perf::context &ctx)
  {
  perf::meta_event blk_m(ctx, "busyloop");
  perf::meta_event blk2_m(blk_m, "inner");
  perf::meta_event process_m(ctx, "process");
  perf::meta_event mid_m(process_m, "mid");

  // First group, invokes child many times.
    {
    auto blk = ctx.fire_child(blk_m);

    for (uint8_t i = 0; i < (uint8_t)-1; ++i)
      {
      blk.fire_child(blk2_m);
      for (uint8_t j = 0; j < (uint8_t)-1; ++j)
        {
        }
      }
    }

  // Second group, contains a single "instant" event.
    {
    auto p = ctx.fire_child(process_m);
    perf::event process(ctx.root_event(), process_m);

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }

    p.fire_child(mid_m);

    for (uint16_t i = 0; i < (uint16_t)-1; ++i)
      {
      }
    }
  }

void dummy_fill_single_events(perf::context &ctx)
  {
  // First group, many single events internally.
    {
    perf::single_fire_event blk(ctx, "busyloop");

    for (uint8_t i = 0; i < (uint8_t)-1; ++i)
      {
      // Note these are all internally separate events.
      perf::single_fire_event blk2(blk, "inner");
      for (uint8_t j = 0; j < (uint8_t)-1; ++j)
        {
        }
      }
    }

    // Second group, internal quick fire event
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

void check_identity(const jsoncons::json &obj, const char *binding = "cpp")
  {
  REQUIRE(obj.is_object());
  REQUIRE(obj["arch"].is_string());
  REQUIRE(obj["os"].is_string());
  REQUIRE(obj["cpu"].is_string());
  REQUIRE(obj["cpu_count"].is_ulonglong());
  REQUIRE(obj["cpu_speed"].is_ulonglong());
  REQUIRE(obj["extra"].is_string());
  REQUIRE(obj["memory_bytes"].is_ulonglong());
  REQUIRE(obj["binding"].as_string() == binding);
  }

void check_timing(jsoncons::json &results)
  {
  if (results.has_member("fire_count"))
    {
    REQUIRE(results["fire_count"].is_ulonglong());
    if (results.has_member("total_time"))
      {
      REQUIRE(results["min_time"].is_ulonglong());
      REQUIRE(results["max_time"].is_ulonglong());
      REQUIRE(results["total_time"].is_ulonglong());
      REQUIRE(results["total_time_sq"].is_ulonglong());
      }
    }
  }

void check_result(jsoncons::json &results, const char *name, std::size_t index, std::size_t parent)
  {
  auto obj = results[index];
  auto p_obj = results[parent];
  REQUIRE(obj["name"].as_string() == name);
  REQUIRE(obj["parent"].as_string() == p_obj["name"].as_string());
  
  check_timing(obj);
  };

void check_dummy(jsoncons::json &obj)
  {
  REQUIRE(obj.is_object());
  REQUIRE(obj["name"].as_string() == "test");
  check_identity(obj["machine_identity"]);
  REQUIRE(obj["results"].is_array());

  auto results = obj["results"];

  REQUIRE(results[0]["name"].as_string() == "root");
  check_timing(results[0]);

  check_result(results, "busyloop", 1, 0);
  check_result(results, "inner", 2, 1);
  check_result(results, "process", 3, 0);
  check_result(results, "mid", 4, 3);
  }

TEST_CASE( "config", "[core]" )
  {
  SECTION("construction")
    {
    perf::config cfg1;
    perf::config cfg2;

    perf::string desc1(cfg1.allocator());
    perf::string desc2(cfg1.allocator());

    cfg1.get_identity().json_description(desc1);
    cfg2.get_identity().json_description(desc2);

    REQUIRE(desc1 == desc2);
  }
}

TEST_CASE("context", "[core]")
  {
  SECTION("expects valid input")
    {
    perf::config cfg;
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, nullptr), std::runtime_error);
    REQUIRE_THROWS_AS(perf::context ctx(&cfg, nullptr), std::runtime_error);
    REQUIRE_THROWS_AS(perf::context ctx(nullptr, "test"), std::runtime_error);
    }

  SECTION("can dump contents")
    {
    perf::config cfg;
    perf::context ctx(cfg, "name");

    perf::json_writer writer;

    // This is tested more aggressively by other bindings.
    auto dumped = writer.dump(ctx);
    REQUIRE(dumped.size() > 100);
    }
  }

TEST_CASE("time points", "[timing]")
  {
  perf::config cfg;

  SECTION("generates quick time points")
    {
    perf::context ctx(&cfg, "test");

    dummy_fill_single_events(ctx);
    }

  SECTION("generates time points")
    {
    perf::context ctx(&cfg, "test");

    dummy_fill(ctx);
    }
  }

TEST_CASE("benchmarking", "[timing]")
  {
  perf::config cfg;
  perf::context ctx(cfg, "string_benchmarks");


  perf::benchmark(ctx, "string_appending", []()
    {
    std::string a("test");
    a += "_pork";
    });
  
  perf::benchmark_specific(ctx, "string_appending_specific", [](const auto &begin_timing)
    {
    std::string a("test");
    
    auto ev = begin_timing();
    a += "_pork";
    });
  
  auto out = jsoncons::json::parse_string(perf::json_writer().dump(ctx).c_str());
  check_identity(out["machine_identity"]);
  check_result(out["results"], "string_appending_warm_up", 1, 0);
  check_result(out["results"], "string_appending", 2, 0);
  check_result(out["results"], "string_appending_specific_warm_up", 3, 0);
  check_result(out["results"], "string_appending_specific", 4, 0);
  }

TEST_CASE("json output", "[serialisation]")
  {
  SECTION("parsable output")
    {
    perf::config cfg;

    perf::string identity_str(cfg.allocator());
    cfg.get_identity().json_description(identity_str);
    auto identity_object = jsoncons::json::parse_string(identity_str.data());
    check_identity(identity_object);

    perf::string output(cfg.allocator());

    // Format a context as json
      {
      perf::context ctx(cfg, "test");
      dummy_fill(ctx);
      perf::json_writer writer;
      output = writer.dump(ctx);
      }

    auto obj = jsoncons::json::parse_string(output.data());

    check_dummy(obj);
    REQUIRE(identity_object == obj["machine_identity"]);
    }
  }

TEST_CASE("c api", "[core]")
  {
  auto config = perf_init_default_config("c");
  REQUIRE(config);
  
  auto identity = perf_find_identity(config);
  REQUIRE(identity);
  auto desc = perf_identity_description(identity);
  check_identity(jsoncons::json::parse_string(desc), "c");
  
  auto context = perf_init_context(config, "c_test");
  REQUIRE(context);
  
  perf_add_event(context, "test");
  
  auto dumped = perf_dump_context(context);
  jsoncons::json::parse_string(dumped); // Throws on failure
  
  perf_term_context(context);
  perf_term_config(config);
  }

