import { ChainBadge } from "@/components/chain-badge";
import { RequestCreateForm } from "@/components/request-create-form";
import { Separator } from "@/components/ui/separator";

export default function NewRequestPage({
  params,
}: {
  params: { chain: number; recipient: `0x${string}` };
}) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">New Request</h2>
        <p className="text-muted-foreground">
          How the influencer can help you with promotion
        </p>
      </div>
      <Separator className="my-6" />
      <RequestCreateForm recipient={params.recipient} chain={params.chain} />
    </div>
  );
}
