#include <QString>
#include <QtTest>
#include "perf.hpp"

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
  perf::context ctx(&cfg);
  }

QTEST_APPLESS_MAIN(CppTestTest)

#include "tst_cpptesttest.moc"
