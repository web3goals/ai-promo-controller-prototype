"use client";

import { SiteConfigContracts } from "@/config/site";
import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { requestTokenAbi } from "@/contracts/abi/request-token";
import { DialogDescription } from "@radix-ui/react-dialog";

export function RequestCompleteDialog(props: {
  request: string;
  contracts: SiteConfigContracts;
  onComplete?: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    imageUri: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUri: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

      // Send request to complete request
      const { request } = await publicClient.simulateContract({
        address: props.contracts.requestToken,
        abi: requestTokenAbi,
        functionName: "complete",
        args: [BigInt(props.request), values.imageUri],
        chain: props.contracts.chain,
        account: address,
      });
      const txHash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "Request completed 👌",
      });
      props.onComplete?.();
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Complete Request #{props.request}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="imageUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link to image with proof of task completion
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      disabled={isFormSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
