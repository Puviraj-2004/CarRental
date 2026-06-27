import { AdminCreateBookingPage } from '@/features/admin/components/AdminCreateBookingPage';

export default function AdminCreateCourtesyBookingPage() {
  return (
    <AdminCreateBookingPage
      type="COURTESY"
      title="Create Courtesy Booking"
      subtitle="Create an admin-only courtesy booking. It blocks vehicle availability and does not require payment."
    />
  );
}
