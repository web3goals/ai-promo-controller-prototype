"use client";

import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useEffect, useState } from "react";
import { useAccount, useInfiniteReadContracts } from "wagmi";
import EntityList from "./entity-list";
import { isAddressEqual } from "viem";
import { requestTokenAbi } from "@/contracts/abi/request-token";
import { RequestCard } from "./request-card";

const LIMIT = 42;

export function RequestOutgoingList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { address } = useAccount();
  const [requests, setRequests] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `request_outgoing_list_${contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: contracts.requestToken,
            abi: requestTokenAbi,
            functionName: "ownerOf",
            args: [BigInt(pageParam + i)],
            chainId: contracts.chain.id,
          } as const)
      );
    },
    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        return lastPageParam + 1;
      },
    },
  });

  useEffect(() => {
    setRequests(undefined);
    if (data && address) {
      const requests: string[] = [];
      const dataFirstPage = (data as any).pages[0];
      for (let i = 0; i < dataFirstPage.length; i++) {
        const dataPageElement = dataFirstPage[i];
        if (
          dataPageElement.result &&
          isAddressEqual(dataPageElement.result, address)
        ) {
          requests.push(String(i));
        }
      }
      setRequests(requests);
    }
  }, [data, address]);

  return (
    <EntityList
      entities={requests?.toReversed()}
      renderEntityCard={(request, index) => (
        <RequestCard key={index} request={request} contracts={contracts} />
      )}
      noEntitiesText={`No requests on ${contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
