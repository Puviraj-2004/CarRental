'use client';

import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const GET_ADMIN_REPORTS_QUERY = gql`
  query GetAdminReports($filter: AdminReportFilterInput) {
    adminReports(filter: $filter) {
      totalRevenue
      paid {
        count
        amount
      }
      refunded {
        count
        amount
      }
      pendingPayments {
        count
        amount
      }
      bookingLanes {
        online
        onsite
        courtesy
      }
      bookingStatuses {
        reserved
        confirmed
        ongoing
        completed
        cancelled
        rejected
        expired
      }
      pendingDocuments
      availableCars
      rentedCars
      paymentMethods {
        id
        name
        count
        amount
      }
    }
  }
`;

const money = (value: number) => `${Number(value || 0).toFixed(2)} EUR`;

const MetricCard = ({ label, value, caption }: { label: string; value: string; caption?: string }) => (
  <Card variant="outlined" sx={{ p: 2.5, borderRadius: '8px', height: '100%' }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 900 }}>
      {value}
    </Typography>
    {caption && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {caption}
      </Typography>
    )}
  </Card>
);

const BreakdownRow = ({ label, value }: { label: string; value: number }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 900 }}>
      {value}
    </Typography>
  </Box>
);

export default function AdminReportsPage() {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [appliedFilter, setAppliedFilter] = React.useState<{ startDate?: string; endDate?: string }>({});

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_REPORTS_QUERY, {
    variables: { filter: appliedFilter },
    fetchPolicy: 'network-only',
  });

  const reports = data?.adminReports;

  const handleApply = () => {
    const nextFilter = {
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };
    setAppliedFilter(nextFilter);
    void refetch({ filter: nextFilter });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setAppliedFilter({});
    void refetch({ filter: {} });
  };

  if (loading && !reports) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Revenue, booking, document, fleet, and payment method totals.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={handleApply} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', flex: 1 }}>
                Apply
              </Button>
              <Button variant="outlined" onClick={handleClear} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 4 }}>Unable to load reports.</Alert>}

      {reports && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard label="Total revenue" value={money(reports.totalRevenue)} caption={`${reports.paid.count} paid payment(s)`} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard label="Refunded" value={money(reports.refunded.amount)} caption={`${reports.refunded.count} refund(s)`} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard label="Pending payments" value={money(reports.pendingPayments.amount)} caption={`${reports.pendingPayments.count} pending payment(s)`} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard label="Pending documents" value={String(reports.pendingDocuments)} caption="Awaiting admin review" />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Booking Types</Typography>
                <BreakdownRow label="Online bookings" value={reports.bookingLanes.online} />
                <Divider />
                <BreakdownRow label="Onsite rentals" value={reports.bookingLanes.onsite} />
                <Divider />
                <BreakdownRow label="Courtesy bookings" value={reports.bookingLanes.courtesy} />
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Booking Statuses</Typography>
                {Object.entries(reports.bookingStatuses).map(([label, value]) => (
                  <React.Fragment key={label}>
                    <BreakdownRow label={label.toUpperCase()} value={Number(value)} />
                    <Divider />
                  </React.Fragment>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: '8px', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>Fleet Snapshot</Typography>
                <BreakdownRow label="Available cars" value={reports.availableCars} />
                <Divider />
                <BreakdownRow label="Rented cars" value={reports.rentedCars} />
              </Card>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Payment Method</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Payments</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.paymentMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Alert severity="info">No payment activity found for this filter.</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.paymentMethods.map((method: any) => (
                    <TableRow key={method.id || method.name} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{method.name}</TableCell>
                      <TableCell>{method.count}</TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 900 }}>{money(method.amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}
