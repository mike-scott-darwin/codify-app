import { redirect } from "next/navigation";

export default async function ShortLink({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/intake?t=${token}`);
}
