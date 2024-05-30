"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useAccount } from "wagmi";
import { SiteHeaderConnectButton } from "./site-header-connect-button";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { supportedChains } from "./web3-provider";

export function SiteHeader() {
  const { address } = useAccount();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block text-foreground font-bold">
              {siteConfig.emoji}{" "}
              <span className="hidden md:inline-block">{siteConfig.name}</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-8">
          <SiteHeaderConnectButton />
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:block text-sm font-medium text-muted-foreground">
              Menu
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="hidden md:block text-sm font-medium text-muted-foreground"
              >
                <DropdownMenuItem>GitHub</DropdownMenuItem>
              </Link>
              {supportedChains.map((chain, index) => (
                <div key={index}>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{chain.name}</DropdownMenuLabel>
                  <Link
                    href={`/${chain.id}/users`}
                    className="hidden md:block text-sm font-medium text-muted-foreground"
                  >
                    <DropdownMenuItem>Explore</DropdownMenuItem>
                  </Link>
                  {address && (
                    <Link
                      href={`/${chain.id}/requests/incoming`}
                      className="hidden md:block text-sm font-medium text-muted-foreground"
                    >
                      <DropdownMenuItem>Incoming Requests</DropdownMenuItem>
                    </Link>
                  )}
                  {address && (
                    <Link
                      href={`/${chain.id}/requests/outgoing`}
                      className="hidden md:block text-sm font-medium text-muted-foreground"
                    >
                      <DropdownMenuItem>Outgoing Requests</DropdownMenuItem>
                    </Link>
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
