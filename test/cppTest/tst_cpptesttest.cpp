#include <QString>
#include <QtTest>
#include "perf.hpp"
#include <iostream>

class CppTestTest : public QObject
  {
  Q_OBJECT

public:
  CppTestTest();

private Q_SLOTS:
  void testCase1();
  };

CppTestTest::CppTestTest()
  {
  }

void CppTestTest::testCase1()
  {
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

  ctx.write("../cpp.json");
  }

QTEST_APPLESS_MAIN(CppTestTest)

#include "tst_cpptesttest.moc"
