import sys, os
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../../bindings/python")
import perf

cfg = perf.Config()
print(cfg.identity)

ctx = perf.Context(cfg, "test")

ev1 = perf.MetaEvent(ctx, "pork1")
ev2 = perf.MetaEvent(ctx, "pork2")

import time

with perf.Event(ev1):
    time.sleep(0.1)

with perf.Event(ev1):
    time.sleep(0.2)

    with perf.Event(ev2):
        time.sleep(0.1)

print(ctx)
