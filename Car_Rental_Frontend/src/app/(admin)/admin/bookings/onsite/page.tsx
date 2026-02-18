import { AdminBookingsContainer } from '@/components/features/admin/bookings/AdminBookingsContainer';

export default function AdminOnsiteBookingsPage() {
  return (
    <AdminBookingsContainer
      viewFilter={{ labelKey: 'admin.onsiteWalkIns', walkInOnly: true, bookingType: 'RENTAL' }}
    />
  );
}
