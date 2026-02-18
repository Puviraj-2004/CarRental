import { AdminBookingsContainer } from '@/components/features/admin/bookings/AdminBookingsContainer';

export default function AdminReplacementBookingsPage() {
  return (
    <AdminBookingsContainer
      viewFilter={{ labelKey: 'admin.replacementBookings', bookingType: 'REPLACEMENT' }}
    />
  );
}
