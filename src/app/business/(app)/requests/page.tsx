import { Plus } from "lucide-react";
import { ActionFeedback, Btn, Card, CardTitle, RequestList } from "@/components/business/ui";
import { loadRequests, requireBusiness } from "@/lib/business/data";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RequestsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const rows = await loadRequests(ctx, 200);
  const open = rows.filter((r) => r.status !== "completed");
  const done = rows.filter((r) => r.status === "completed");
  return (
    <>
      <ActionFeedback sp={sp} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Update requests</h1>
          <p className="mt-1 max-w-xl text-sm text-be-grey">Ask for any change or new feature on your website. We aim to deliver within 24 hours and keep you posted here.</p>
        </div>
        <Btn href="/business/requests/new" tone="secondary"><Plus size={16} aria-hidden /> New request</Btn>
      </div>
      <Card>
        <CardTitle>Open ({open.length})</CardTitle>
        <RequestList rows={open} />
      </Card>
      {done.length > 0 && (
        <Card>
          <CardTitle>Completed ({done.length})</CardTitle>
          <RequestList rows={done} />
        </Card>
      )}
    </>
  );
}
