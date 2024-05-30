"use client";

import { SiteConfigContracts } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAccount, useReadContract } from "wagmi";
import { requestTokenAbi } from "@/contracts/abi/request-token";
import { addressToShortAddress } from "@/lib/converters";
import { isAddressEqual, zeroAddress } from "viem";
import Link from "next/link";
import { Button } from "./ui/button";

export function UserCard(props: {
  user: `0x${string}`;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  /**
   * Define user stats
   */
  const { data: successes } = useReadContract({
    address: props.contracts.requestToken,
    abi: requestTokenAbi,
    functionName: "recipientSuccesses",
    args: [props.user],
    chainId: props.contracts.chain.id,
  });
  const { data: fails } = useReadContract({
    address: props.contracts.requestToken,
    abi: requestTokenAbi,
    functionName: "recipientFails",
    args: [props.user],
    chainId: props.contracts.chain.id,
  });

  return (
    <div className="w-full flex flex-row gap-4 border rounded px-6 py-8">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            👤
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-2">
        {successes != undefined && (
          <p className="text-sm">
            <span className="font-bold">{successes.toString()}</span>
            <span className="text-muted-foreground"> Completed Requests</span>
          </p>
        )}
        {fails != undefined && (
          <p className="text-sm">
            <span className="font-bold">{fails.toString()}</span>
            <span className="text-muted-foreground"> Failed Requests</span>
          </p>
        )}
        <div className="flex flex-row gap-4">
          <p className="text-sm">
            <a
              href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${props.user}`}
              target="_blank"
              className="underline underline-offset-4"
            >
              {addressToShortAddress(props.user)}
            </a>
          </p>
        </div>
        {!isAddressEqual(props.user, address || zeroAddress) && (
          <Link
            href={`/${props.contracts.chain.id}/requests/new/${props.user}`}
          >
            <Button variant="default" className="mt-2">
              Send Request
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
