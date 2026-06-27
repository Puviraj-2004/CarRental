'use client';

import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useToast } from '@/lib/ToastContext';

type AdminCreateBookingType = 'RENTAL' | 'COURTESY';

const GET_ADMIN_AVAILABLE_CARS_QUERY = gql`
  query GetAdminAvailableCarsForBooking($startDate: String!, $endDate: String!, $pagination: PaginationInput) {
    availableCars(startDate: $startDate, endDate: $endDate, pagination: $pagination) {
      items {
        id
        plateNumber
        basePrice
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
    }
  }
`;

const ADMIN_CREATE_BOOKING_MUTATION = gql`
  mutation AdminCreateBooking($input: CreateBookingInput!) {
    adminCreateBooking(input: $input) {
      id
      status
      type
      totalPrice
    }
  }
`;

const toBookingDate = (date: string) => new Date(`${date}T12:00:00`).toISOString();

export const AdminCreateBookingPage: React.FC<{
  type: AdminCreateBookingType;
  title: string;
  subtitle: string;
}> = ({ type, title, subtitle }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [carId, setCarId] = React.useState('');
  const [guestName, setGuestName] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const canQueryCars = Boolean(startDate && endDate && new Date(endDate) > new Date(startDate));

  const { data, loading: loadingCars, error: carsError } = useQuery(GET_ADMIN_AVAILABLE_CARS_QUERY, {
    variables: {
      startDate: canQueryCars ? toBookingDate(startDate) : '',
      endDate: canQueryCars ? toBookingDate(endDate) : '',
      pagination: { page: 1, pageSize: 100 },
    },
    skip: !canQueryCars,
    fetchPolicy: 'network-only',
  });

  const [adminCreateBooking, { loading: creating }] = useMutation(ADMIN_CREATE_BOOKING_MUTATION);

  const cars = data?.availableCars?.items ?? [];
  const selectedCar = cars.find((car: any) => car.id === carId);
  const numberOfDays = canQueryCars
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const estimatedTotal = type === 'COURTESY' ? 0 : Number(selectedCar?.basePrice ?? 0) * numberOfDays;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canQueryCars) {
      showToast('Select a valid start and end date.', 'error');
      return;
    }
    if (!carId || !guestName.trim() || !guestPhone.trim()) {
      showToast('Car, customer name, and phone number are required.', 'error');
      return;
    }

    try {
      const result = await adminCreateBooking({
        variables: {
          input: {
            carId,
            startDate: toBookingDate(startDate),
            endDate: toBookingDate(endDate),
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim(),
            notes: notes.trim() || undefined,
            type,
          },
        },
      });

      const bookingId = result.data?.adminCreateBooking?.id;
      showToast(type === 'COURTESY' ? 'Courtesy booking created.' : 'Onsite rental created.', 'success');
      router.push(bookingId ? `/admin/bookings/${bookingId}` : type === 'COURTESY' ? '/admin/bookings/courtesy' : '/admin/bookings/onsite');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create booking.', 'error');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 3, borderRadius: '8px' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setCarId('');
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End date"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setCarId('');
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Available car"
                value={carId}
                onChange={(event) => setCarId(event.target.value)}
                fullWidth
                required
                disabled={!canQueryCars || loadingCars}
                helperText={!canQueryCars ? 'Select dates first.' : loadingCars ? 'Loading available cars...' : `${cars.length} available car(s)`}
              >
                {cars.map((car: any) => (
                  <MenuItem key={car.id} value={car.id}>
                    {car.model.brand.name} {car.model.name} - {car.plateNumber} - {Number(car.basePrice).toFixed(2)} EUR/day
                  </MenuItem>
                ))}
              </TextField>
              {carsError && <Alert severity="error" sx={{ mt: 2 }}>Unable to load available cars.</Alert>}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Customer name" value={guestName} onChange={(event) => setGuestName(event.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Customer phone" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} multiline minRows={3} fullWidth />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                Estimated total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {type === 'COURTESY' ? 'No payment required' : `${estimatedTotal.toFixed(2)} EUR`}
              </Typography>
            </Box>
            <Button type="submit" variant="contained" disabled={creating || loadingCars} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', minWidth: 180 }}>
              {creating ? <CircularProgress size={20} color="inherit" /> : 'Create Booking'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
