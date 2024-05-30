import { ChainBadge } from "@/components/chain-badge";
import { Separator } from "@/components/ui/separator";
import { UserList } from "@/components/user-list";

export default function UsersPage({ params }: { params: { chain: number } }) {
  return (
    <div className="container py-10 lg:px-80">
      <div className="mb-2">
        <ChainBadge chain={params.chain} />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Explore</h2>
        <p className="text-muted-foreground">
          Influencers who can help with promotion
        </p>
      </div>
      <Separator className="my-6" />
      <UserList chain={params.chain} />
    </div>
  );
}
