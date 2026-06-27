import { AdminCreateBookingPage } from '@/features/admin/components/AdminCreateBookingPage';

export default function AdminCreateOnsiteRentalPage() {
  return (
    <AdminCreateBookingPage
      type="RENTAL"
      title="Create Onsite Rental"
      subtitle="Create a walk-in rental without linking a user account. Customer name and phone number are required."
    />
  );
}
