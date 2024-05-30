import { SiteConfigContracts } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAccount, useReadContract } from "wagmi";
import { Skeleton } from "./ui/skeleton";
import { addressToShortAddress } from "@/lib/converters";
import { erc20Abi, formatEther, isAddressEqual, zeroAddress } from "viem";
import { requestTokenAbi } from "@/contracts/abi/request-token";
import { RequestAcceptDialog } from "./request-accept-dialog";
import { RequestCompleteDialog } from "./request-complete-dialog";

export function RequestCard(props: {
  request: string;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  /**
   * Define request data
   */
  const { data: requestOwner, isFetched: isRequestOwnerFetched } =
    useReadContract({
      address: props.contracts.requestToken,
      abi: requestTokenAbi,
      functionName: "ownerOf",
      args: [BigInt(props.request)],
      chainId: props.contracts.chain.id,
    });
  const {
    data: requestContent,
    isFetched: isRequestContentFetched,
    refetch: refetchRequestContent,
  } = useReadContract({
    address: props.contracts.requestToken,
    abi: requestTokenAbi,
    functionName: "contents",
    args: [BigInt(props.request)],
    chainId: props.contracts.chain.id,
  });

  /**
   * Define request payment token symbol
   */
  const {
    data: requestPaymentTokenSymbol,
    isFetched: isRequestPaymentTokenSymbolFetched,
  } = useReadContract({
    address: requestContent?.[3] || zeroAddress,
    abi: erc20Abi,
    functionName: "symbol",
    chainId: props.contracts.chain.id,
  });

  /**
   * Define request status
   */
  let requestStatus:
    | "UNKNOWN"
    | "AWAITING_ACCEPTANCE"
    | "AWAITING_COMPLETION"
    | "CLOSED_SUCCESSFULLY"
    | "CLOSED_FAILED" = "UNKNOWN";
  if (requestContent?.[5]?.toString() == "0") {
    requestStatus = "AWAITING_ACCEPTANCE";
  } else if (requestContent?.[6]?.toString() == "0") {
    requestStatus = "AWAITING_COMPLETION";
  } else if (requestContent?.[8] == true) {
    requestStatus = "CLOSED_SUCCESSFULLY";
  } else if (requestContent?.[8] == false) {
    requestStatus = "CLOSED_FAILED";
  } else {
    requestStatus = "UNKNOWN";
  }

  if (
    !isRequestOwnerFetched ||
    !requestOwner ||
    !isRequestContentFetched ||
    !requestContent ||
    !requestPaymentTokenSymbol ||
    !isRequestPaymentTokenSymbolFetched
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return (
    <div className="w-full flex flex-row gap-4 border rounded px-6 py-8">
      {/* Icon */}
      <div>
        <Avatar className="size-14">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-2xl bg-secondary-foreground">
            {requestStatus == "UNKNOWN" && "❓"}
            {requestStatus == "AWAITING_ACCEPTANCE" && "🔥"}
            {requestStatus == "AWAITING_COMPLETION" && "⌛"}
            {requestStatus == "CLOSED_SUCCESSFULLY" && "✅"}
            {requestStatus == "CLOSED_FAILED" && "❌"}
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full flex flex-col items-start gap-4">
        {/* Number and status */}
        <p className="text-xl font-bold">
          Request #{props.request}
          <span className="font-normal text-muted-foreground">
            {" — "}
            {requestStatus == "UNKNOWN" && "Unknown Status"}
            {requestStatus == "AWAITING_ACCEPTANCE" && "Awaiting Acceptance"}
            {requestStatus == "AWAITING_COMPLETION" && "Awaiting Completion"}
            {requestStatus == "CLOSED_SUCCESSFULLY" && "Closed Successfully"}
            {requestStatus == "CLOSED_FAILED" && "Closed Failed"}
          </span>
        </p>
        <div className="flex flex-col gap-3">
          {/* Task */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Task:</p>
            <p className="text-sm">{requestContent[1]}</p>
          </div>
          {/* Recipient */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Influencer:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${requestContent[0]}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(requestContent[0])}
              </a>
            </p>
          </div>
          {/* Owner */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Sender:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${requestOwner}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(requestOwner)}
              </a>
            </p>
          </div>
          {/* Created */}
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Sent:</p>
            <p className="text-sm break-all">
              {new Date(Number(requestContent[4]) * 1000).toLocaleString()}
            </p>
          </div>
          {/* Payment */}
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="text-sm text-muted-foreground">Payment:</p>
            <p className="text-sm break-all">
              {formatEther(BigInt(requestContent[2] || 0))}{" "}
              {requestPaymentTokenSymbol}
            </p>
          </div>
          {/* Complete Image URI */}
          {requestContent[7].length > 0 && (
            <div className="flex flex-col md:flex-row md:gap-3">
              <p className="text-sm text-muted-foreground">Result:</p>
              <p className="text-sm break-all">
                <a
                  href={requestContent[7]}
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {requestContent[7]}
                </a>
              </p>
            </div>
          )}
        </div>
        {requestStatus === "AWAITING_ACCEPTANCE" &&
          address &&
          isAddressEqual(requestContent[0], address) && (
            <RequestAcceptDialog
              request={props.request}
              contracts={props.contracts}
              onAccept={() => refetchRequestContent()}
            />
          )}
        {requestStatus === "AWAITING_COMPLETION" &&
          address &&
          isAddressEqual(requestContent[0], address) && (
            <RequestCompleteDialog
              request={props.request}
              contracts={props.contracts}
              onComplete={() => refetchRequestContent()}
            />
          )}
      </div>
    </div>
  );
}
