'use client';

import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';

const GET_ADMIN_BOOKING_DETAILS_QUERY = gql`
  query GetAdminBookingDetails($id: ID!) {
    booking(id: $id) {
      id
      carId
      userId
      startDate
      endDate
      numberOfDays
      basePrice
      totalPrice
      guestName
      guestPhone
      notes
      status
      type
      reminderSentAt
      createdAt
      updatedAt
      user {
        id
        fullName
        email
        phoneNumber
        emailVerified
        role
      }
      car {
        id
        plateNumber
        basePrice
        status
        primaryImageUrl
        model {
          name
          brand {
            name
          }
        }
        fuelType {
          name
        }
      }
      payment {
        id
        amount
        status
        createdAt
        updatedAt
        paymentMethod {
          name
        }
      }
      documents {
        id
        status
        licenseNumber
        licenseExpiry
        age
        idNumber
        idExpiry
        address
      }
    }
    paymentMethods {
      id
      name
    }
  }
`;

const ADMIN_UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation AdminUpdateBookingStatusFromDetails($id: ID!, $status: BookingStatus!) {
    adminUpdateBookingStatus(id: $id, status: $status) {
      id
      status
      updatedAt
      car {
        id
        status
      }
      payment {
        id
        status
      }
      documents {
        id
        status
      }
    }
  }
`;

const ADMIN_RECORD_BOOKING_PAYMENT_MUTATION = gql`
  mutation AdminRecordBookingPayment($bookingId: ID!, $paymentMethodId: ID!, $amount: Float!) {
    adminRecordBookingPayment(bookingId: $bookingId, paymentMethodId: $paymentMethodId, amount: $amount) {
      id
      amount
      status
      paymentMethod {
        id
        name
      }
    }
  }
`;

const ADMIN_REFUND_BOOKING_PAYMENT_MUTATION = gql`
  mutation AdminRefundBookingPayment($bookingId: ID!) {
    adminRefundBookingPayment(bookingId: $bookingId) {
      id
      status
      amount
      paymentMethod {
        id
        name
      }
    }
  }
`;

const CREATE_CHECKOUT_SESSION_MUTATION = gql`
  mutation AdminCreateCheckoutSession($bookingId: ID!) {
    createCheckoutSession(bookingId: $bookingId) {
      url
      sessionId
    }
  }
