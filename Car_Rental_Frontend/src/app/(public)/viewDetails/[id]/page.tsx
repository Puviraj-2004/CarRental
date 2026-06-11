import { DetailsContainer } from '@/features/cars';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailsPage({ params }: PageProps) {
  const { id } = await params; // Awaited route params promise (Next.js 15.5+)
  return <DetailsContainer id={id} />;
}