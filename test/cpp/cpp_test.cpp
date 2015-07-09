#include "perf.hpp"
#include <bandit/bandit.h>

using namespace bandit;
int main(int argc, char* argv[]) { return bandit::run(argc, argv); }

go_bandit([](){
  describe("time points", [](){

    // todo: error checking
    
    it("generates time points", [&](){
      perf::config cfg;
      perf::context ctx(&cfg, "test");

        {
        perf::block blk(&ctx, "busyloop");

        for (uint8_t i = 0; i < (uint8_t)-1; ++i)
          {
          for (uint8_t j = 0; j < (uint8_t)-1; ++j)
            {
            }
          }
        }

        {
        perf::process blk(&ctx, "process");

        for (uint16_t i = 0; i < (uint16_t)-1; ++i)
          {
          }
        blk.event("mid");

        for (uint16_t i = 0; i < (uint16_t)-1; ++i)
          {
          }
        }

      ctx.write("data/cpp.json");
    });
  });
});