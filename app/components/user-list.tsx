"use client";

import { requestTokenAbi } from "@/contracts/abi/request-token";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { useReadContract } from "wagmi";
import EntityList from "./entity-list";
import { UserCard } from "./user-card";

export function UserList(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);

  const { data: users } = useReadContract({
    address: contracts.requestToken,
    abi: requestTokenAbi,
    functionName: "getRecipients",
    args: [],
    chainId: contracts.chain.id,
  });

  console.log({ users });

  return (
    <EntityList
      entities={users?.toReversed()}
      renderEntityCard={(user, index) => (
        <UserCard key={index} user={user} contracts={contracts} />
      )}
      noEntitiesText={`No influencers on ${contracts.chain.name} 😐`}
      className="gap-6"
    />
  );
}