`;

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.25 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', overflowWrap: 'anywhere' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const StatusBadge = ({ status }: { status: string }) => {
  const tone =
    status === 'CONFIRMED' || status === 'COMPLETED' || status === 'APPROVED' || status === 'PAID'
      ? { bgcolor: 'success.light', color: 'success.dark' }
      : status === 'CANCELLED' || status === 'REJECTED' || status === 'FAILED' || status === 'EXPIRED'
        ? { bgcolor: 'error.light', color: 'error.dark' }
        : status === 'ONGOING'
          ? { bgcolor: 'info.light', color: 'info.dark' }
          : { bgcolor: 'warning.light', color: 'warning.dark' };

  return (
    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '8px', fontSize: 12, fontWeight: 800, ...tone }}>
      {status}
    </Box>
  );
};

export default function AdminBookingDetailsPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const { showToast } = useToast();
  const [paymentMethodId, setPaymentMethodId] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentLink, setPaymentLink] = React.useState('');

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_BOOKING_DETAILS_QUERY, {
    variables: { id: bookingId },
    skip: !bookingId,
    fetchPolicy: 'network-only',
  });

  const [updateStatus, { loading: updatingStatus }] = useMutation(
    ADMIN_UPDATE_BOOKING_STATUS_MUTATION,
    { onCompleted: () => refetch() },
  );
  const [recordPayment, { loading: recordingPayment }] = useMutation(
    ADMIN_RECORD_BOOKING_PAYMENT_MUTATION,
    { onCompleted: () => refetch() },
  );
  const [refundPayment, { loading: refundingPayment }] = useMutation(
    ADMIN_REFUND_BOOKING_PAYMENT_MUTATION,
    { onCompleted: () => refetch() },
  );
  const [createCheckoutSession, { loading: creatingPaymentLink }] = useMutation(
    CREATE_CHECKOUT_SESSION_MUTATION,
  );

  const booking = data?.booking;
  const paymentMethods = data?.paymentMethods ?? [];

  React.useEffect(() => {
    if (booking?.totalPrice != null) {
      setPaymentAmount(String(Number(booking.totalPrice).toFixed(2)));
    }
  }, [booking?.totalPrice]);

  const handleStatusChange = async (status: string) => {
    if (!booking) return;
    try {
      await updateStatus({ variables: { id: booking.id, status } });
      showToast(`Booking status updated to ${status}.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update booking status.', 'error');
    }
  };

  const handleRecordPayment = async () => {
    if (!booking) return;
    const amount = Number(paymentAmount);
    if (!paymentMethodId || !Number.isFinite(amount) || amount <= 0) {
      showToast('Select a payment method and enter a valid amount.', 'error');
      return;
    }

    try {
      await recordPayment({
        variables: {
          bookingId: booking.id,
          paymentMethodId,
          amount,
        },
      });
      showToast('Payment recorded successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to record payment.', 'error');
    }
  };

  const handleRefundPayment = async () => {
    if (!booking) return;
    if (!window.confirm('Do you want to refund this booking payment?')) return;

    try {
      await refundPayment({ variables: { bookingId: booking.id } });
      showToast('Payment refunded successfully.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to refund payment.', 'error');
    }
  };

  const handleGeneratePaymentLink = async () => {
    if (!booking) return;
    try {
      const result = await createCheckoutSession({ variables: { bookingId: booking.id } });
      const url = result.data?.createCheckoutSession?.url;
      if (url) {
        setPaymentLink(url);
        showToast('Stripe payment link generated.', 'success');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate payment link.', 'error');
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    showToast('Payment link copied.', 'success');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return <Alert severity="error">Unable to load booking details.</Alert>;
  }

  const customerName = booking.guestName || booking.user?.fullName || booking.user?.email || 'Customer';
  const customerPhone = booking.guestPhone || booking.user?.phoneNumber || '-';
  const startDate = new Date(booking.startDate).toLocaleDateString();
  const endDate = new Date(booking.endDate).toLocaleDateString();
  const isCourtesy = booking.type === 'COURTESY';
  const isPayableRental = booking.type === 'RENTAL';
  const isOnsiteRental = isPayableRental && !booking.userId;
  const canRecordPayment = isPayableRental && booking.payment?.status !== 'PAID';
  const canRefundPayment = isPayableRental && booking.payment?.status === 'PAID';
  const canUploadDocuments = isPayableRental && !booking.documents && !['CANCELLED', 'REJECTED', 'COMPLETED'].includes(booking.status);
  const onsiteReadiness = [
    { label: 'Guest name', ready: !isOnsiteRental || !!booking.guestName },
    { label: 'Phone number', ready: !isOnsiteRental || !!booking.guestPhone },
    { label: 'Approved documents', ready: !isOnsiteRental || booking.documents?.status === 'APPROVED' },
    { label: 'Paid payment record', ready: !isOnsiteRental || booking.payment?.status === 'PAID' },
  ];
  const onsiteMissing = onsiteReadiness.filter((item) => !item.ready).map((item) => item.label);

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Button component={Link} href="/admin/bookings" sx={{ mb: 1, textTransform: 'none', fontWeight: 700 }}>
            Back to bookings
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Booking #{booking.id.slice(0, 8)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Full reservation, customer, vehicle, payment, and verification details.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StatusBadge status={booking.status} />
          <TextField
            select
            size="small"
            label="Change status"
            value={booking.status}
            disabled={updatingStatus}
            onChange={(event) => handleStatusChange(event.target.value)}
            sx={{ minWidth: 190 }}
          >
            {['RESERVED', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Reservation
            </Typography>
            {isOnsiteRental && onsiteMissing.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Onsite rental is not ready: {onsiteMissing.join(', ')}.
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FieldRow label="Start date" value={startDate} />
                <Divider />
                <FieldRow label="End date" value={endDate} />
                <Divider />
                <FieldRow label="Days" value={booking.numberOfDays} />
                <Divider />
                <FieldRow label="Type" value={booking.type} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FieldRow label="Base price" value={`${Number(booking.basePrice).toFixed(2)} EUR`} />
                <Divider />
                <FieldRow label="Total price" value={`${Number(booking.totalPrice).toFixed(2)} EUR`} />
                <Divider />
                <FieldRow label="Created" value={new Date(booking.createdAt).toLocaleDateString()} />
                <Divider />
                <FieldRow label="Updated" value={new Date(booking.updatedAt).toLocaleDateString()} />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {booking.notes || 'No notes were added to this booking.'}
            </Typography>
          </Card>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Vehicle
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ borderRadius: '8px', overflow: 'hidden', bgcolor: 'grey.100', aspectRatio: '4/3' }}>
                  {booking.car.primaryImageUrl ? (
                    <img src={booking.car.primaryImageUrl} alt={booking.car.plateNumber} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : null}
                </Box>
              </Grid>
              <Grid item xs={12} sm={8}>
                <FieldRow label="Car" value={`${booking.car.model.brand.name} ${booking.car.model.name}`} />
                <Divider />
                <FieldRow label="Plate number" value={booking.car.plateNumber} />
                <Divider />
                <FieldRow label="Fuel type" value={booking.car.fuelType?.name || '-'} />
                <Divider />
                <FieldRow label="Car status" value={<StatusBadge status={booking.car.status} />} />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Customer
            </Typography>
            <FieldRow label="Name" value={customerName} />
            <Divider />
            <FieldRow label="Phone" value={customerPhone} />
            <Divider />
            <FieldRow label="Email" value={booking.user?.email || '-'} />
            <Divider />
            <FieldRow label="Email verified" value={booking.user?.emailVerified ? 'Yes' : 'No'} />
            <Divider />
            <FieldRow label="Role" value={booking.user?.role || 'Guest'} />
          </Card>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Payment
            </Typography>
            {booking.payment ? (
              <>
                <FieldRow label="Status" value={<StatusBadge status={booking.payment.status} />} />
                <Divider />
                <FieldRow label="Amount" value={`${Number(booking.payment.amount).toFixed(2)} EUR`} />
                <Divider />
                <FieldRow label="Method" value={booking.payment.paymentMethod?.name || '-'} />
              </>
            ) : (
              <Alert severity={isCourtesy ? 'info' : 'warning'}>
                {isCourtesy ? 'No payment is required for courtesy bookings.' : 'No payment record exists yet.'}
              </Alert>
            )}

            {canRecordPayment && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                  Record Payment
                </Typography>
                <TextField
                  select
                  label="Payment method"
                  value={paymentMethodId}
                  onChange={(event) => setPaymentMethodId(event.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {paymentMethods.map((method: any) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={recordingPayment}
                  onClick={handleRecordPayment}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', mb: 1 }}
                >
                  {recordingPayment ? <CircularProgress size={20} color="inherit" /> : 'Record Payment'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={creatingPaymentLink}
                  onClick={handleGeneratePaymentLink}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                >
                  {creatingPaymentLink ? <CircularProgress size={20} /> : 'Generate Stripe Link'}
                </Button>
                {paymentLink && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere', display: 'block', mb: 1 }}>
                      {paymentLink}
                    </Typography>
                    <Button variant="text" onClick={handleCopyPaymentLink} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Copy Link
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            {canRefundPayment && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                disabled={refundingPayment}
                onClick={handleRefundPayment}
                sx={{ mt: 3, textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
              >
                {refundingPayment ? <CircularProgress size={20} /> : 'Refund Payment'}
              </Button>
            )}
          </Card>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Documents
            </Typography>
            {booking.documents ? (
              <>
                <FieldRow label="Status" value={<StatusBadge status={booking.documents.status} />} />
                <Divider />
                <FieldRow label="License" value={booking.documents.licenseNumber || '-'} />
                <Divider />
                <FieldRow label="License expiry" value={booking.documents.licenseExpiry ? new Date(booking.documents.licenseExpiry).toLocaleDateString() : '-'} />
                <Divider />
                <FieldRow label="Age" value={booking.documents.age || '-'} />
                <Divider />
                <FieldRow label="ID number" value={booking.documents.idNumber || '-'} />
                <Divider />
                <FieldRow label="Address" value={booking.documents.address || '-'} />
                <Button component={Link} href={`/admin/bookings/${booking.id}/documents`} variant="outlined" fullWidth sx={{ mt: 2, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
                  Review Documents
                </Button>
              </>
            ) : (
              <>
                <Alert severity="info">No documents uploaded for this booking.</Alert>
                {canUploadDocuments && (
                  <Button component={Link} href={`/admin/bookings/${booking.id}/documents/upload`} variant="contained" fullWidth sx={{ mt: 2, textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}>
                    Upload Documents
                  </Button>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
