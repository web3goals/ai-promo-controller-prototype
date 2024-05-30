import { ChainBadge } from "@/components/chain-badge";
import { RequestOutgoingList } from "@/components/request-outgoing-list";
import { Separator } from "@/components/ui/separator";

export default function OutgoingRequestsPage({
  params,
}: {
  params: { chain: number };
}) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Outgoing Requests</h2>
        <p className="text-muted-foreground">
          How influencers can help with your promotion
        </p>
      </div>
      <Separator className="my-6" />
      <RequestOutgoingList chain={params.chain} />
    </div>
  );
}
