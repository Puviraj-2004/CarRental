import { EditCarContainer } from '@/features/cars';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCarPage({ params }: PageProps) {
  const { id } = await params; // Awaited route params promise
  return <EditCarContainer id={id} />;
}