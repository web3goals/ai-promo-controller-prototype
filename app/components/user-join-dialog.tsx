"use client";

import { requestTokenAbi } from "@/contracts/abi/request-token";
import useError from "@/hooks/useError";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { isAddressEqual, zeroAddress } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";
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

export function UserJoinDialog(props: { chain: number }) {
  const { contracts } = useSiteConfigContracts(props.chain);
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isUser, setIsUser] = useState(true);

  /**
   * Load users
   */
  const { data: users } = useReadContract({
    address: contracts.requestToken,
    abi: requestTokenAbi,
    functionName: "getRecipients",
    args: [],
    chainId: contracts.chain.id,
  });

  /**
   * Define if connected account is user
   */
  useEffect(() => {
    setIsUser(true);
    if (users) {
      for (let i = 0; i < users.length; i++) {
        if (isAddressEqual(users[i], address || zeroAddress)) {
          return;
        }
        setIsUser(false);
      }
    }
  }, [users, address]);

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
      if (chainId !== contracts.chain.id) {
        throw new Error(`You need to connect to ${contracts.chain.name}`);
      }

      // Send request to accept request
      const { request } = await publicClient.simulateContract({
        address: contracts.requestToken,
        abi: requestTokenAbi,
        functionName: "becomeRecipient",
        args: [],
        chain: contracts.chain,
        account: address,
      });
      const txHash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "Joined 👌",
        description: "Please reload the page",
      });
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  if (isUser) {
    return <></>;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <AlertDialogTrigger asChild>
        <Button variant="default">Join Platform</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to join the platform?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button disabled={isFormSubmitting} onClick={onSubmit}>
            {isFormSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Join
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
