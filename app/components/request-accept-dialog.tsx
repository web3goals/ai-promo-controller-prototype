"use client";

import { SiteConfigContracts } from "@/config/site";
import useError from "@/hooks/useError";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { requestTokenAbi } from "@/contracts/abi/request-token";

export function RequestAcceptDialog(props: {
  request: string;
  contracts: SiteConfigContracts;
  onAccept?: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function onSubmit() {
    try {
      setIsFormSubmitting(true);

      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Check chain
      if (chainId !== props.contracts.chain.id) {
        throw new Error(`You need to connect to ${props.contracts.chain.name}`);
      }

      // Send request to accept request
      const { request } = await publicClient.simulateContract({
        address: props.contracts.requestToken,
        abi: requestTokenAbi,
        functionName: "accept",
        args: [BigInt(props.request)],
        chain: props.contracts.chain,
        account: address,
      });
      const txHash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "Request accepted 👌",
      });
      props.onAccept?.();
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <AlertDialogTrigger asChild>
        <Button variant="default" size="sm">
          Accept
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to accept the request #{props.request}?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={isFormSubmitting} onClick={onSubmit}>
            {isFormSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Accept
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
