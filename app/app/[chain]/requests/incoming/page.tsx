import { ChainBadge } from "@/components/chain-badge";
import { RequestIncomingList } from "@/components/request-incoming-list";
import { Separator } from "@/components/ui/separator";

export default function IncomingRequestsPage({
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
        <h2 className="text-2xl font-bold tracking-tight">Incoming Requests</h2>
        <p className="text-muted-foreground">
          How you can help people with their promotion
        </p>
      </div>
      <Separator className="my-6" />
      <RequestIncomingList chain={params.chain} />
    </div>
  );
}
