"use client";

import { SiteConfigContracts } from "@/config/site";
import { requestTokenAbi } from "@/contracts/abi/request-token";
import useEns from "@/hooks/useEns";
import { addressToShortAddress } from "@/lib/converters";
import Link from "next/link";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export function UserCard(props: {
  user: `0x${string}`;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  /**
   * Define ENS data
   */
  const {
    name: ensName,
    avatar: ensAvatar,
    description: ensDescription,
    twitter: ensTwitter,
    telegram: ensTelegram,
  } = useEns(props.user);

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
          <AvatarImage src={ensAvatar || ""} alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            👤
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-2">
        {ensName && <p className="text-xl font-bold">{ensName}</p>}
        {ensDescription && <p className="text-sm">{ensDescription}</p>}
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
          {ensTwitter && (
            <p className="text-sm">
              <a
                href={`https://twitter.com/${ensTwitter}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                Twitter
              </a>
            </p>
          )}
          {ensTelegram && (
            <p className="text-sm">
              <a
                href={`https://t.me/${ensTelegram}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                Telegram
              </a>
            </p>
          )}
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
