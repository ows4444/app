import { networkEvents } from "@/shared/lib/infra/network-events";

import { useNetworkStore } from "./network.store";

networkEvents.online.subscribe((online) => {
  useNetworkStore.getState().setOnline(online);
});

networkEvents.slow.subscribe((slow) => {
  useNetworkStore.getState().setSlow(slow);
});
